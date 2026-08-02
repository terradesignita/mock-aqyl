import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Send } from "lucide-react";
import { Header } from "@/components/Header";
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
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildPersonaTake,
  buildVerdict,
  COUNCIL_PERSONAS,
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

function AvatarStack({ personaIds }: { personaIds: string[] }) {
  const shown = personaIds.slice(0, 2);
  const rest = personaIds.length - shown.length;
  const names = personaIds.map((id) => getPersona(id).name).join(", ");
  return (
    <div role="img" aria-label={`Участники: ${names}`} className="flex items-center -space-x-2">
      {shown.map((id) => {
        const p = getPersona(id);
        return (
          <span
            key={id}
            aria-hidden
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full border-2 border-card text-xs font-bold text-white",
              p.color,
            )}
          >
            {p.initials}
          </span>
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
          onClose={() => setPickerOpen(false)}
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
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                    p.color,
                  )}
                >
                  {p.initials}
                </span>
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

function EmptyState({ onNew }: { onNew: () => void }) {
  const heroIds = ["founder", "operator", "resilience"];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div aria-hidden className="flex items-center -space-x-3">
        {heroIds.map((id, i) => {
          const p = getPersona(id);
          return (
            <span
              key={id}
              style={{ zIndex: heroIds.length - i }}
              className={cn(
                "grid h-14 w-14 place-items-center rounded-full border-4 border-background text-sm font-bold text-white",
                p.color,
              )}
            >
              {p.initials}
            </span>
          );
        })}
      </div>
      <h2 className="text-xl font-bold text-foreground">Разберите решение с советом</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Выберите кейс — совет из трёх персон подберётся автоматически.
      </p>
      <Button size="lg" className="gap-1.5" onClick={onNew}>
        <Plus className="h-4 w-4" /> Создать совет
      </Button>
    </div>
  );
}

function SessionView({
  session,
  onFollowUp,
}: {
  session: CouncilSession;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");

  const send = () => {
    const text = followUp.trim();
    if (!text) return;
    onFollowUp(text);
    setFollowUp("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-6 py-8">
      <div>
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
              className="flex animate-in gap-3 fade-in slide-in-from-bottom-2 duration-300"
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                  p.color,
                )}
              >
                {p.initials}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-3">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-card-foreground">
                  {buildPersonaTake(id, session.topic)}
                </p>
              </div>
            </div>
          );
        })}

        {session.followUps.map((text, i) => (
          <div
            key={i}
            className="ml-12 animate-in rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 p-3 text-sm text-card-foreground fade-in slide-in-from-bottom-2 duration-300"
          >
            {text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-border pt-4">
        <label htmlFor="council-follow-up" className="sr-only">
          Уточняющий вопрос совету
        </label>
        <input
          id="council-follow-up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Задайте уточняющий вопрос совету"
          className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
        />
        <Button size="icon" disabled={!followUp.trim()} onClick={send} aria-label="Отправить">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function VerdictPanel({
  session,
  onAsk,
}: {
  session: CouncilSession;
  onAsk: (text: string) => void;
}) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);

  return (
    <aside
      aria-label="Вердикт совета"
      className="flex w-full flex-col gap-3 border-t border-border bg-card p-4 md:max-h-[45vh] md:shrink-0 md:overflow-y-auto lg:max-h-none lg:w-[260px] lg:border-l lg:border-t-0"
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="text-xs font-bold text-primary">Вердикт совета</p>
      </div>
      <div
        key={session.followUps.length}
        className="animate-in rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground fade-in duration-300"
      >
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <ul className="space-y-1.5">
          {verdict.openQuestions.map((question, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onAsk(question)}
                className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
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
  const { sessions, create, markRead, updatePersonas, addFollowUp } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const today = sessions.filter((s) => s.date === TODAY);
  const earlier = sessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background md:h-screen md:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card p-3 md:max-h-none md:w-[320px] md:overflow-y-auto md:border-b-0 md:border-r">
          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

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
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {active.personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <span
                      key={id}
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white",
                        p.color,
                      )}
                    >
                      {p.initials}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
              >
                Изменить состав
              </button>
            </div>
          )}
        </aside>

        <div className="flex flex-1 flex-col md:min-h-0 md:min-w-0 lg:flex-row">
          <main className="flex flex-1 flex-col md:min-h-0 md:min-w-0 md:overflow-y-auto">
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
              <SessionView session={active} onFollowUp={(text) => addFollowUp(active.id, text)} />
            ) : (
              <EmptyState onNew={() => setCreating(true)} />
            )}
          </main>
          {active && (
            <VerdictPanel session={active} onAsk={(text) => addFollowUp(active.id, text)} />
          )}
        </div>
      </div>

      {active && pickerOpen && (
        <PersonaPicker
          selected={active.personaIds}
          onChange={(ids) => updatePersonas(active.id, ids)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function SessionRow({
  session,
  active,
  onClick,
}: {
  session: CouncilSession;
  active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(session.id)}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-secondary/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-bold text-card-foreground">{session.title}</p>
        {session.unread && (
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-success" />
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <AvatarStack personaIds={session.personaIds} />
        <span className="text-xs text-muted-foreground">{session.date}</span>
      </div>
    </button>
  );
}
