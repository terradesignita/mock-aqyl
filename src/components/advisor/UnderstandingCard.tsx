import { Check, PenLine, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

interface Props {
  text: string;
  extraContext: string;
  onExtraContext: (v: string) => void;
  onConfirm: () => void;
  onEdit: () => void;
}

export function UnderstandingCard({
  text,
  extraContext,
  onExtraContext,
  onConfirm,
  onEdit,
}: Props) {
  const t = useT();
  return (
    <section className="rounded-card border-2 border-primary/35 bg-primary/5 p-5 shadow-soft">
      <h2 className="text-sm font-bold text-card-foreground">{t.advisor.understandingTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-card-foreground">{text}</p>

      <label htmlFor="advisor-extra-context" className="sr-only">
        {t.advisor.extraContextPlaceholder}
      </label>
      <textarea
        id="advisor-extra-context"
        value={extraContext}
        onChange={(e) => onExtraContext(e.target.value)}
        rows={2}
        placeholder={t.advisor.extraContextPlaceholder}
        className="mt-3 w-full resize-y rounded-control border border-border bg-card px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="gap-1.5" onClick={onConfirm}>
          <Check className="h-4 w-4" /> {t.advisor.allCorrect}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}>
          <Undo2 className="h-4 w-4" /> {t.advisor.editAnswers}
        </Button>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PenLine className="h-3.5 w-3.5" /> {t.advisor.confirmGate}
        </span>
      </div>
    </section>
  );
}
