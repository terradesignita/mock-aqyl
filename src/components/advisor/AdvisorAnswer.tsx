import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Lightbulb,
  ListChecks,
  Quote,
  ShieldQuestion,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import type { Answer } from "@/data/advisor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const APPLICABILITY_TONE: Record<Answer["caseRef"]["applicability"], string> = {
  "Высокая применимость": "border-scope-internal/50 bg-scope-internal/10 text-scope-internal",
  "Частичная применимость": "border-accent/50 bg-accent/10 text-accent",
  "Слабая аналогия": "border-border bg-secondary text-muted-foreground",
};

const EVIDENCE_TONE: Record<Answer["evidenceLevel"], string> = {
  высокий: "border-scope-internal/50 bg-scope-internal/10 text-scope-internal",
  средний: "border-accent/50 bg-accent/10 text-accent",
  низкий: "border-destructive/50 bg-destructive/10 text-destructive",
  "недостаточно данных": "border-destructive/50 bg-destructive/10 text-destructive",
};

function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: React.ReactNode;
  icon: typeof Target;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-card border border-border bg-card shadow-soft transition-colors hover:border-primary/30">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <h3 className="flex-1 text-sm font-bold text-card-foreground">{title}</h3>
        <span className="hidden text-xs font-medium text-muted-foreground/50 sm:inline">
          {open ? "Свернуть" : "Развернуть"}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 border-t border-border px-4 py-3 text-sm duration-200">
          {children}
        </div>
      )}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-sm leading-relaxed text-card-foreground">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function AdvisorAnswer({ answer }: { answer: Answer }) {
  const refusal = answer.evidenceLevel === "недостаточно данных";

  // Confident verdicts lead with the answer, at the top. An honest refusal reads
  // backwards up there — before the reasoning, "недостаточно данных" looks like
  // the AI gave up without looking — so it renders as the closing word instead,
  // after the sections below have shown the reasoning that led to it.
  const verdict = (
    <section
      className={`rounded-card border-2 p-6 shadow-brand ${
        refusal
          ? "border-destructive/50 bg-gradient-to-br from-destructive/10 via-destructive/[0.04] to-transparent"
          : "border-primary/50 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent"
      }`}
    >
      <p className={`text-xs font-bold ${refusal ? "text-destructive" : "text-primary"}`}>
        {refusal ? "Честный отказ" : "Краткий вывод"}
      </p>
      <h2 className="mt-1.5 text-xl font-extrabold leading-snug text-card-foreground">
        {answer.verdict}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer.verdictDetail}</p>

      <div className="mt-4 rounded-control border-l-4 border-accent bg-accent/10 p-4">
        <p className="flex items-center gap-2 text-xs font-bold text-accent">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15">
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          Главный стратегический инсайт
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-card-foreground">
          {answer.insight}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn("gap-1.5 font-bold", EVIDENCE_TONE[answer.evidenceLevel])}
        >
          Уровень доказательности: {answer.evidenceLevel}
        </Badge>
        <span className="text-xs text-muted-foreground">{answer.evidenceNote}</span>
      </div>
    </section>
  );

  return (
    <div className="space-y-3">
      {!refusal && verdict}

      <div className="grid items-start gap-3 xl:grid-cols-2">
        <Section title="Почему сделан такой вывод" icon={ListChecks}>
          <ol className="space-y-2">
            {answer.arguments.map((a, i) => (
              <li key={a} className="flex gap-2.5 text-sm leading-relaxed text-card-foreground">
                <Badge variant="tint" size="counter" className="h-5 min-w-5 shrink-0 font-bold">
                  {i + 1}
                </Badge>
                {a}
              </li>
            ))}
          </ol>
        </Section>

        <Section title={`Релевантный кейс: ${answer.caseRef.title}`} icon={BookOpen}>
          <Badge
            variant="outline"
            className={cn("font-bold", APPLICABILITY_TONE[answer.caseRef.applicability])}
          >
            {answer.caseRef.applicability}
          </Badge>
          <p className="mt-2 text-sm leading-relaxed text-card-foreground">
            {answer.caseRef.summary}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-control border border-scope-internal/40 bg-scope-internal/8 p-3">
              <p className="text-xs font-bold text-scope-internal">Что совпадает</p>
              <div className="mt-1.5">
                <Bullets items={answer.caseRef.matches} />
              </div>
            </div>
            <div className="rounded-control border border-destructive/40 bg-destructive/8 p-3">
              <p className="text-xs font-bold text-destructive">Что различается</p>
              <div className="mt-1.5">
                <Bullets items={answer.caseRef.differences} />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Что можно и что нельзя переносить" icon={Target}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-bold text-primary">Можно перенести</p>
              <Bullets items={answer.transferable} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-muted-foreground">
                Нельзя переносить напрямую
              </p>
              <Bullets items={answer.nonTransferable} />
            </div>
          </div>
        </Section>

        <Section title="Рекомендация и предлагаемые условия" icon={Target}>
          <p className="rounded-control border-l-4 border-primary bg-primary/6 p-3 text-sm font-semibold leading-relaxed text-card-foreground">
            {answer.recommendation}
          </p>
          <p className="mb-1.5 mt-3 text-xs font-bold text-muted-foreground">
            Предлагаемые условия
          </p>
          <Bullets items={answer.terms} />
        </Section>
      </div>

      <Section title="Варианты решения" icon={ListChecks}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Сценарий</th>
                <th className="py-2 pr-3 font-semibold">Скорость</th>
                <th className="py-2 pr-3 font-semibold">Контроль</th>
                <th className="py-2 pr-3 font-semibold">Риск</th>
                <th className="py-2 font-semibold">Когда подходит</th>
              </tr>
            </thead>
            <tbody>
              {answer.scenarios.map((s) => (
                <tr
                  key={s.name}
                  className={`border-t border-border ${s.recommended ? "bg-primary/6" : ""}`}
                >
                  <td className="py-2 pr-3 font-semibold text-card-foreground">
                    {s.name}
                    {s.recommended && (
                      <Badge variant="primary" className="ml-2 font-bold">
                        рекомендуем
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.speed}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.control}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{s.risk}</td>
                  <td className="py-2 text-muted-foreground">{s.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid items-start gap-3 xl:grid-cols-2">
        <Section title="Риски" icon={AlertTriangle}>
          <Bullets items={answer.risks} />
        </Section>

        <Section title="Что может изменить рекомендацию" icon={CircleHelp}>
          <Bullets items={answer.changeFactors} />
        </Section>
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-2">
        <Section title="Чего не хватает для окончательного решения" icon={ShieldQuestion}>
          <Bullets items={answer.missing} />
        </Section>

        <Section
          title={
            <span className="inline-flex items-center gap-2">
              Источники
              <Badge variant="tint" size="counter" className="h-5 min-w-5 font-bold">
                {answer.sources.length}
              </Badge>
            </span>
          }
          icon={Quote}
        >
          <ul className="space-y-2">
            {answer.sources.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toast.success(`Источник «${s.title}» открыт`)}
                  className="group w-full rounded-control border border-border bg-secondary/40 p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary/60"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-card-foreground group-hover:text-primary group-hover:underline">
                      {s.title}
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </span>
                    <Badge variant="secondary" className="bg-card font-bold">
                      {s.kind}
                    </Badge>
                    <Badge variant="tint" className="font-bold">
                      {s.influence}
                    </Badge>
                  </div>
                  <p className="mt-1.5 border-l-2 border-accent pl-2 text-xs italic leading-relaxed text-muted-foreground">
                    «{s.quote}»
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {refusal && verdict}
    </div>
  );
}
