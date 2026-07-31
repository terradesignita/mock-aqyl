import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeCardData } from "@/data/mockCards";

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export function buildQuiz(card: KnowledgeCardData): QuizQuestion[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const cite = card.citations[0]?.source_anchor ?? card.source;

  return [
    {
      q: `Какой главный вывод материала «${card.title}»?`,
      options: [
        card.core_insight,
        "Эффект достигается только при полной автоматизации всех процессов",
        "Метрики не меняются в первый год внедрения",
      ],
      correct: 0,
      why: `Прямая цитата из источника: ${cite}.`,
    },
    {
      q: `Кто в первую очередь выигрывает от применения подхода в BI Group?`,
      options: [
        "Внешние подрядчики",
        `Бизнес-юнит «${card.business_unit}»`,
        "Только топ-менеджмент",
      ],
      correct: 1,
      why: `Материал описывает контекст «${card.business_unit}» — там эффект воспроизводим быстрее всего.`,
    },
    {
      q: "Что критично зафиксировать до старта пилота?",
      options: [
        "Финальный бюджет масштабирования",
        "Состав проектного офиса",
        "Baseline метрик — иначе эффект нечем измерить",
      ],
      correct: 2,
      why: "Без baseline любые цифры «после» не проверяемы и не защищаются на комитете.",
    },
    {
      q: steps.length ? `Что происходит на шаге «${steps[0]}»?` : "С чего начинается внедрение?",
      options: [
        card.framework?.[0]?.description ?? "Фиксируем текущее состояние и договариваемся о цели",
        "Сразу масштабируем решение на все объекты",
        "Передаём задачу внешнему консультанту",
      ],
      correct: 0,
      why: "Первый шаг всегда про диагностику, а не про масштабирование.",
    },
    {
      q: "Какой горизонт эффекта заявлен по материалу?",
      options: ["1–2 недели", "6–12 месяцев", "3–5 лет"],
      correct: 1,
      why: `Автор (${card.author}) описывает эффект в горизонте 6–12 месяцев после пилота.`,
    },
  ];
}

export function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const done = answered === questions.length;
  const pct = Math.round((score / questions.length) * 100);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-secondary/40 p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-card-foreground">
          <span>
            Отвечено {answered} из {questions.length}
          </span>
          <span
            className={
              done ? (pct >= 70 ? "text-success" : "text-destructive") : "text-muted-foreground"
            }
          >
            {done ? `${pct}% · ${pct >= 70 ? "зачёт" : "нужно повторить"}` : "проходной балл 70%"}
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
            <p className="text-xs font-bold text-accent">
              Вопрос {qi + 1}
            </p>
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
          <RotateCcw className="h-3.5 w-3.5" /> Пройти заново
        </Button>
      )}
    </div>
  );
}
