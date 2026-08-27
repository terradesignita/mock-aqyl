import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeCardData } from "@/data/mockCards";
import { useT, type Dictionary } from "@/lib/i18n";

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export function buildQuiz(card: KnowledgeCardData, t: Dictionary): QuizQuestion[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const cite = card.citations[0]?.source_anchor ?? card.source;
  const q = t.quiz;

  return [
    {
      q: q.q1(card.title),
      options: [card.core_insight, q.q1o2, q.q1o3],
      correct: 0,
      why: q.q1why(cite),
    },
    {
      q: q.q2,
      options: [q.q2o1, q.q2o2(card.business_unit), q.q2o3],
      correct: 1,
      why: q.q2why(card.business_unit),
    },
    {
      q: q.q3,
      options: [q.q3o1, q.q3o2, q.q3o3],
      correct: 2,
      why: q.q3why,
    },
    {
      q: steps.length ? q.q4Step(steps[0]) : q.q4Fallback,
      options: [card.framework?.[0]?.description ?? q.q4o1Fallback, q.q4o2, q.q4o3],
      correct: 0,
      why: q.q4why,
    },
    {
      q: q.q5,
      options: [q.q5o1, q.q5o2, q.q5o3],
      correct: 1,
      why: q.q5why(card.author),
    },
  ];
}

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const t = useT();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const done = answered === questions.length;
  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-secondary/40 p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-card-foreground">
          <span>{t.quiz.answeredOf(answered, questions.length)}</span>
          <span
            className={
              done ? (pct >= 70 ? "text-success" : "text-destructive") : "text-muted-foreground"
            }
          >
            {done ? t.quiz.result(pct) : t.quiz.passMark}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-2 rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {questions.map((q, qi) => {
        const picked = answers[qi];
        const isAnswered = picked !== undefined;
        return (
          <div key={q.q} className="rounded-2xl border border-border bg-card p-3">
            <p className="text-xs font-bold text-accent">{t.quiz.questionN(qi + 1)}</p>
            <p className="mt-1 text-sm font-semibold leading-snug text-card-foreground">{q.q}</p>
            <div className="mt-2.5 space-y-1.5">
              {q.options.map((opt, oi) => {
                const isCorrect = oi === q.correct;
                const isPicked = picked === oi;
                const state = !isAnswered
                  ? "border-border hover:border-primary/50 hover:bg-secondary/50"
                  : isCorrect
                    ? "border-success bg-success/10"
                    : isPicked
                      ? "border-destructive bg-destructive/10"
                      : "border-border opacity-60";
                return (
                  <button
                    key={opt}
                    disabled={isAnswered}
                    onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                    className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs leading-relaxed text-card-foreground transition-[border-color,background-color,opacity] ${state}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <Check className="h-4 w-4 shrink-0 text-success" />}
                    {isAnswered && isPicked && !isCorrect && (
                      <X className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <p className="mt-2 rounded-lg bg-secondary/50 p-2 text-xs leading-relaxed text-muted-foreground animate-fade-in">
                {q.why}
              </p>
            )}
          </div>
        );
      })}

      {answered > 0 && (
        <Button
          size="sm"
          variant={done ? "default" : "ghost"}
          className="gap-1.5"
          onClick={() => setAnswers({})}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t.quiz.retake}
        </Button>
      )}
    </div>
  );
}
