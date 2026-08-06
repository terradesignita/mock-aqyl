import { HelpHint } from "@/components/HelpHint";
import { HoverRevealIconButton } from "@/components/HoverRevealIconButton";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import {
  Download,
  FileText,
  Link2,
  MessageSquareText,
  MoreVertical,
  NotebookPen,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeCardData } from "@/data/mockCards";
import type { NotebookSource } from "@/lib/sources";
import type { StoredNote } from "@/hooks/useAppState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  card: KnowledgeCardData;
  sources: NotebookSource[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onOpenSource: (source: NotebookSource) => void;
  notes: StoredNote[];
  onRemoveNote: (id: string) => void;
  onCollapse?: () => void;
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
  onToggle,
  onToggleAll,
  onOpenSource,
  notes,
  onRemoveNote,
  onCollapse,
}: Props) {
  const [drag, setDrag] = useState(false);
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = sources.filter((s) => !removed.includes(s.id));
  const allSelected = selected.length === visible.length && visible.length > 0;
  const files = visible.filter((s) => s.kind === "file");

  const titleOf = (s: NotebookSource) => renames[s.id] ?? s.title;

  const rename = (s: NotebookSource) => {
    const next = window.prompt("Новое название источника", titleOf(s));
    if (next && next.trim()) {
      setRenames((p) => ({ ...p, [s.id]: next.trim() }));
      toast.success("Источник переименован");
    }
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
          aria-label={`Использовать «${titleOf(s)}» в чате`}
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
              <span className={`font-semibold ${tone.text}`}>{isLink ? "Ссылка" : s.format}</span>
              {" · "}
              {s.meta.replace(/^(Ссылка|[A-Z]+)\s·\s/, "")}
            </span>
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <HoverRevealIconButton
              aria-label="Действия с источником"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </HoverRevealIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="truncate text-xs">{titleOf(s)}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onOpenSource(s)}>
              <MessageSquareText className="h-4 w-4" /> Открыть в читалке
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => rename(s)}>
              <Pencil className="h-4 w-4" /> Переименовать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success(`Загрузка «${titleOf(s)}» начата`)}>
              <Download className="h-4 w-4" /> Скачать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setRemoved((p) => [...p, s.id]);
                if (selected.includes(s.id)) onToggle(s.id);
                toast.success("Источник удалён");
              }}
            >
              <Trash2 className="h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 pb-2 pt-3.5">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
          Источники
          <Counter value={selected.length} tone="primary" />
          <span className="text-xs font-medium text-muted-foreground">из {visible.length}</span>
          <HelpHint
            side="bottom"
            text="Отмеченные источники — контекст для ассистента и артефактов. Снимите галочку, чтобы исключить материал из ответов."
          />
        </p>
        <button
          onClick={onToggleAll}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {allSelected ? "Снять все" : "Выбрать все"}
        </button>
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Свернуть панель источников"
            title="Свернуть панель"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 pb-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={() => toast.success("Файлы добавлены")}
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
          }}
          className={`flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed px-3 py-3 text-center transition-colors ${
            drag
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
          }`}
        >
          <Plus className="h-4 w-4" />
          <p className="text-xs font-medium leading-tight">
            Перетащите файлы сюда или нажмите, чтобы выбрать
          </p>
          <p className="text-xs leading-tight opacity-80">PDF, DOCX, PPTX, MP3 или ссылка</p>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
        <div>
          <p className="flex items-center gap-1.5 px-1 pb-1 text-xs font-semibold text-muted-foreground">
            <span aria-hidden className="h-2 w-2 rounded-full bg-src-file" />
            Загруженные файлы
            <Counter value={files.length} />
          </p>
          <ul className="space-y-0.5">{files.map(row)}</ul>
          {files.length === 0 && (
            <p className="px-1 py-1 text-xs text-muted-foreground">
              Файлов пока нет — загрузите первый
            </p>
          )}
        </div>
      </div>

      <div className="max-h-[45%] overflow-y-auto border-t border-border p-3">
        <p className="flex items-center gap-1.5 pb-1.5 text-xs font-semibold text-card-foreground">
          <NotebookPen className="h-3.5 w-3.5 text-primary" /> Заметки
          <Counter value={notes.length} />
          <HelpHint
            side="top"
            text="Сюда попадают ответы ассистента, сохранённые кнопкой «В заметки». Их можно скопировать или удалить."
          />
        </p>
        {notes.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-2.5 text-xs leading-relaxed text-muted-foreground">
            Сохраняйте ответы из диалога — они появятся здесь.
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
                  aria-label="Удалить заметку"
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
