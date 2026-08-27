import { HelpHint } from "@/components/HelpHint";
import { HoverRevealIconButton } from "@/components/HoverRevealIconButton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileText,
  Link2,
  Loader2,
  MessageSquareText,
  MoreVertical,
  NotebookPen,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeCardData } from "@/data/mockCards";
import {
  ACCEPTED_ATTR,
  ACCEPTED_FORMATS,
  deriveTitle,
  extensionOf,
  familyOf,
  formatBytes,
  ingestStages,
  sourceToMarkdown,
  triageFiles,
  type IngestStage,
  type NotebookSource,
} from "@/lib/sources";
import type { StoredNote } from "@/hooks/useAppState";
import { downloadFile, safeFileName } from "@/lib/utils";
import { BCP47, useI18n, useT } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AcceptedUpload {
  /** Название, выведенное из содержимого или таймстемпа, а не имя файла. */
  title: string;
  format: string;
  size: string;
  fileName: string;
  excerpt?: string;
}

/** Файл в обработке: этапы и текущий шаг. */
interface Processing {
  key: string;
  fileName: string;
  size: string;
  stages: IngestStage[];
  step: number;
  upload: AcceptedUpload;
}

interface Props {
  card: KnowledgeCardData;
  sources: NotebookSource[];
  selected: string[];
  renames: Record<string, string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onUpload: (files: AcceptedUpload[]) => void;
  onOpenSource: (source: NotebookSource) => void;
  notes: StoredNote[];
  onRemoveNote: (id: string) => void;
  onCollapse?: () => void;
}

/** Длительность одного этапа обработки. Прототип показывает состояние, не работу. */
const STAGE_MS = 700;

/** Убирает из мета-строки ведущий тип («Ссылка · …», «PDF · …») — он уже показан чипом слева. */
function stripMetaPrefix(meta: string, linkLabel: string): string {
  const prefix = meta.split(" · ")[0];
  return prefix === linkLabel || /^[A-Z0-9]+$/.test(prefix) ? meta.slice(prefix.length + 3) : meta;
}

function Counter({ value, tone = "muted" }: { value: number; tone?: "muted" | "primary" }) {
  return (
    <Badge variant={tone === "primary" ? "tint" : "secondary"} size="counter" className="font-bold">
      {value}
    </Badge>
  );
}

export function SourcesPanel({
  card,
  sources,
  selected,
  renames,
  onToggle,
  onToggleAll,
  onRename,
  onRemove,
  onUpload,
  onOpenSource,
  notes,
  onRemoveNote,
  onCollapse,
}: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [drag, setDrag] = useState(false);
  const [processing, setProcessing] = useState<Processing[]>([]);
  const [rejected, setRejected] = useState<{ name: string; format: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const allSelected = selected.length === sources.length && sources.length > 0;
  const files = sources.filter((s) => s.kind === "file");
  const links = sources.filter((s) => s.kind === "link");

  const titleOf = (s: NotebookSource) => renames[s.id] ?? s.title;

  /**
   * Принимает файлы: валидирует формат, проводит по этапам обработки и добавляет
   * источники с названием из содержимого. Отклонённые файлы называются явно.
   */
  const accept = async (list: FileList | File[] | null) => {
    const incoming = Array.from(list ?? []);
    if (incoming.length === 0) return;

    const { accepted, rejected: bad } = triageFiles(incoming);

    if (bad.length > 0) {
      setRejected(
        bad.map((f) => ({ name: f.name, format: extensionOf(f.name) || t.sources.noTypeLabel })),
      );
      toast.error(
        bad.length === 1 ? t.sources.rejectedOne(bad[0].name) : t.sources.rejectedMany(bad.length),
      );
    }
    if (accepted.length === 0) return;

    for (const file of accepted) {
      const stages = ingestStages(file.name, t);
      const title = await deriveTitle(file, t, BCP47[locale]);
      const excerpt =
        familyOf(file.name) === "text"
          ? await file
              .text()
              .then((t) => t.trim().slice(0, 900))
              .catch(() => undefined)
          : undefined;

      const item: Processing = {
        key: `${file.name}_${file.size}_${Date.now()}`,
        fileName: file.name,
        size: formatBytes(file.size, t),
        stages,
        step: 0,
        upload: {
          title,
          format: extensionOf(file.name).toUpperCase(),
          size: formatBytes(file.size, t),
          fileName: file.name,
          excerpt,
        },
      };

      setProcessing((p) => [...p, item]);

      // Этапы проходят последовательно — так же, как приходят статусы по SSE.
      stages.forEach((_, i) => {
        if (i === 0) return;
        timersRef.current.push(
          window.setTimeout(
            () => setProcessing((p) => p.map((x) => (x.key === item.key ? { ...x, step: i } : x))),
            i * STAGE_MS,
          ),
        );
      });

      timersRef.current.push(
        window.setTimeout(() => {
          setProcessing((p) => p.filter((x) => x.key !== item.key));
          onUpload([item.upload]);
          toast.success(t.sources.addedOne(title));
        }, stages.length * STAGE_MS),
      );
    }
  };

  const rename = (s: NotebookSource) => {
    const next = window.prompt(t.sources.renamePrompt, titleOf(s));
    if (next && next.trim()) {
      onRename(s.id, next.trim());
      toast.success(t.sources.renamed);
    }
  };

  const download = (s: NotebookSource) => {
    const name = titleOf(s);
    downloadFile(sourceToMarkdown(s, name), `${safeFileName(name, "source")}.md`);
    toast.success(t.sources.downloaded);
  };

  const row = (s: NotebookSource) => {
    const on = selected.includes(s.id);
    const isLink = s.kind === "link";
    const Icon = isLink ? Link2 : FileText;
    const tone = isLink
      ? {
          text: "text-src-link",
          chip: "bg-src-link/12 text-src-link",
          ring: "border-src-link/55 bg-src-link/8",
        }
      : {
          text: "text-src-file",
          chip: "bg-src-file/12 text-src-file",
          ring: "border-src-file/55 bg-src-file/8",
        };
    return (
      <li
        key={s.id}
        className={`group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-lg border-2 px-2.5 py-1.5 transition-colors ${
          on ? tone.ring : "border-transparent hover:border-border hover:bg-secondary/50"
        }`}
      >
        <input
          type="checkbox"
          checked={on}
          onChange={() => onToggle(s.id)}
          aria-label={t.sources.useInChat(titleOf(s))}
          className="h-3.5 w-3.5 shrink-0 accent-[var(--color-primary)]"
        />
        <button
          onClick={() => onOpenSource(s)}
          className="flex min-w-0 items-center gap-2 text-left"
          title={titleOf(s)}
        >
          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${tone.chip}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-medium leading-tight text-card-foreground">
              {titleOf(s)}
            </span>
            <span className="block truncate text-xs leading-tight text-muted-foreground">
              <span className={`font-semibold ${tone.text}`}>
                {isLink ? t.sources.linkLabel : s.format}
              </span>
              {" · "}
              {stripMetaPrefix(s.meta, t.sources.linkLabel)}
            </span>
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <HoverRevealIconButton
              aria-label={t.sources.actionsMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </HoverRevealIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="truncate text-xs">{titleOf(s)}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOpenSource(s)}>
              <MessageSquareText className="h-4 w-4" /> {t.sources.openInReader}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => rename(s)}>
              <Pencil className="h-4 w-4" /> {t.common.rename}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => download(s)}>
              <Download className="h-4 w-4" /> {t.sources.downloadMd}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                onRemove(s.id);
                toast.success(t.sources.removed);
              }}
            >
              <Trash2 className="h-4 w-4" /> {t.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  };

  const group = (
    label: string,
    dot: string,
    items: NotebookSource[],
    empty: string,
    hint?: string,
  ) => (
    <div>
      <p className="flex items-center gap-1.5 px-1 pb-1 text-xs font-semibold text-muted-foreground">
        <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
        <Counter value={items.length} />
        {hint && <HelpHint side="bottom" text={hint} />}
      </p>
      {items.length === 0 ? (
        <p className="px-1 py-1 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-0.5">{items.map(row)}</ul>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 pb-2 pt-3.5">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
          {t.sources.title}
          <Counter value={selected.length} tone="primary" />
          <span className="text-xs font-medium text-muted-foreground">
            {t.sources.selectedOf(sources.length)}
          </span>
          <HelpHint side="bottom" text={t.sources.hint} />
        </p>
        <button
          onClick={onToggleAll}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {allSelected ? t.sources.deselectAll : t.sources.selectAll}
        </button>
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label={t.sources.collapse}
            title={t.sources.collapseTitle}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {selected.length === 0 && sources.length > 0 && (
        <p
          role="status"
          className="mx-3 mb-2 flex items-start gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-2 text-xs leading-relaxed text-card-foreground"
        >
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warning" />
          {t.sources.noneSelected}
        </p>
      )}

      <div className="px-3 pb-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_ATTR}
          className="sr-only"
          onChange={(e) => {
            void accept(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
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
          className={`flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed px-3 py-3 text-center transition-colors ${
            drag
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
          }`}
        >
          <Plus className="h-4 w-4" />
          <p className="text-xs font-medium leading-tight">{t.sources.dropzone}</p>
          <p className="text-xs leading-tight opacity-80">
            {ACCEPTED_FORMATS.map((f) => f.toUpperCase()).join(", ")}
          </p>
          <p className="text-xs leading-tight opacity-70">{t.sources.dropzoneNaming}</p>
        </button>

        {processing.length > 0 && (
          <ul className="mt-2 space-y-1.5" aria-live="polite">
            {processing.map((p) => {
              const stage = p.stages[p.step];
              return (
                <li
                  key={p.key}
                  className="rounded-lg border border-primary/40 bg-primary/8 px-2.5 py-2 text-xs"
                >
                  <p className="flex items-center gap-2 text-card-foreground">
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                    <span className="min-w-0 flex-1 truncate font-medium">{p.fileName}</span>
                    <span className="shrink-0 text-muted-foreground">{p.size}</span>
                  </p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${((p.step + 1) / p.stages.length) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 flex items-baseline gap-1.5 leading-snug">
                    <span className="font-semibold text-primary">{stage.label}</span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {stage.detail}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground/70">
                      {p.step + 1}/{p.stages.length}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {rejected.length > 0 && (
          <div
            role="alert"
            className="mt-2 rounded-lg border border-destructive/45 bg-destructive/8 p-2.5"
          >
            <p className="flex items-start gap-1.5 text-xs font-semibold text-destructive">
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
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {t.sources.rejectedBody}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        {group(t.sources.groupFiles, "bg-src-file", files, t.sources.groupFilesEmpty)}
        {group(
          t.sources.groupLinks,
          "bg-src-link",
          links,
          t.sources.groupLinksEmpty,
          t.sources.groupLinksHint,
        )}
      </div>

      <div className="max-h-[45%] overflow-y-auto border-t border-border p-3">
        <p className="flex items-center gap-1.5 pb-1.5 text-xs font-semibold text-card-foreground">
          <NotebookPen className="h-3.5 w-3.5 text-primary" /> {t.sources.notes}
          <Counter value={notes.length} />
          <HelpHint side="top" text={t.sources.notesHint} />
        </p>
        {notes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-2.5 text-xs leading-relaxed text-muted-foreground">
            {t.sources.notesEmpty}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {notes.map((n) => (
              <li
                key={n.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-lg border border-border bg-background p-2.5"
              >
                <span className="min-w-0">
                  <span className="block whitespace-pre-line text-xs leading-relaxed text-card-foreground">
                    {n.text}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground opacity-70">
                    {n.date}
                  </span>
                </span>
                <button
                  onClick={() => onRemoveNote(n.id)}
                  aria-label={t.sources.removeNote}
                  className="shrink-0 self-start text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
