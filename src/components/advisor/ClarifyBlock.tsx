import { useState } from "react";
import { Plus } from "lucide-react";
import { HelpHint } from "@/components/HelpHint";
import type { AdvisorSelection, ClarifyQuestion, Dilemma } from "@/data/advisor";
import { useT } from "@/lib/i18n";

interface Props {
  dilemma: Dilemma;
  questions: ClarifyQuestion[];
  selection: AdvisorSelection;
  onChange: (next: AdvisorSelection) => void;
  index: number;
  onIndex: (i: number) => void;
}

const UNKNOWN = "__unknown";

export function ClarifyBlock({ dilemma, questions, selection, onChange, index, onIndex }: Props) {
  const t = useT();
  const [ownOpen, setOwnOpen] = useState(false);
  const q = questions[Math.min(index, questions.length - 1)];
  if (!q) return null;

  const picked = selection.choices[q.id] ?? [];
  const own = selection.own[q.id] ?? "";

  const toggle = (optionId: string) => {
    const next = q.multi
      ? picked.includes(optionId)
        ? picked.filter((x) => x !== optionId)
        : optionId === UNKNOWN
          ? [UNKNOWN]
          : [...picked.filter((x) => x !== UNKNOWN), optionId]
      : picked.includes(optionId)
        ? []
        : [optionId];
    onChange({ ...selection, choices: { ...selection.choices, [q.id]: next } });
  };

  const options = q.unknown ? [...q.options, { id: UNKNOWN, label: t.clarify.unknown }] : q.options;
  const showOwn = ownOpen || own.length > 0;

  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-soft">
      <span role="status" aria-live="polite" className="sr-only">
        {t.clarify.questionOfTitle(index + 1, questions.length, q.title)}
      </span>
      {/* Точки-прогресс: сколько вопросов и где мы сейчас */}
      <div className="flex items-center gap-2">
        {questions.map((item, i) => {
          const done =
            (selection.choices[item.id]?.length ?? 0) > 0 ||
            (selection.own[item.id] ?? "").trim().length > 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={t.clarify.questionN(i + 1)}
              className="flex h-6 flex-1 items-center"
            >
              <span
                aria-hidden
                className={`h-1.5 w-full rounded-full transition-colors ${
                  i === index ? "bg-primary" : done ? "bg-primary/35" : "bg-border"
                }`}
              />
            </button>
          );
        })}
        <span className="ml-1 shrink-0 text-xs font-bold text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2">
        <h2 className="text-base font-bold leading-snug text-card-foreground">{q.title}</h2>
        <span className="mt-1">
          <HelpHint
            side="right"
            text={t.clarify.modeHint(Boolean(q.multi), dilemma.drivers.join(", "))}
          />
        </span>
      </div>

      <div
        className="mt-3 grid gap-2 sm:grid-cols-2"
        role={q.multi ? undefined : "radiogroup"}
        aria-label={q.multi ? undefined : q.title}
      >
        {options.map((o) => {
          const on = picked.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              role={q.multi ? undefined : "radio"}
              aria-checked={q.multi ? undefined : on}
              aria-pressed={q.multi ? on : undefined}
              onClick={() => toggle(o.id)}
              className={`flex items-start gap-2.5 rounded-control border px-3.5 py-3 text-left text-sm transition-colors active:scale-[0.96] ${
                on
                  ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-card-foreground"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border-2 transition-colors ${
                  q.multi ? "rounded-[5px]" : "rounded-full"
                } ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {on && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      {showOwn ? (
        <>
          <label htmlFor={`clarify-own-${q.id}`} className="sr-only">
            {t.clarify.ownAnswerLabel(q.ownPlaceholder)}
          </label>
          <textarea
            id={`clarify-own-${q.id}`}
            autoFocus={ownOpen}
            value={own}
            onChange={(e) =>
              onChange({ ...selection, own: { ...selection.own, [q.id]: e.target.value } })
            }
            rows={2}
            placeholder={t.clarify.ownOption(q.ownPlaceholder)}
            className="mt-2.5 w-full resize-y rounded-control border border-border bg-secondary/40 px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOwnOpen(true)}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3 w-3" /> {t.advisor.ownAnswer}
        </button>
      )}
    </div>
  );
}
