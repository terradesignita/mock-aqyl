import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Check,
  ClipboardList,
  Loader2,
  MessageSquarePlus,
  PenLine,
  Presentation,
  Save,
  Send,
  Sparkle,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "@/components/MessageBubble";
import {
  buildAnswer,
  buildFollowUpReply,
  buildNegotiationQuestions,
  buildShareholderSummary,
  buildUnderstanding,
  classify,
  contextIsSufficient,
  extractKnown,
  isManagerialQuery,
  visibleQuestions,
  type AdvisorSelection,
  type FollowUpFlags,
} from "@/data/advisor";
import { useAdvisorDraft, type AdvisorSession } from "@/hooks/useAppState";
import { useT, type Dictionary } from "@/lib/i18n";
import { ClarifyBlock } from "@/components/advisor/ClarifyBlock";
import { UnderstandingCard } from "@/components/advisor/UnderstandingCard";
import { AdvisorAnswer } from "@/components/advisor/AdvisorAnswer";

// ponytail: скрыто, пока не понадобится — вопросы партнёру / версия для акционера /
// сохранение анализа. Верните в true, когда эти сценарии снова станут нужны.
const SHOW_FOLLOWUP_ACTIONS = false;

type Stage = "clarify" | "understanding" | "thinking" | "answer";

const STAGE_IDS: Stage[] = ["clarify", "understanding", "thinking", "answer"];

function stageLabel(id: Stage, t: Dictionary): string {
  switch (id) {
    case "clarify":
      return t.advisor.stageClarify;
    case "understanding":
      return t.advisor.stageUnderstanding;
    case "thinking":
      return t.advisor.stageThinking;
    case "answer":
      return t.advisor.stageAnswer;
  }
}

interface Props {
  query: string;
  onReset: () => void;
  /** §34 ТЗ — продолжить ранее сохранённый разбор вместо нового. */
  initialSession?: AdvisorSession;
  onSave: (session: Omit<AdvisorSession, "id" | "date">) => void;
}

interface FollowUpMessage {
  author: "user" | "advisor";
  text: string;
}

function Stepper({ stage, onGoTo }: { stage: Stage; onGoTo: (s: Stage) => void }) {
  const t = useT();
  const current = STAGE_IDS.indexOf(stage);
  return (
    <ol className="flex w-full items-center">
      {STAGE_IDS.map((id, i) => {
        const label = stageLabel(id, t);
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={id}>
            <li className="flex shrink-0 items-center">
              <button
                type="button"
                disabled={!done}
                onClick={() => done && onGoTo(id)}
                aria-label={label}
                className={`flex items-center gap-1.5 rounded-full border px-1.5 py-1 text-xs font-bold transition-colors sm:px-2.5 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : done
                      ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/16"
                      : "border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${
                    active ? "bg-primary-foreground/20" : done ? "bg-primary/20" : "bg-border/60"
                  }`}
                >
                  {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <span aria-hidden className={active ? "" : "hidden sm:inline"}>
                  {label}
                </span>
              </button>
            </li>
            {i < STAGE_IDS.length - 1 && (
              <span
                aria-hidden
                className={`mx-1 h-px min-w-2 flex-1 sm:mx-1.5 ${i < current ? "bg-primary/50" : "bg-border"}`}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

export function AdvisorFlow({ query, onReset, initialSession, onSave }: Props) {
  const t = useT();
  const a = t.advisorText;
  const dilemma = useMemo(() => classify(query, a), [query, a]);
  const known = useMemo(() => extractKnown(query, a), [query, a]);
  const thinkingSteps = a.thinkingSteps;
  const { draft, setDraft, clear: clearDraft } = useAdvisorDraft();

  // Черновик того же запроса — продолжаем с того места, где закрыли вкладку (BUG-03).
  const resume = initialSession ? undefined : draft?.query === query ? draft : undefined;

  const [selection, setSelection] = useState<AdvisorSelection>(
    () => initialSession?.selection ?? resume?.selection ?? { choices: {}, own: {} },
  );
  const [stage, setStage] = useState<Stage>(
    () => (initialSession ? "answer" : resume?.stage) ?? "clarify",
  );
  const [qIndex, setQIndex] = useState(resume?.qIndex ?? 0);
  const [step, setStep] = useState(0);
  const [followUp, setFollowUp] = useState("");
  const [thread, setThread] = useState<FollowUpMessage[]>(
    () => initialSession?.thread ?? resume?.thread ?? [],
  );
  const [thinkingFollowUp, setThinkingFollowUp] = useState(false);
  const [followUpFlags, setFollowUpFlags] = useState<FollowUpFlags>(
    () => initialSession?.followUpFlags ?? resume?.followUpFlags ?? {},
  );
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showShareholder, setShowShareholder] = useState(false);
  const [saved, setSaved] = useState(false);

  // Автосохранение прогресса: закрытая вкладка и F5 больше не стирают разбор.
  useEffect(() => {
    if (stage === "thinking") return;
    setDraft({
      query,
      stage,
      qIndex,
      selection,
      thread,
      followUpFlags,
      savedAt: new Date().toLocaleString("ru-RU"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, stage, qIndex, selection, thread, followUpFlags]);

  const questions = visibleQuestions(dilemma, selection);
  const enough = contextIsSufficient(dilemma, selection);
  const understanding = buildUnderstanding(dilemma, selection, query, a);
  const answer = useMemo(
    () => buildAnswer(dilemma, selection, a, followUpFlags),
    [dilemma, selection, a, followUpFlags],
  );
  const negotiationQuestions = useMemo(() => buildNegotiationQuestions(dilemma, a), [dilemma, a]);
  const shareholderSummary = useMemo(() => buildShareholderSummary(answer, a), [answer, a]);

  const handleSave = () => {
    onSave({
      title: query.length > 60 ? `${query.slice(0, 57)}…` : query,
      query,
      selection,
      thread,
      followUpFlags,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const askFollowUp = (text: string) => {
    const value = text.trim();
    if (!value || thinkingFollowUp) return;
    setThread((t) => [...t, { author: "user", text: value }]);
    setFollowUp("");
    setThinkingFollowUp(true);
    window.setTimeout(() => {
      const reply = buildFollowUpReply(value, answer, a);
      setThinkingFollowUp(false);
      setThread((t) => [...t, { author: "advisor", text: reply.text }]);
      if (reply.flags) setFollowUpFlags((f) => ({ ...f, ...reply.flags }));
    }, 650);
  };

  const runThinking = () => {
    setStage("thinking");
    setStep(0);
    thinkingSteps.forEach((_, i) => {
      window.setTimeout(() => setStep(i), i * 420);
    });
    window.setTimeout(() => setStage("answer"), thinkingSteps.length * 420);
  };

  if (!isManagerialQuery(query, a)) {
    return (
      <div className="rounded-card border border-border bg-card p-5 shadow-soft">
        <p className="text-sm font-bold text-card-foreground">{t.advisor.notManagerialTitle}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t.advisor.notManagerialBody}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => {
            clearDraft();
            onReset();
          }}
        >
          {t.advisor.rephrase}
        </Button>
      </div>
    );
  }

  const currentStageLabel = stageLabel(stage, t);

  return (
    <div className="space-y-4">
      <span role="status" aria-live="polite" className="sr-only">
        {t.advisor.stageStatus(currentStageLabel)}
      </span>
      {/* Шапка режима: тип решения, прогресс, сброс */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-card border border-border bg-card px-4 py-2.5 shadow-soft xl:flex-nowrap">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/12">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="mx-1 min-w-0 flex-1">
          <Stepper stage={stage} onGoTo={setStage} />
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
          <Check className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.advisor.savedIndicator}</span>
          <span className="sm:hidden">{t.advisor.savedIndicatorShort}</span>
        </span>
      </div>

      {stage === "clarify" && (
        <div
          key={questions[Math.min(qIndex, questions.length - 1)]?.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <ClarifyBlock
            dilemma={dilemma}
            questions={questions}
            selection={selection}
            onChange={setSelection}
            index={Math.min(qIndex, questions.length - 1)}
            onIndex={setQIndex}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={qIndex === 0}
              onClick={() => setQIndex((i) => Math.max(0, i - 1))}
            >
              {t.common.back}
            </Button>
            {qIndex < questions.length - 1 ? (
              <Button size="sm" onClick={() => setQIndex((i) => i + 1)}>
                {t.common.next}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!enough}
                aria-describedby={!enough ? "clarify-gate-hint" : undefined}
                onClick={() => setStage("understanding")}
              >
                {t.common.next}
              </Button>
            )}
            {!enough && qIndex === questions.length - 1 && (
              <span
                id="clarify-gate-hint"
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <PenLine className="h-3.5 w-3.5" /> {t.advisor.clarifyGate}
              </span>
            )}
          </div>
        </div>
      )}

      {stage === "understanding" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <UnderstandingCard
            text={understanding}
            extraContext={selection.extraContext ?? ""}
            onExtraContext={(v) => setSelection({ ...selection, extraContext: v })}
            onConfirm={runThinking}
            onEdit={() => setStage("clarify")}
          />
        </div>
      )}

      {stage === "thinking" && (
        <div className="rounded-card border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${((step + 1) / thinkingSteps.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {thinkingSteps.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  i < step
                    ? "text-muted-foreground"
                    : i === step
                      ? "font-semibold text-card-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {i === step ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : i < step ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-border" />
                )}
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stage === "answer" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3 duration-300">
          <div className="flex items-start gap-2">
            <button
              onClick={() => setStage("understanding")}
              className="flex flex-1 items-start gap-2 rounded-card border border-dashed border-border bg-secondary/30 px-3.5 py-2.5 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-primary/50 hover:text-card-foreground"
            >
              <span className="mt-px shrink-0 font-bold text-primary">{t.advisor.situation}</span>
              <span className="flex-1 line-clamp-2">{understanding}</span>
              <span className="shrink-0 font-bold text-primary">{t.advisor.changeSituation}</span>
            </button>
            <button
              onClick={() => {
                clearDraft();
                onReset();
              }}
              aria-label={t.advisor.closeAnswer}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-card border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-card-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <AdvisorAnswer answer={answer} />

          {SHOW_FOLLOWUP_ACTIONS && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowNegotiation((v) => !v)}
              >
                <ClipboardList className="h-3.5 w-3.5" /> {t.advisor.negotiationButton}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowShareholder((v) => !v)}
              >
                <Presentation className="h-3.5 w-3.5" /> {t.advisor.shareholderButton}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleSave}>
                {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? t.common.saved : t.advisor.saveAnalysis}
              </Button>
            </div>
          )}

          {showNegotiation && (
            <div className="rounded-card border border-border bg-card p-4 shadow-soft">
              <p className="text-xs font-bold text-muted-foreground">
                {t.advisor.negotiationTitle}
              </p>
              <div className="mt-3 space-y-3">
                {negotiationQuestions.groups.map((g) => (
                  <div key={g.title}>
                    <p className="text-xs font-bold text-primary">{g.title}</p>
                    <ul className="mt-1 space-y-1">
                      {g.questions.map((q) => (
                        <li
                          key={q}
                          className="flex gap-2 text-sm leading-relaxed text-card-foreground"
                        >
                          <span
                            aria-hidden
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                          />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showShareholder && (
            <div className="rounded-card border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-muted-foreground">
                  {t.advisor.shareholderTitle}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard?.writeText(shareholderSummary)}
                >
                  {t.common.copy}
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-card-foreground">
                {shareholderSummary}
              </p>
            </div>
          )}

          <div className="rounded-card border border-border bg-card p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <MessageSquarePlus className="h-3.5 w-3.5 text-primary" /> {t.advisor.followUpTitle}
            </p>

            {thread.length > 0 && (
              <div className="mt-3 space-y-2.5">
                {thread.map((m, i) =>
                  m.author === "user" ? (
                    <MessageBubble
                      key={i}
                      variant="user"
                      className="ml-8"
                      bubbleClassName="px-3 py-2"
                    >
                      {m.text}
                    </MessageBubble>
                  ) : (
                    <MessageBubble
                      key={i}
                      variant="entity"
                      avatar={
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12">
                          <Sparkle className="h-3.5 w-3.5 text-primary" />
                        </span>
                      }
                      bubbleClassName="bg-secondary/40 px-3 py-2"
                    >
                      {m.text}
                    </MessageBubble>
                  ),
                )}
                {thinkingFollowUp && (
                  <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />{" "}
                    {t.advisor.followUpThinking}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                t.clarify.followUpVolume,
                t.clarify.followUpExclusivity,
                t.clarify.followUpWindow,
              ].map((q) => (
                <button
                  key={q}
                  disabled={thinkingFollowUp}
                  onClick={() => askFollowUp(q)}
                  className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-px hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <label htmlFor="advisor-follow-up" className="sr-only">
                {t.advisor.followUpLabel}
              </label>
              <input
                id="advisor-follow-up"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                disabled={thinkingFollowUp}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askFollowUp(followUp);
                }}
                placeholder={t.advisor.followUpPlaceholder}
                className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
              />
              <Button
                size="icon"
                disabled={!followUp.trim() || thinkingFollowUp}
                onClick={() => askFollowUp(followUp)}
                aria-label={t.advisor.followUpSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/60">{t.common.aiDisclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
