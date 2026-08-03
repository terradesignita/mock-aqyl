import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Loader2,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildPersonaTake,
  buildVerdict,
  COUNCIL_PERSONAS,
  formatVerdictForCopy,
  getPersona,
  suggestPersonas,
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

function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const selectCard = (c: KnowledgeCardData) => {
    setCard(c);
    setPersonaIds(
      suggestPersonas({
        title: c.title,
        summary: c.executive_summary,
        insight: c.core_insight,
        businessUnit: c.business_unit,
      }),
    );
  };

  const start = () => {
    if (!card || personaIds.length === 0) return;
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      followUps: [],
      topic: {
        title: card.title,
        summary: card.executive_summary,
        insight: card.core_insight,
        businessUnit: card.business_unit,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-6 py-10">
      <div>
        <label
          htmlFor="council-case-search"
          className="mb-2 block text-xs font-bold text-muted-foreground"
        >
          Выберите кейс
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary">
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
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCard(c)}
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

      {card && (
        <div>
          <p className="mb-2 text-xs font-bold tabular-nums text-muted-foreground">
            Совет ({personaIds.length}/{MAX_PERSONAS})
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {personaIds.map((id) => {
              const p = getPersona(id);
              return (
                <span
                  key={id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white",
                    p.color,
                  )}
                >
                  {p.initials} {p.name.split(" ")[0]}
                </span>
              );
            })}
            <button
              ref={pickerTriggerRef}
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Изменить состав
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          className="flex-1 gap-1.5"
          disabled={!card || personaIds.length === 0}
          onClick={start}
        >
          <Plus className="h-4 w-4" /> Начать совет
        </Button>
      </div>

      {pickerOpen && (
        <PersonaPicker
          selected={personaIds}
          onChange={setPersonaIds}
          onClose={() => {
            setPickerOpen(false);
            requestAnimationFrame(() => pickerTriggerRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}

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
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="tabular-nums">
            Состав совета ({selected.length}/{MAX_PERSONAS})
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найдите персону по имени или стилю"
            aria-label="Найдите персону по имени или стилю"
            className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
          />
        </div>
        <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
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
        <DialogFooter>
          <Button onClick={onClose}>Готово</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  const heroIds = ["founder", "operator", "resilience"];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div aria-hidden className="flex items-center -space-x-3">
        {heroIds.map((id, i) => {
          const p = getPersona(id);
          return (
            <PersonaAvatar
              key={id}
              initials={p.initials}
              size="lg"
              style={{ zIndex: heroIds.length - i }}
              className={cn(p.color, "border-4 border-background")}
            />
          );
        })}
      </div>
      <h2 className="text-xl font-bold text-foreground">Разберите решение с советом</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Выберите кейс слева — совет из трёх персон подберётся автоматически.
      </p>
    </div>
  );
}

function SessionView({
  session,
  pending,
  onFollowUp,
}: {
  session: CouncilSession;
  /** Follow-up text already shown as sent, still waiting to land in `session.followUps`. */
  pending: string | null;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");

  const send = () => {
    const text = followUp.trim();
    if (!text || pending) return;
    onFollowUp(text);
    setFollowUp("");
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-8">
      <div className="flex-1 space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-primary">Кейс</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {session.topic.summary}
          </p>
        </div>

        <div className="space-y-3">
          {session.personaIds.map((id, i) => {
            const p = getPersona(id);
            return (
              <div
                key={id}
                style={{ animationDelay: `${Math.min(i, 9) * 80}ms` }}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <MessageBubble
                  variant="entity"
                  avatar={<PersonaAvatar initials={p.initials} size="md" className={p.color} />}
                  title={
                    <>
                      {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                    </>
                  }
                  accentClassName={cn("border-l-4", PERSONA_BORDER_CLASS[p.color])}
                >
                  {buildPersonaTake(id, session.topic)}
                </MessageBubble>
              </div>
            );
          })}

          {session.followUps.map((text, i) => (
            <div key={i} className="ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MessageBubble variant="user" bubbleClassName="p-3">
                {text}
              </MessageBubble>
            </div>
          ))}

          {pending && (
            <div className="ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MessageBubble variant="user" bubbleClassName="p-3">
                {pending}
              </MessageBubble>
            </div>
          )}

          {pending && (
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Совет учитывает ваш
              вопрос...
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-border bg-background pt-4 pb-2">
        <label htmlFor="council-follow-up" className="sr-only">
          Уточняющий вопрос совету
        </label>
        <input
          id="council-follow-up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={!!pending}
          placeholder="Задайте уточняющий вопрос совету"
          className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
        />
        <Button
          size="icon"
          disabled={!followUp.trim() || !!pending}
          onClick={send}
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function VerdictPanel({
  session,
  onAsk,
  pending,
  width,
  startResize,
  collapsed,
  onCollapse,
  panelRef,
}: {
  session: CouncilSession;
  onAsk: (text: string) => void;
  pending: boolean;
  width: number;
  startResize: (e: React.MouseEvent) => void;
  collapsed: boolean;
  onCollapse: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
}) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);
  const [copied, setCopied] = useState(false);

  const copyVerdict = async () => {
    await navigator.clipboard.writeText(formatVerdictForCopy(session.topic, verdict));
    setCopied(true);
    toast.success("Вердикт скопирован");
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label="Вердикт совета"
      style={{ "--panel-w": `${width}px` } as React.CSSProperties}
      className={cn(
        "relative flex w-full flex-col gap-3 border-t border-border bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-[45vh] md:shrink-0 md:overflow-y-auto lg:max-h-none lg:w-[var(--panel-w)] lg:border-l lg:border-t-0",
        collapsed && "lg:hidden",
      )}
    >
      <div
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Изменить ширину панели вердикта"
        className="absolute inset-y-0 left-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 lg:block"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onCollapse}
          aria-label="Свернуть панель вердикта"
          title="Свернуть панель"
          className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:grid"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="flex-1 text-xs font-bold text-primary">Вердикт совета</p>
        <button
          onClick={copyVerdict}
          aria-label="Скопировать вердикт"
          title="Скопировать вердикт"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div
        key={session.followUps.length}
        className="animate-in rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground fade-in duration-300"
      >
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.openQuestions.map((question, i) => (
            <button
              key={i}
              type="button"
              disabled={pending}
              onClick={() => onAsk(question)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Согласны / расходятся</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.agreements.map((a, i) => (
            <span
              key={i}
              className={cn(
                "max-w-full truncate rounded-full border px-2 py-0.5 text-xs font-medium",
                a.kind === "agree"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { sessions, create, markRead, updatePersonas, addFollowUp, remove } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const [showSessions, setShowSessions] = useState(true);
  const [showVerdict, setShowVerdict] = useState(true);
  const sessionsCollapseRef = useRef<HTMLButtonElement>(null);
  const sessionsRestoreRef = useRef<HTMLButtonElement>(null);
  const sessionsPanelRef = useRef<HTMLElement>(null);
  const verdictRestoreRef = useRef<HTMLButtonElement>(null);
  const verdictPanelRef = useRef<HTMLElement>(null);

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };
  const { width: sessionsWidth, startResize: startSessionsResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });
  const { width: verdictWidth, startResize: startVerdictResize } = useResizablePanel(260, {
    min: 220,
    max: 480,
  });

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const q = sessionQuery.trim().toLowerCase();
  const visibleSessions = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions;
  const today = visibleSessions.filter((s) => s.date === TODAY);
  const earlier = visibleSessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  const deleteSession = (id: string) => {
    remove(id);
    if (id === activeId) setActiveId(null);
    toast.success("Сессия удалена");
  };

  const submitFollowUp = (text: string) => {
    if (!active || pendingFollowUp) return;
    setPendingFollowUp(text);
    window.setTimeout(() => {
      addFollowUp(active.id, text);
      setPendingFollowUp(null);
    }, 650);
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
              <div className="flex flex-wrap gap-1.5 px-1">
                {active.personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <PersonaAvatar key={id} initials={p.initials} size="sm" className={p.color} />
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

        <div className="relative flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:flex-row">
          <main className="flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:overflow-y-auto">
            {creating ? (
              <NewCouncilPanel
                onCancel={() => setCreating(false)}
                onCreate={(session) => {
                  create(session);
                  setCreating(false);
                  setActiveId(session.id);
                }}
              />
            ) : active ? (
              <SessionView session={active} pending={pendingFollowUp} onFollowUp={submitFollowUp} />
            ) : (
              <EmptyState />
            )}
          </main>
          {active && (
            <VerdictPanel
              session={active}
              onAsk={submitFollowUp}
              pending={!!pendingFollowUp}
              width={verdictWidth}
              startResize={startVerdictResize(true)}
              collapsed={!showVerdict}
              onCollapse={() => {
                setShowVerdict(false);
                focusNext(verdictRestoreRef);
              }}
              panelRef={verdictPanelRef}
            />
          )}
          {active && !showVerdict && (
            <button
              ref={verdictRestoreRef}
              onClick={() => {
                setShowVerdict(true);
                focusNext(verdictPanelRef);
              }}
              aria-label="Показать вердикт"
              title="Показать панель вердикта"
              className="absolute right-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-l-lg border border-r-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary lg:grid"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {active && pickerOpen && (
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
