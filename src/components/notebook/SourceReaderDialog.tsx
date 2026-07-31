import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Maximize2,
  Minimize2,
  MessageSquarePlus,
  Type,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotebookSource } from "@/lib/sources";

interface Props {
  source: NotebookSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: boolean;
  onToggleSelected: () => void;
  onAskAbout: (source: NotebookSource) => void;
  /** Text fragment to highlight and scroll to (comes from a chat citation click) */
  highlight?: string | null;
}

function escapeRe(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders body text with the highlighted fragment marked up. */
function HighlightedBody({
  body,
  highlight,
  markRef,
}: {
  body: string;
  highlight?: string | null;
  markRef: React.RefObject<HTMLElement | null>;
}) {
  if (!highlight || highlight.length < 4 || !body.toLowerCase().includes(highlight.toLowerCase())) {
    return <p className="whitespace-pre-line text-card-foreground">{body}</p>;
  }
  const parts = body.split(new RegExp(`(${escapeRe(highlight)})`, "ig"));
  let first = true;
  return (
    <p className="whitespace-pre-line text-card-foreground">
      {parts.map((part, i) => {
        if (part.toLowerCase() !== highlight.toLowerCase()) return <span key={i}>{part}</span>;
        const isFirst = first;
        first = false;
        return (
          <mark
            key={i}
            ref={isFirst ? (markRef as React.RefObject<HTMLElement>) : undefined}
            className="animate-in fade-in rounded bg-accent/30 px-1 py-0.5 font-medium text-card-foreground ring-1 ring-accent/50"
          >
            {part}
          </mark>
        );
      })}
    </p>
  );
}

const FONT_STEPS = ["text-[13px]", "text-sm", "text-base", "text-lg"] as const;

export function SourceReaderDialog({
  source,
  open,
  onOpenChange,
  selected,
  onToggleSelected,
  onAskAbout,
  highlight,
}: Props) {
  const [full, setFull] = useState(false);
  const [fontStep, setFontStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const markRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setFull(false);
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !highlight) return;
    const t = window.setTimeout(
      () => markRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      120,
    );
    return () => window.clearTimeout(t);
  }, [open, highlight, source?.id, fontStep]);

  if (!source) return null;

  const plain = `${source.title}\n\n${source.sections
    .map((s) => `${s.heading}\n${s.body}`)
    .join("\n\n")}`;

  const copy = async () => {
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const download = () => {
    const blob = new Blob([plain], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${source.id}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const Icon = source.kind === "link" ? Link2 : FileText;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => {
            if (full) {
              e.preventDefault();
              setFull(false);
            }
          }}
          className={
            full
              ? "fixed inset-0 z-50 flex flex-col bg-card"
              : "fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(880px,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95"
          }
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-3.5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <div className="min-w-0">
                <DialogPrimitive.Title className="truncate text-sm font-bold text-card-foreground">
                  {source.title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-0.5 truncate text-xs text-muted-foreground">
                  {source.meta}
                  {source.pages ? ` · ${source.pages} стр.` : ""} · {source.id}
                </DialogPrimitive.Description>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Размер шрифта"
                onClick={() => setFontStep((s) => (s + 1) % FONT_STEPS.length)}
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Копировать" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" aria-label="Скачать" onClick={download}>
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="На весь экран"
                onClick={() => setFull((v) => !v)}
              >
                {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <DialogPrimitive.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Закрыть">
                  <X className="h-4 w-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10">
            <article className={`mx-auto w-full max-w-2xl ${FONT_STEPS[fontStep]} leading-8`}>
              {source.sections.map((s) => (
                <section key={s.heading} className="mb-7">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {s.heading}
                  </h3>
                  <HighlightedBody body={s.body} highlight={highlight} markRef={markRef} />
                </section>
              ))}
            </article>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={selected ? "secondary" : "outline"}
                className="gap-1.5"
                onClick={onToggleSelected}
              >
                <Check className={`h-3.5 w-3.5 ${selected ? "text-success" : "opacity-50"}`} />
                {selected ? "Используется в чате" : "Добавить в контекст"}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => onAskAbout(source)}>
                <MessageSquarePlus className="h-3.5 w-3.5" /> Спросить по источнику
              </Button>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Открыть оригинал
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {highlight ? "Цитата подсвечена в тексте · " : ""}Esc — закрыть · Aa — размер текста
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
