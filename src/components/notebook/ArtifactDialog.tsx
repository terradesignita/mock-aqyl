import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ArtifactItem {
  label?: string;
  text: string;
}

export interface ArtifactContent {
  intro?: string;
  metrics?: { label: string; value: string }[];
  items: ArtifactItem[];
}

export interface ArtifactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: ArtifactContent;
  custom?: (fullscreen: boolean) => React.ReactNode;
  onSaveNote?: (text: string) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  initialFullscreen?: boolean;
  /** "wide" — для визуальных форматов вроде презентации, которым тесно в стандартной ширине. */
  size?: "default" | "wide";
}

export function ArtifactDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  content,
  custom,
  onSaveNote,
  onRegenerate,
  regenerating,
  initialFullscreen = false,
  size = "default",
}: ArtifactDialogProps) {
  const [fullscreen, setFullscreen] = useState(initialFullscreen);
  const [copied, setCopied] = useState(false);

  const plain = [
    title,
    "",
    content.intro ?? "",
    ...(content.metrics?.map((m) => `${m.label}: ${m.value}`) ?? []),
    "",
    ...content.items.map((i) => `• ${i.label ? `${i.label} — ` : ""}${i.text}`),
  ]
    .filter((l, idx, arr) => !(l === "" && arr[idx - 1] === ""))
    .join("\n");

  useEffect(() => {
    if (!open) {
      setFullscreen(false);
      setCopied(false);
    } else {
      setFullscreen(initialFullscreen);
    }
  }, [open, initialFullscreen]);

  // Escape: сначала выходим из полноэкранного режима, потом закрываем попап.
  const onEscapeKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (fullscreen) {
        e.preventDefault();
        setFullscreen(false);
      }
    },
    [fullscreen],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (/^[fFаА]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setFullscreen((v) => !v);
      }
    },
    [],
  );

  const copy = async () => {
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const blob = new Blob([plain], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          onEscapeKeyDown={onEscapeKeyDown}
          className={
            fullscreen
              ? "fixed inset-0 z-50 flex flex-col bg-card outline-none duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0"
              : `fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 ${size === "wide" ? "max-w-5xl" : "max-w-2xl"}`
          }
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border p-4">
            <div className="flex min-w-0 items-start gap-2.5">
              {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
              <div className="min-w-0">
                <DialogPrimitive.Title className="truncate text-sm font-bold text-card-foreground">
                  {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="truncate text-[11px] text-muted-foreground">
                  {subtitle ?? "Сгенерировано из выбранных источников"}
                </DialogPrimitive.Description>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label={fullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
                title={fullscreen ? "Свернуть (Esc)" : "Развернуть (F)"}
                onClick={() => setFullscreen((v) => !v)}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <DialogPrimitive.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Закрыть" title="Закрыть (Esc)">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div
              className={`mx-auto space-y-3 ${
                fullscreen ? (size === "wide" ? "max-w-6xl" : "max-w-3xl") : ""
              } ${regenerating ? "animate-pulse opacity-50" : ""}`}
              aria-busy={regenerating}
            >
              {content.intro && (
                <p
                  className={`leading-relaxed text-muted-foreground ${
                    fullscreen ? "text-sm" : "text-xs"
                  }`}
                >
                  {content.intro}
                </p>
              )}

              {custom ? (
                custom(fullscreen)
              ) : (
                <>
                  {content.metrics && content.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {content.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-border bg-secondary/40 p-3"
                        >
                          <p className="text-base font-bold text-primary">{m.value}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <ul className="space-y-2.5">
                    {content.items.map((item, i) => (
                      <li
                        key={`${i}-${item.text}`}
                        className={`rounded-xl border border-border bg-secondary/40 p-3 leading-relaxed text-card-foreground ${
                          fullscreen ? "text-sm" : "text-xs"
                        }`}
                      >
                        {item.label && (
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-accent">
                            {item.label}
                          </span>
                        )}
                        <span className="whitespace-pre-line">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3">
            <p className="text-[11px] text-muted-foreground">
              Esc — {fullscreen ? "выйти из полного экрана" : "закрыть"} · F — полный экран
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {onRegenerate && (
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={onRegenerate}>
                  <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
                  Пересоздать
                </Button>
              )}
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={copy}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Скопировано" : "Копировать"}
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={download}>
                <Download className="h-3.5 w-3.5" /> Скачать
              </Button>
              {onSaveNote && (
                <Button size="sm" className="gap-1.5" onClick={() => onSaveNote(plain)}>
                  <StickyNote className="h-3.5 w-3.5" /> В заметки
                </Button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
