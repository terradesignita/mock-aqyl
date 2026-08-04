import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PanelLeft, PanelLeftClose, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { clampWidth, useResizablePanel } from "@/hooks/useResizablePanel";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  buildUserMessage,
  COUNCIL_PERSONAS,
  FOLLOW_UP_FALLBACK_TEXT,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilPersona,
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

// Персональный цвет — произвольный hex (Task 1), не именованный Tailwind-класс,
// поэтому вместо карты color→класс используем CSS-переменные: сам класс
// статичен и один на всех (JIT видит литерал), а конкретный цвет приходит
// через --persona-color/--persona-color-dark в style. Рамка/кольцо — всегда
// 100% непрозрачности (тонированная рамка не держит WCAG 3:1 в тёмной теме,
// см. спеку §2); только заливка (PERSONA_TINT_CLASS) — 10%.
const PERSONA_BORDER_CLASS = "border-[var(--persona-color)] dark:border-[var(--persona-color-dark)]";
const PERSONA_TINT_CLASS = "bg-[color-mix(in_oklab,var(--persona-color)_10%,transparent)]";

function personaColorVars(p: CouncilPersona): React.CSSProperties {
  return {
    "--persona-color": p.hex,
    "--persona-color-dark": p.darkHex ?? p.hex,
  } as React.CSSProperties;
}

/** personaColorVars + backgroundColor in one shot — for standalone PersonaAvatar
 *  usages that aren't already inside an element carrying the CSS variables. */
function personaAvatarStyle(p: CouncilPersona): React.CSSProperties {
  return { backgroundColor: p.hex, ...personaColorVars(p) };
}

function PersonaTag({ tag, hex }: { tag: string; hex: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white"
      style={{ backgroundColor: hex }}
    >
      {tag}
    </span>
  );
}

function AvatarStack({
  personaIds,
  size = "xs",
}: {
  personaIds: string[];
  size?: "xs" | "lg";
}) {
  const shown = personaIds.slice(0, 2);
  const rest = personaIds.length - shown.length;
  const names = personaIds.map((id) => getPersona(id).name).join(", ");
  const overflowClass = size === "lg" ? "h-10 w-10 text-sm" : "h-6 w-6 text-xs";
  return (
    <div role="img" aria-label={`Участники: ${names}`} className="flex items-center -space-x-2">
      {shown.map((id) => {
        const p = getPersona(id);
        return (
          <PersonaAvatar
            key={id}
            aria-hidden
            initials={p.initials}
            size={size}
            ring
            style={{ backgroundColor: p.hex }}
          />
        );
      })}
      {rest > 0 && (
        <span
          aria-hidden
          className={cn(
            "grid place-items-center rounded-full border-2 border-card bg-secondary font-bold text-muted-foreground",
            overflowClass,
          )}
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

function ConversationCover({ session }: { session: CouncilSession }) {
  const colors = session.personaIds.slice(0, 3).map((id) => getPersona(id).hex);
  const anchors = ["0% 0%", "100% 0%", "50% 100%"];
  const backgroundImage = colors
    .map(
      (hex, i) =>
        `radial-gradient(60% 90% at ${anchors[i]}, color-mix(in oklab, ${hex} 18%, transparent), transparent 65%)`,
    )
    .join(", ");

  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{ backgroundImage, backgroundColor: "var(--color-card)" }}
    >
      <AvatarStack personaIds={session.personaIds} size="lg" />
      <h2 className="mt-3 text-lg font-bold leading-tight text-foreground">
        {session.topic.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {session.topic.summary}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {session.personaIds.length}{" "}
        {session.personaIds.length === 1 ? "участник" : "участника"} · на связи
      </p>
    </div>
  );
}

/** Nearest scrollable ancestor — used to check whether the user is still near the
 *  bottom before yanking their scroll position during a reveal cascade. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = window.getComputedStyle(el).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return null;
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
  const stepHeadingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }, [step]);

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
                <p
                  ref={stepHeadingRef as React.RefObject<HTMLParagraphElement>}
                  tabIndex={-1}
                  className="text-sm font-bold text-card-foreground outline-none"
                >
                  Кто в совете?
                </p>
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
              <p
                role="status"
                className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-card-foreground"
              >
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
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-[color,background-color,border-color,opacity] disabled:opacity-40",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/30 hover:bg-secondary/30",
                    )}
                  >
                    <PersonaAvatar
                      initials={p.initials}
                      size="md"
                      ringClassName={PERSONA_BORDER_CLASS}
                      style={personaAvatarStyle(p)}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-sm font-semibold text-card-foreground">
                          {p.name}
                        </span>
                        <PersonaTag tag={p.tag} hex={p.hex} />
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
                ref={stepHeadingRef as React.RefObject<HTMLLabelElement>}
                tabIndex={-1}
                htmlFor="council-case-search"
                className="mb-2 block text-xs font-bold text-muted-foreground outline-none"
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
                    <span className="block truncate" title={c.title}>
                      {c.title}
                    </span>
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
                "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-[color,background-color,border-color,opacity] disabled:opacity-40",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30",
              )}
            >
              <PersonaAvatar
                initials={p.initials}
                size="md"
                ringClassName={PERSONA_BORDER_CLASS}
                style={personaAvatarStyle(p)}
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="block truncate text-sm font-semibold text-card-foreground">
                    {p.name}
                  </span>
                  <PersonaTag tag={p.tag} hex={p.hex} />
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
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold text-foreground">Пока нет ни одного совета</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Нажмите «Создать совет», чтобы разобрать первый кейс.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-6 py-8">
      <h2 className="text-xs font-bold text-muted-foreground">
        Все сессии <span className="ml-1.5 tabular-nums">({sessions.length})</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s) => {
          const lastMessage = s.messages.at(-1);
          const preview =
            !lastMessage || lastMessage.text === FOLLOW_UP_FALLBACK_TEXT
              ? s.topic.summary
              : lastMessage.text;
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/20"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-card-foreground" title={s.title}>
                  {s.title}
                </p>
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
    const scrollParent = getScrollParent(bottomRef.current);
    const wasNearBottom =
      !scrollParent ||
      scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight < 120;
    if (!wasNearBottom) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
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
      <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-4">
        <ConversationCover session={session} />

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
            <div key={group.items[0].id} className="flex gap-3" style={personaColorVars(p)}>
              <PersonaAvatar
                initials={p.initials}
                size="md"
                ringClassName={PERSONA_BORDER_CLASS}
                style={{ backgroundColor: p.hex }}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                  {replyTarget && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · Ответ: {replyTarget.name.split(" ")[0]}
                    </span>
                  )}
                </p>
                {group.items.map((m) => (
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MessageBubble
                      variant="entity"
                      accentClassName={cn(PERSONA_TINT_CLASS, PERSONA_BORDER_CLASS)}
                    >
                      {m.text}
                    </MessageBubble>
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
              style={{ backgroundColor: typingPersona.hex }}
            />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2.5">
              <span className="sr-only">{typingPersona.name} печатает…</span>
              <span aria-hidden className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "120ms" }}
              />
              <span
                aria-hidden
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
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-[color,background-color,border-color,opacity] hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
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
            className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-[border-color,opacity] placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
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
  const mainRef = useRef<HTMLElement>(null);

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };
  const SESSIONS_WIDTH_MIN = 220;
  const SESSIONS_WIDTH_MAX = 520;
  const {
    width: sessionsWidth,
    setWidth: setSessionsWidth,
    startResize: startSessionsResize,
  } = useResizablePanel(320, {
    min: SESSIONS_WIDTH_MIN,
    max: SESSIONS_WIDTH_MAX,
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

  // Every full swap of <main>'s content (opening the wizard, completing/cancelling
  // it, opening a different session) moves focus into the new view instead of
  // silently leaving it wherever it was — screen-reader and keyboard users
  // otherwise get dumped at <body> with no announcement of the context change.
  useEffect(() => {
    focusNext(mainRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, activeId]);

  return (
    <div className="flex min-h-screen flex-col bg-background md:h-screen md:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="relative flex flex-1 flex-col md:min-h-0 md:flex-row">
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
            onKeyDown={(e) => {
              const step = e.shiftKey ? 40 : 16;
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                setSessionsWidth((w) => clampWidth(w - step, SESSIONS_WIDTH_MIN, SESSIONS_WIDTH_MAX));
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setSessionsWidth((w) => clampWidth(w + step, SESSIONS_WIDTH_MIN, SESSIONS_WIDTH_MAX));
              } else if (e.key === "Home") {
                e.preventDefault();
                setSessionsWidth(SESSIONS_WIDTH_MIN);
              } else if (e.key === "End") {
                e.preventDefault();
                setSessionsWidth(SESSIONS_WIDTH_MAX);
              }
            }}
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label="Изменить ширину панели сессий"
            aria-valuenow={sessionsWidth}
            aria-valuemin={SESSIONS_WIDTH_MIN}
            aria-valuemax={SESSIONS_WIDTH_MAX}
            className="absolute inset-y-0 right-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 focus-visible:bg-primary/25 md:block"
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

          <div className="mt-4 space-y-4">
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
                          style={{ backgroundColor: p.hex }}
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

        <main
          ref={mainRef}
          tabIndex={-1}
          className="flex flex-1 flex-col outline-none md:min-h-0 md:min-w-0 md:overflow-y-auto"
        >
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
  const accentHex = getPersona(session.personaIds[0]).hex;
  return (
    <div
      style={{ "--row-accent": accentHex } as React.CSSProperties}
      className={cn(
        "group relative w-full rounded-xl border transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-[color-mix(in_oklab,var(--row-accent)_25%,transparent)] bg-[color-mix(in_oklab,var(--row-accent)_6%,var(--color-card))] hover:border-primary/30 hover:bg-secondary/30",
      )}
    >
      <button
        onClick={() => onClick(session.id)}
        aria-current={active ? "true" : undefined}
        className="block w-full p-3 text-left"
      >
        <div className="flex items-center justify-between gap-2 pr-6">
          <p className="truncate text-sm font-bold text-card-foreground" title={session.title}>
            {session.title}
          </p>
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
