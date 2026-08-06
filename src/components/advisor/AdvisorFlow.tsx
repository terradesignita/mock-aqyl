import { Fragment, useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/HelpHint";
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
  THINKING_STEPS,
  visibleQuestions,
  type AdvisorSelection,
  type FollowUpFlags,
} from "@/data/advisor";
import type { AdvisorSession } from "@/hooks/useAppState";
import { ClarifyBlock } from "@/components/advisor/ClarifyBlock";
import { UnderstandingCard } from "@/components/advisor/UnderstandingCard";
import { AdvisorAnswer } from "@/components/advisor/AdvisorAnswer";

// ponytail: скрыто, пока не понадобится — вопросы партнёру / версия для акционера /
// сохранение анализа. Верните в true, когда эти сценарии снова станут нужны.
const SHOW_FOLLOWUP_ACTIONS = false;

type Stage = "clarify" | "understanding" | "thinking" | "answer";

const STAGES: { id: Stage; label: string }[] = [
  { id: "clarify", label: "Уточнение" },
  { id: "understanding", label: "Понимание" },
  { id: "thinking", label: "Анализ" },
  { id: "answer", label: "Рекомендация" },
];

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
  const current = STAGES.findIndex((s) => s.id === stage);
  return (
    <ol className="flex w-full items-center">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={s.id}>
            <li className="flex shrink-0 items-center">
              <button
                type="button"
                disabled={!done}
                onClick={() => done && onGoTo(s.id)}
                aria-label={s.label}
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
                  {s.label}
                </span>
              </button>
            </li>
            {i < STAGES.length - 1 && (
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
  const dilemma = useMemo(() => classify(query), [query]);
  const known = useMemo(() => extractKnown(query), [query]);
  const [selection, setSelection] = useState<AdvisorSelection>(
    () => initialSession?.selection ?? { choices: {}, own: {} },
  );
  const [stage, setStage] = useState<Stage>(() => (initialSession ? "answer" : "clarify"));
  const [qIndex, setQIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [followUp, setFollowUp] = useState("");
  const [thread, setThread] = useState<FollowUpMessage[]>(() => initialSession?.thread ?? []);
  const [thinkingFollowUp, setThinkingFollowUp] = useState(false);
  const [followUpFlags, setFollowUpFlags] = useState<FollowUpFlags>(
    () => initialSession?.followUpFlags ?? {},
  );
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showShareholder, setShowShareholder] = useState(false);
  const [saved, setSaved] = useState(false);

  const questions = visibleQuestions(dilemma, selection);
  const enough = contextIsSufficient(dilemma, selection);
  const understanding = buildUnderstanding(dilemma, selection, query);
  const answer = useMemo(
    () => buildAnswer(dilemma, selection, followUpFlags),
    [dilemma, selection, followUpFlags],
  );
  const negotiationQuestions = useMemo(() => buildNegotiationQuestions(dilemma), [dilemma]);
  const shareholderSummary = useMemo(() => buildShareholderSummary(answer), [answer]);

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
      const reply = buildFollowUpReply(value, answer);
      setThinkingFollowUp(false);
      setThread((t) => [...t, { author: "advisor", text: reply.text }]);
      if (reply.flags) setFollowUpFlags((f) => ({ ...f, ...reply.flags }));
    }, 650);
  };

  const runThinking = () => {
    setStage("thinking");
    setStep(0);
    THINKING_STEPS.forEach((_, i) => {
      window.setTimeout(() => setStep(i), i * 420);
    });
    window.setTimeout(() => setStage("answer"), THINKING_STEPS.length * 420);
  };

  if (!isManagerialQuery(query)) {
    return (
      <div className="rounded-card border border-border bg-card p-5 shadow-soft">
        <p className="text-sm font-bold text-card-foreground">
          Это похоже на поиск материалов, а не на управленческий вопрос
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          AI-советник работает со стратегическими решениями: партнёрство, продажа доли, выход на
          рынок, масштабирование, инвестиции. Выключите тумблер, чтобы найти документы и кейсы, или
          сформулируйте ситуацию и вопрос — что нужно решить.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onReset}>
          Переформулировать
        </Button>
      </div>
    );
  }

  const currentStageLabel = STAGES.find((s) => s.id === stage)?.label ?? "";

  return (
    <div className="space-y-4">
      <span role="status" aria-live="polite" className="sr-only">
        {`Этап: ${currentStageLabel}`}
      </span>
      {/* Шапка режима: тип решения, прогресс, сброс */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-card border border-border bg-card px-4 py-2.5 shadow-soft xl:flex-nowrap">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/12">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </span>
        <HelpHint
          side="bottom"
          text={`Тип решения определён по вашему запросу. Из запроса понятно: ${known.join("; ")}.`}
        />
        <span className="mx-1 min-w-0 flex-1">
          <Stepper stage={stage} onGoTo={setStage} />
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
              Назад
            </Button>
            {qIndex < questions.length - 1 ? (
              <Button size="sm" onClick={() => setQIndex((i) => i + 1)}>
                Далее
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!enough}
                aria-describedby={!enough ? "clarify-gate-hint" : undefined}
                onClick={() => setStage("understanding")}
              >
                Далее
              </Button>
            )}
            {!enough && qIndex === questions.length - 1 && (
              <span
                id="clarify-gate-hint"
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <PenLine className="h-3.5 w-3.5" /> Ответьте на ключевые вопросы — без этого
                рекомендация не формируется.
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
              style={{ width: `${((step + 1) / THINKING_STEPS.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {THINKING_STEPS.map((s, i) => (
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
          <button
            onClick={() => setStage("understanding")}
            className="flex w-full items-start gap-2 rounded-card border border-dashed border-border bg-secondary/30 px-3.5 py-2.5 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-primary/50 hover:text-card-foreground"
          >
            <span className="mt-px shrink-0 font-bold text-primary">Ситуация</span>
            <span className="flex-1 line-clamp-2">{understanding}</span>
            <span className="shrink-0 font-bold text-primary">изменить</span>
          </button>

          <AdvisorAnswer answer={answer} />

          {SHOW_FOLLOWUP_ACTIONS && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowNegotiation((v) => !v)}
              >
                <ClipboardList className="h-3.5 w-3.5" /> Подготовить вопросы партнёру
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowShareholder((v) => !v)}
              >
                <Presentation className="h-3.5 w-3.5" /> Сделать версию для акционера
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleSave}>
                {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? "Сохранено" : "Сохранить анализ"}
              </Button>
            </div>
          )}

          {showNegotiation && (
            <div className="rounded-card border border-border bg-card p-4 shadow-soft">
              <p className="text-xs font-bold text-muted-foreground">Вопросы для переговоров</p>
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
                <p className="text-xs font-bold text-muted-foreground">Версия для акционера</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard?.writeText(shareholderSummary)}
                >
                  Скопировать
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-card-foreground">
                {shareholderSummary}
              </p>
            </div>
          )}

          <div className="rounded-card border border-border bg-card p-4 shadow-soft">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <MessageSquarePlus className="h-3.5 w-3.5 text-primary" /> Уточнить или изменить
              условия
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
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Смотрю, что
                    меняется в рекомендации...
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "А если партнёр даст гарантированный объём?",
                "Что изменится при эксклюзивности только на один сегмент?",
                "Какой сценарий выбрать, если рыночное окно 6 месяцев?",
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
                Уточняющий вопрос по рекомендации
              </label>
              <input
                id="advisor-follow-up"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                disabled={thinkingFollowUp}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askFollowUp(followUp);
                }}
                placeholder="Задайте уточняющий вопрос по этой рекомендации"
                className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
              />
              <Button
                size="icon"
                disabled={!followUp.trim() || thinkingFollowUp}
                onClick={() => askFollowUp(followUp)}
                aria-label="Отправить уточнение"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/60">
              AQYL — ИИ и может ошибаться. Пожалуйста, перепроверяйте факты и цитируемые источники.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
