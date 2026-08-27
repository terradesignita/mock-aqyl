import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronDown, Loader2, X } from "lucide-react";
import { useIngest, type IngestTarget } from "@/lib/ingest";
import { ACCEPTED_ATTR } from "@/lib/sources";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Статус обработки файлов, видимый с любого экрана (рис. 41). До этого этапы жили
 * только в панели источников открытого кейса: уйдя на дашборд, статус было не увидеть.
 */
export function IngestWidget() {
  const t = useT();
  const { jobs, start, dismiss, clearFinished } = useIngest();
  const [open, setOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const retryTarget = useRef<IngestTarget | null>(null);

  if (jobs.length === 0) return null;

  const running = jobs.filter((j) => j.state === "running").length;
  const failed = jobs.filter((j) => j.state === "error").length;
  const done = jobs.filter((j) => j.state === "done").length;

  const pickAnother = (target: IngestTarget) => {
    retryTarget.current = target;
    inputRef.current?.click();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))]">
      <div className="overflow-hidden rounded-card border border-border bg-card shadow-[0_12px_40px_oklch(0.218_0.036_251.3_/_0.18)]">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          {running > 0 ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : failed > 0 ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          ) : (
            <Check className="h-4 w-4 shrink-0 text-scope-internal" />
          )}
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-card-foreground">
            {running > 0
              ? t.ingestWidget.titleRunning(running)
              : failed > 0 && done > 0
                ? t.ingestWidget.titleMixed(done, failed)
                : failed > 0
                  ? t.ingestWidget.titleError(failed)
                  : t.ingestWidget.titleDone(done)}
          </p>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.ingestWidget.collapse : t.ingestWidget.expand}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
          {running === 0 && (
            <button
              onClick={clearFinished}
              aria-label={t.ingestWidget.close}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {open && (
          <ul className="max-h-[50vh] divide-y divide-border overflow-y-auto">
            {jobs.map((job) => {
              const stage = job.stages[job.step];
              return (
                <li key={job.id} className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold text-card-foreground">
                      {job.fileName}
                      <span className="ml-1.5 font-normal text-muted-foreground">{job.size}</span>
                    </p>
                    {job.state !== "running" && (
                      <button
                        onClick={() => dismiss(job.id)}
                        aria-label={t.ingestWidget.dismissOne}
                        className="-m-1 shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {job.state === "running" && stage && (
                    <>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${((job.step + 1) / job.stages.length) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{stage.label}</span>
                        <span className="ml-auto shrink-0 tabular-nums">
                          {Math.round(((job.step + 1) / job.stages.length) * 100)} %
                        </span>
                      </p>
                    </>
                  )}

                  {job.state === "done" && job.cardId && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-scope-internal" />
                      <span className="min-w-0 truncate">{t.ingestWidget.done}</span>
                      <Link
                        to="/card/$id"
                        params={{ id: job.cardId }}
                        className="ml-auto shrink-0 font-bold text-primary hover:underline"
                      >
                        {t.ingestWidget.open}
                      </Link>
                    </p>
                  )}

                  {job.state === "error" && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      <span className="min-w-0 flex-1 truncate text-destructive">
                        {t.ingestWidget.rejected(job.badFormat ?? "")}
                      </span>
                      <button
                        onClick={() => pickAnother(job.target)}
                        className="shrink-0 font-bold text-primary hover:underline"
                      >
                        {t.ingestWidget.pickAnother}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_ATTR}
        multiple
        className="hidden"
        onChange={(e) => {
          const target = retryTarget.current;
          if (target) void start(e.target.files, target);
          e.target.value = "";
        }}
      />
    </div>
  );
}
