import { useEffect, useRef, useState } from "react";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCEPTED_ATTR, ACCEPTED_FORMATS } from "@/lib/sources";
import { BUSINESS_UNITS } from "@/data/mockCards";
import { useIngest } from "@/lib/ingest";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Направление бизнеса по умолчанию — то, в котором работает пользователь. */
  defaultUnit: string;
}

/**
 * Вход для нового знания (рис. 40). Диалог только принимает файл: этапы разбора,
 * прогресс и отказ по формату показывает виджет статуса, видимый с любого экрана.
 */
export function NewCaseDialog({ open, onOpenChange, defaultUnit }: Props) {
  const t = useT();
  const { start } = useIngest();
  const [unit, setUnit] = useState(defaultUnit);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setDrag(false);
  }, [open]);

  const accept = (list: FileList | File[] | null) => {
    if (!list || Array.from(list).length === 0) return;
    void start(list, { kind: "new", unit });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-card">
        <div>
          <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
            {t.newCase.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t.newCase.body}
          </DialogDescription>
        </div>

        <div>
          <label htmlFor="new-case-unit" className="text-xs font-semibold text-muted-foreground">
            {t.newCase.unitLabel}
          </label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="new-case-unit" className="mt-1.5 h-10 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_UNITS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            accept(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors",
            drag
              ? "border-primary bg-primary/[0.06]"
              : "border-border hover:border-primary/50 hover:bg-secondary/40",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/12">
            <FileUp className="h-5 w-5 text-primary" />
          </span>
          <span className="text-sm font-bold text-foreground">{t.newCase.dropTitle}</span>
          <span className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            {t.newCase.dropBody(ACCEPTED_FORMATS.length)}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70">
            {ACCEPTED_FORMATS.join(" · ")}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            accept(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
            {t.newCase.progressNote}
          </p>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <Plus className="mr-1.5 h-4 w-4" />
            {t.newCase.pickFile}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
