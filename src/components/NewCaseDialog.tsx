import { useEffect, useRef, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCEPTED_ATTR,
  ACCEPTED_FORMATS,
  deriveTitle,
  extensionOf,
  familyOf,
  formatBytes,
  ingestStages,
  triageFiles,
  type IngestStage,
} from "@/lib/sources";
import { BUSINESS_UNITS, type KnowledgeCardData, type MediaType } from "@/data/mockCards";
import { BCP47, useI18n, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Длительность одного этапа обработки. Прототип показывает состояние, не работу. */
const STAGE_MS = 700;

/** Тип материала выводится из формата файла — так же, как это сделал бы разбор на сервере. */
const MEDIA_BY_FAMILY: Record<ReturnType<typeof familyOf>, MediaType> = {
  text: "document",
  document: "document",
  slides: "presentation",
  audio: "podcast",
  video: "video",
};

export interface NewCaseUpload {
  title: string;
  format: string;
  size: string;
  fileName: string;
  excerpt?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Кейс и файл, из которого он создан: файл становится первым источником кейса. */
  onCreated: (card: KnowledgeCardData, upload: NewCaseUpload) => void;
  /** Направление бизнеса по умолчанию — то, в котором работает пользователь. */
  defaultUnit: string;
}

export function NewCaseDialog({ open, onOpenChange, onCreated, defaultUnit }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [unit, setUnit] = useState(defaultUnit);
  const [drag, setDrag] = useState(false);
  const [rejected, setRejected] = useState<{ name: string; format: string }[]>([]);
  const [stages, setStages] = useState<IngestStage[] | null>(null);
  const [step, setStep] = useState(0);
  const [fileLabel, setFileLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  // Таймеры этапов не должны продолжать тикать после закрытия диалога.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (open) return;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setStages(null);
    setStep(0);
    setRejected([]);
    setDrag(false);
  }, [open]);

  const accept = async (list: FileList | File[] | null) => {
    const incoming = Array.from(list ?? []);
    if (incoming.length === 0) return;

    const { accepted, rejected: bad } = triageFiles(incoming);
    setRejected(
      bad.map((f) => ({ name: f.name, format: extensionOf(f.name) || t.sources.noTypeLabel })),
    );
    if (bad.length > 0) {
      toast.error(
        bad.length === 1 ? t.sources.rejectedOne(bad[0].name) : t.sources.rejectedMany(bad.length),
      );
    }

    const file = accepted[0];
    if (!file) return;
    if (accepted.length > 1) toast.info(t.newCase.onlyFirstFile(accepted.length - 1));

    const chain = ingestStages(file.name, t);
    const title = await deriveTitle(file, t, BCP47[locale]);
    const family = familyOf(file.name);
    const excerpt =
      family === "text"
        ? await file
            .text()
            .then((text) => text.trim().slice(0, 900))
            .catch(() => undefined)
        : undefined;

    setFileLabel(`${file.name} · ${formatBytes(file.size, t)}`);
    setStages(chain);
    setStep(0);

    // Этапы идут последовательно — как приходили бы статусы разбора с сервера.
    chain.forEach((_, i) => {
      if (i === 0) return;
      timersRef.current.push(window.setTimeout(() => setStep(i), i * STAGE_MS));
    });

    timersRef.current.push(
      window.setTimeout(() => {
        onCreated(
          {
            id: `case_${Date.now()}`,
            title,
            // Содержимое не разобрано — говорим об этом прямо, а не подставляем выдуманный текст.
            executive_summary: excerpt ?? t.newCase.pendingSummary,
            core_insight: t.newCase.pendingInsight,
            citations: [],
            source: file.name,
            author: `${t.profile.firstName} ${t.profile.lastName}`,
            language: locale.toUpperCase() as KnowledgeCardData["language"],
            scope: "INTERNAL",
            // Свежий кейс виден сразу: relevance участвует только в ранжировании поиска.
            relevance: 95,
            date: new Date().toISOString().slice(0, 10),
            media_type: MEDIA_BY_FAMILY[family],
            business_unit: unit,
            tags: [],
            isNew: true,
          },
          {
            title,
            format: extensionOf(file.name).toUpperCase(),
            size: formatBytes(file.size, t),
            fileName: file.name,
            excerpt,
          },
        );
        onOpenChange(false);
        toast.success(t.newCase.created(title));
      }, chain.length * STAGE_MS),
    );
  };

  const busy = stages !== null;
  const stage = stages?.[step];

  return (
    <Dialog open={open} onOpenChange={(next) => (busy ? undefined : onOpenChange(next))}>
      <DialogContent className="max-w-xl rounded-card">
        <div>
          <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
            {t.newCase.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t.newCase.body}
          </DialogDescription>
        </div>

        {busy && stage ? (
          <div className="rounded-card border border-primary/30 bg-primary/[0.04] p-4">
            <p className="truncate text-xs font-semibold text-muted-foreground">{fileLabel}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${((step + 1) / stages.length) * 100}%` }}
              />
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              {stage.label}
              <span className="ml-auto text-xs font-medium text-muted-foreground">
                {step + 1}/{stages.length}
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stage.detail}</p>
          </div>
        ) : (
          <>
            <div>
              <label
                htmlFor="new-case-unit"
                className="text-xs font-semibold text-muted-foreground"
              >
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
                void accept(e.dataTransfer.files);
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
                void accept(e.target.files);
                e.target.value = "";
              }}
            />

            {rejected.length > 0 && (
              <div className="rounded-card border border-destructive/40 bg-destructive/8 p-3">
                <p className="flex items-start gap-1.5 text-xs font-bold text-destructive">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1">{t.sources.rejectedTitle}</span>
                  <button
                    onClick={() => setRejected([])}
                    aria-label={t.sources.rejectedHide}
                    className="-m-1 shrink-0 p-1 text-destructive/70 transition-colors hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {rejected.map((r) => (
                    <li key={r.name} className="truncate text-xs text-card-foreground">
                      {r.name} <span className="text-muted-foreground">· {r.format}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t.sources.rejectedBody}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                {t.common.cancel}
              </Button>
              <Button size="sm" onClick={() => inputRef.current?.click()}>
                <Plus className="mr-1.5 h-4 w-4" />
                {t.newCase.pickFile}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
