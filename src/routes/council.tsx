import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PanelLeft, PanelLeftClose, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilSession,
} from "@/data/council";

export const Route = createFileRoute("/council")({
  head: () => ({
    meta: [{ title: "Консилиум — BI AQYL" }],
  }),
  component: CouncilPage,
});

const TODAY = "30.07.2026";
const MAX_PERSONAS = 3;

// Static map so Tailwind's JIT scanner sees every class literally — a
// runtime `p.color.replace("bg-", "border-l-")` would never be picked up.
const PERSONA_BORDER_CLASS: Record<string, string> = {
  "bg-amber-700": "border-l-amber-700",
  "bg-violet-600": "border-l-violet-600",
  "bg-blue-600": "border-l-blue-600",
  "bg-teal-700": "border-l-teal-700",
  "bg-orange-700": "border-l-orange-700",
  "bg-fuchsia-600": "border-l-fuchsia-600",
  "bg-rose-700": "border-l-rose-700",
  "bg-indigo-600": "border-l-indigo-600",
  "bg-red-700": "border-l-red-700",
  "bg-cyan-700": "border-l-cyan-700",
  "bg-emerald-700": "border-l-emerald-700",
  "bg-stone-600": "border-l-stone-600",
};

function AvatarStack({ personaIds }: { personaIds: string[] }) {
  const shown = personaIds.slice(0, 2);
  const rest = personaIds.length - shown.length;
  const names = personaIds.map((id) => getPersona(id).name).join(", ");
  return (
    <div role="img" aria-label={`Участники: ${names}`} className="flex items-center -space-x-2">
      {shown.map((id) => {
        const p = getPersona(id);
        return (
          <PersonaAvatar
            key={id}
            aria-hidden
            initials={p.initials}
            size="xs"
            ring
            className={p.color}
          />
        );
      })}
      {rest > 0 && (
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-muted-foreground"
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Groups consecutive messages from the same author — that's what a "burst" of 2 short
 *  messages in a row looks like, both structurally and visually (avatar/name shown once). */
function groupMessages(
  messages: CouncilChatMessage[],
): { author: string; items: CouncilChatMessage[] }[] {
  const groups: { author: string; items: CouncilChatMessage[] }[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.author === m.author && !m.replyTo) last.items.push(m);
    else groups.push({ author: m.author, items: [m] });
  }
  return groups;
}

function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"contacts" | "topic">("contacts");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [personaQuery, setPersonaQuery] = useState("");
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);

  const personaResults = useMemo(() => {
    const q = personaQuery.trim().toLowerCase();
    if (!q) return COUNCIL_PERSONAS;
    return COUNCIL_PERSONAS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.inspiredBy.toLowerCase().includes(q),
    );
  }, [personaQuery]);

  const togglePersona = (id: string) =>
    setPersonaIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_PERSONAS
          ? prev
          : [...prev, id],
    );

  const caseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const start = () => {
    if (!card || personaIds.length === 0) return;
    const topic = {
      title: card.title,
      summary: card.executive_summary,
      insight: card.core_insight,
      businessUnit: card.business_unit,
    };
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      messages: buildOpeningMessages(personaIds, topic),
      topic,
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {step === "contacts" ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-card-foreground">Кто в совете?</p>
                <p className="text-xs text-muted-foreground">
                  Выберите до {MAX_PERSONAS} участников
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                {personaIds.length}/{MAX_PERSONAS}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={personaQuery}
                onChange={(e) => setPersonaQuery(e.target.value)}
                placeholder="Найдите персону по имени или стилю"
                aria-label="Найдите персону по имени или стилю"
                className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            {personaIds.length >= 2 && !hasLikelyDisagreement(personaIds) && (
              <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-card-foreground">
                В этом составе взгляды похожи — спора может не быть. Попробуйте добавить
                контрарианку или скептика.
              </p>
            )}

            <button
              type="button"
              onClick={() => setPersonaIds(pickDefaultTrio())}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Подобрать автоматически
            </button>

            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {personaResults.map((p) => {
                const isSelected = personaIds.includes(p.id);
                const disabled = !isSelected && personaIds.length >= MAX_PERSONAS;
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors disabled:opacity-40",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/30 hover:bg-secondary/30",
                    )}
                  >
                    <PersonaAvatar initials={p.initials} size="md" className={p.color} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-card-foreground">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.role} · в духе {p.inspiredBy}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={personaIds.length === 0}
                onClick={() => setStep("topic")}
              >
                Далее
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="council-case-search"
                className="mb-2 block text-xs font-bold text-muted-foreground"
              >
                О чём поговорим?
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="council-case-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найдите кейс по названию"
                  className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {caseResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCard(c)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      card?.id === c.id
                        ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary/50",
                    )}
                  >
                    <span className="block truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep("contacts")}>
                Назад
              </Button>
              <Button className="flex-1 gap-1.5" disabled={!card} onClick={start}>
                <Plus className="h-4 w-4" /> Начать совет
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Inline persona picker — expands in place where it's triggered, no modal/dialog. */
function PersonaPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = COUNCIL_PERSONAS.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.inspiredBy.toLowerCase().includes(q),
  );

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.length > 1
          ? selected.filter((x) => x !== id)
          : selected
        : selected.length >= MAX_PERSONAS
          ? selected
          : [...selected, id],
    );

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2 pb-2">
        <p className="text-xs font-bold tabular-nums text-muted-foreground">
          Состав совета ({selected.length}/{MAX_PERSONAS})
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-semibold text-primary hover:underline"
        >
          Готово
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors focus-within:border-primary">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найдите персону по имени или стилю"
          aria-label="Найдите персону по имени или стилю"
          className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </div>
      <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
        {results.map((p) => {
          const isSelected = selected.includes(p.id);
          const disabled =
            (!isSelected && selected.length >= MAX_PERSONAS) ||
            (isSelected && selected.length <= 1);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors disabled:opacity-40",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30",
              )}
            >
              <PersonaAvatar initials={p.initials} size="md" className={p.color} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-card-foreground">
                  {p.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.role} · в духе {p.inspiredBy}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Landing view when no session is active — a feed of every discussion, not an instructional blank screen. */
function SessionsOverview({
  sessions,
  onOpen,
}: {
  sessions: CouncilSession[];
  onOpen: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Пока нет ни одного совета</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Нажмите «Создать совет» слева, чтобы разобрать первый кейс.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-6 py-8">
      <h2 className="text-xs font-bold text-muted-foreground">
        Все обсуждения
        <span className="ml-1.5 tabular-nums">({sessions.length})</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s) => {
          const preview = s.messages.at(-1)?.text ?? s.topic.summary;
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/20"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-card-foreground">{s.title}</p>
                {s.unread && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-success" />
                    <span className="sr-only">Непрочитано</span>
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {preview}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <AvatarStack personaIds={s.personaIds} />
                <span className="text-xs text-muted-foreground">{s.date}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SessionView({
  session,
  revealFromStart,
  onFollowUp,
}: {
  session: CouncilSession;
  revealFromStart: boolean;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");
  const [visibleCount, setVisibleCount] = useState(revealFromStart ? 0 : session.messages.length);
  const [typingAuthor, setTypingAuthor] = useState<string | null>(null);
  const shownCountRef = useRef(revealFromStart ? 0 : session.messages.length);
  const timersRef = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Session switched: show everything already there instantly, no replay of old bursts.
  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setFollowUp("");
    setVisibleCount(revealFromStart ? 0 : session.messages.length);
    shownCountRef.current = revealFromStart ? 0 : session.messages.length;
    setTypingAuthor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // New messages appended to the same session: reveal them one at a time with a typing pause.
  useEffect(() => {
    if (session.messages.length <= shownCountRef.current) return;
    const base = shownCountRef.current;
    const newOnes = session.messages.slice(base);
    shownCountRef.current = session.messages.length;
    let cancelled = false;
    let index = 0;

    const revealNext = () => {
      if (cancelled || index >= newOnes.length) {
        if (!cancelled) setTypingAuthor(null);
        return;
      }
      const message = newOnes[index];
      if (message.author === "user") {
        setVisibleCount(base + index + 1);
        index += 1;
        timersRef.current.push(window.setTimeout(revealNext, 300));
        return;
      }
      setTypingAuthor(message.author);
      const typingDelay = 600 + Math.random() * 800;
      timersRef.current.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setVisibleCount(base + index + 1);
          setTypingAuthor(null);
          index += 1;
          const messageDelay = 1000 + Math.random() * 1500;
          timersRef.current.push(window.setTimeout(revealNext, messageDelay));
        }, typingDelay),
      );
    };

    revealNext();

    return () => {
      cancelled = true;
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [session.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typingAuthor]);

  const isRevealing = typingAuthor !== null || visibleCount < session.messages.length;

  const send = (text: string) => {
    const value = text.trim();
    if (!value || isRevealing) return;
    onFollowUp(value);
    setFollowUp("");
  };

  const visibleMessages = session.messages.slice(0, visibleCount);
  const groups = groupMessages(visibleMessages);
  const typingPersona = typingAuthor ? getPersona(typingAuthor) : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-8">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <AvatarStack personaIds={session.personaIds} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-card-foreground">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {session.personaIds.length}{" "}
              {session.personaIds.length === 1 ? "участник" : "участника"} · на связи
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-primary">Кейс</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {session.topic.summary}
          </p>
        </div>

        {groups.map((group, gi) => {
          if (group.author === "user") {
            const answered = groups.slice(gi + 1).some((g) => g.author !== "user");
            return (
              <div key={group.items[0].id} className="ml-12 space-y-1">
                {group.items.map((m, mi) => {
                  const isLastItem = mi === group.items.length - 1;
                  const isRead = isLastItem && (answered || isRevealing);
                  return (
                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <MessageBubble variant="user" bubbleClassName="p-3">
                        {m.text}
                      </MessageBubble>
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        {m.time}
                        {isRead && " · Прочитано ✓✓"}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }

          const p = getPersona(group.author);
          const replyTarget = group.items[0].replyTo ? getPersona(group.items[0].replyTo) : null;

          return (
            <div key={group.items[0].id} className="flex gap-3">
              <PersonaAvatar initials={p.initials} size="md" className={p.color} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                  {replyTarget && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · отвечает {replyTarget.name.split(" ")[0]}
                    </span>
                  )}
                </p>
                {group.items.map((m) => (
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div
                      className={cn(
                        "rounded-2xl rounded-tl-sm border border-border bg-card p-3 text-sm leading-relaxed text-card-foreground border-l-4",
                        PERSONA_BORDER_CLASS[p.color],
                      )}
                    >
                      {m.text}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {typingPersona && (
          <div className="flex items-center gap-3">
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              className={typingPersona.color}
            />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 mt-6 space-y-2 border-t border-border bg-background pt-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isRevealing}
              onClick={() => send(q)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label htmlFor="council-follow-up" className="sr-only">
            Сообщение совету
          </label>
          <input
            id="council-follow-up"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(followUp)}
            disabled={isRevealing}
            placeholder="Написать сообщение…"
            className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
          />
          <Button
            size="icon"
            disabled={!followUp.trim() || isRevealing}
            onClick={() => send(followUp)}
            aria-label="Отправить"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { sessions, create, markRead, updatePersonas, addMessages, remove } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const [showSessions, setShowSessions] = useState(true);
  const sessionsCollapseRef = useRef<HTMLButtonElement>(null);
  const sessionsRestoreRef = useRef<HTMLButtonElement>(null);
  const sessionsPanelRef = useRef<HTMLElement>(null);

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };
  const { width: sessionsWidth, startResize: startSessionsResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const q = sessionQuery.trim().toLowerCase();
  const visibleSessions = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions;
  const today = visibleSessions.filter((s) => s.date === TODAY);
  const earlier = visibleSessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    // Reveal-from-start only applies to the single continuous view right after
    // creation — an explicit re-navigation to this session (even back to the
    // same one) means "already seen it," so the next mount shows it instantly.
    setJustCreatedId((prev) => (prev === id ? null : prev));
    markRead(id);
  };

  const deleteSession = (id: string) => {
    remove(id);
    if (id === activeId) setActiveId(null);
    toast.success("Сессия удалена");
  };

  const submitFollowUp = (text: string) => {
    if (!active) return;
    const userMessage = buildUserMessage(text);
    const replies = buildFollowUpReplies(active.personaIds, active.topic, text);
    addMessages(active.id, [userMessage, ...replies]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="relative flex flex-1 flex-col lg:min-h-0 md:flex-row">
        <aside
          ref={sessionsPanelRef}
          tabIndex={-1}
          style={{ "--panel-w": `${sessionsWidth}px` } as React.CSSProperties}
          className={cn(
            "relative flex w-full shrink-0 flex-col border-b border-border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-none md:w-[var(--panel-w)] md:overflow-y-auto md:border-b-0 md:border-r",
            !showSessions && "md:hidden",
          )}
        >
          <div
            onMouseDown={startSessionsResize()}
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину панели сессий"
            className="absolute inset-y-0 right-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 md:block"
          />

          <div className="flex items-center gap-2 pb-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
              Сессии
              <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-xs font-bold tabular-nums text-muted-foreground">
                {sessions.length}
              </span>
            </p>
            <button
              ref={sessionsCollapseRef}
              onClick={() => {
                setShowSessions(false);
                focusNext(sessionsRestoreRef);
              }}
              aria-label="Свернуть панель сессий"
              title="Свернуть панель"
              className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary md:grid"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={sessionQuery}
              onChange={(e) => setSessionQuery(e.target.value)}
              placeholder="Поиск по сессиям"
              aria-label="Поиск по сессиям"
              className="h-9 w-full min-w-0 rounded-lg border border-border bg-secondary/30 pl-8 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
            />
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {q && today.length === 0 && earlier.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground">Ничего не найдено</p>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              {!pickerOpen && (
                <>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {active.personaIds.map((id) => {
                      const p = getPersona(id);
                      return (
                        <PersonaAvatar
                          key={id}
                          initials={p.initials}
                          size="sm"
                          className={p.color}
                        />
                      );
                    })}
                  </div>
                  <button
                    ref={pickerTriggerRef}
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
                  >
                    Изменить состав
                  </button>
                </>
              )}
              {pickerOpen && (
                <PersonaPicker
                  selected={active.personaIds}
                  onChange={(ids) => updatePersonas(active.id, ids)}
                  onClose={() => {
                    setPickerOpen(false);
                    focusNext(pickerTriggerRef);
                  }}
                />
              )}
            </div>
          )}
        </aside>

        {!showSessions && (
          <button
            ref={sessionsRestoreRef}
            onClick={() => {
              setShowSessions(true);
              focusNext(sessionsPanelRef);
            }}
            aria-label="Показать сессии"
            title="Показать панель сессий"
            className="absolute left-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary md:grid"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <main className="flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:overflow-y-auto">
          {creating ? (
            <NewCouncilPanel
              onCancel={() => setCreating(false)}
              onCreate={(session) => {
                create(session);
                setCreating(false);
                setActiveId(session.id);
                setJustCreatedId(session.id);
              }}
            />
          ) : active ? (
            <SessionView
              session={active}
              revealFromStart={active.id === justCreatedId}
              onFollowUp={submitFollowUp}
            />
          ) : (
            <SessionsOverview sessions={sessions} onOpen={openSession} />
          )}
        </main>
      </div>
    </div>
  );
}

function SessionRow({
  session,
  active,
  onClick,
  onDelete,
}: {
  session: CouncilSession;
  active: boolean;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group relative w-full rounded-xl border transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-secondary/30",
      )}
    >
      <button
        onClick={() => onClick(session.id)}
        aria-current={active ? "true" : undefined}
        className="block w-full p-3 text-left"
      >
        <div className="flex items-center justify-between gap-2 pr-6">
          <p className="truncate text-sm font-bold text-card-foreground">{session.title}</p>
          {session.unread && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
              <span aria-hidden className="h-2 w-2 rounded-full bg-success" />
              <span className="sr-only">Непрочитано</span>
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <AvatarStack personaIds={session.personaIds} />
          <span className="text-xs text-muted-foreground">{session.date}</span>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        aria-label={`Удалить сессию «${session.title}»`}
        title="Удалить сессию"
        className="absolute right-2 top-2 grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
