import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Send } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookmarks, useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  COUNCIL_PERSONAS,
  buildPersonaTake,
  getPersona,
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
              "grid h-6 w-6 place-items-center rounded-full border-2 border-card text-[10px] font-bold text-white",
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
          className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-secondary text-[10px] font-bold text-muted-foreground"
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const togglePersona = (id: string) =>
    setPersonaIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_PERSONAS
          ? prev
          : [...prev, id],
    );

  const start = () => {
    if (!card || personaIds.length === 0) return;
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
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
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          1. Выберите кейс
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="council-case-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найдите кейс по названию"
            className="h-10 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
          {results.map((c) => (
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

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          2. Соберите до трёх персон ({personaIds.length}/{MAX_PERSONAS})
        </p>
        <div className="grid grid-cols-2 gap-2">
          {COUNCIL_PERSONAS.map((p) => {
            const selected = personaIds.includes(p.id);
            const disabled = !selected && personaIds.length >= MAX_PERSONAS;
            return (
              <button
                key={p.id}
                onClick={() => togglePersona(p.id)}
                disabled={disabled}
                aria-pressed={selected}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors disabled:opacity-40",
                  selected
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
                  <span className="block truncate text-xs text-muted-foreground">{p.role}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  const heroIds = ["external", "cfo", "legal"];
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
        Выберите кейс и соберите до трёх персон для предметного разговора.
      </p>
      <Button size="lg" className="gap-1.5" onClick={onNew}>
        <Plus className="h-4 w-4" /> Новый совет
      </Button>
    </div>
  );
}

function SessionView({ session }: { session: CouncilSession }) {
  const [followUp, setFollowUp] = useState("");
  const [thread, setThread] = useState<{ author: "user" | "synthesis"; text: string }[]>([]);

  const send = () => {
    const text = followUp.trim();
    if (!text) return;
    setThread((prev) => [
      ...prev,
      { author: "user", text },
      {
        author: "synthesis",
        text: `Мнения разошлись, но все сходятся в одном: ${session.topic.insight} Дальнейшее решение зависит от того, какой риск компания готова принять.`,
      },
    ]);
    setFollowUp("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-6 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Кейс</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {session.topic.summary}
        </p>
      </div>

      <div className="space-y-3">
        {session.personaIds.map((id) => {
          const p = getPersona(id);
          return (
            <div key={id} className="flex gap-3">
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

        {thread.map((m, i) =>
          m.author === "user" ? (
            <div key={i} className="ml-12 rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 p-3 text-sm text-card-foreground">
              {m.text}
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold uppercase text-muted-foreground">
                Итог
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-dashed border-border bg-secondary/40 p-3 text-sm leading-relaxed text-card-foreground">
                {m.text}
              </div>
            </div>
          ),
        )}
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
          className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        <Button size="icon" disabled={!followUp.trim()} onClick={send} aria-label="Отправить">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { bookmarks } = useBookmarks();
  const { sessions, create, markRead } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const today = sessions.filter((s) => s.date === TODAY);
  const earlier = sessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header dark={dark} onToggleDark={toggle} bookmarkCount={bookmarks.length} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col overflow-y-auto border-b border-border bg-card p-3 md:max-h-none md:w-[320px] md:border-b-0 md:border-r">
          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Новый совет
          </Button>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Сегодня
                </p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow key={s.id} session={s} active={s.id === activeId} onClick={openSession} />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ранее
                </p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow key={s.id} session={s} active={s.id === activeId} onClick={openSession} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
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
            <SessionView session={active} />
          ) : (
            <EmptyState onNew={() => setCreating(true)} />
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
        <span className="text-[11px] text-muted-foreground">{session.date}</span>
      </div>
    </button>
  );
}
