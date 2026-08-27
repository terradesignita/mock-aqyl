import { useState } from "react";
import { BookOpen, CircleHelp, Files, Keyboard, Layers, Lock, Sparkles, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";

/**
 * Единственная точка справки. Раньше по интерфейсу было 18 кнопок «?» — каждая
 * признавала, что подпись рядом непонятна. Подписи переписаны, а то, что не
 * переписывается, собрано здесь одним списком (§6 отчёта).
 */
export function HelpSheet() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const sections = [
    { icon: BookOpen, title: t.help.caseTitle, body: t.help.caseBody },
    { icon: Files, title: t.help.sourcesTitle, body: t.help.sourcesBody },
    { icon: Sparkles, title: t.help.advisorTitle, body: t.help.advisorBody },
    { icon: CircleHelp, title: t.help.evidenceTitle, body: t.help.evidenceBody },
    { icon: Layers, title: t.help.artifactsTitle, body: t.help.artifactsBody },
    { icon: Users, title: t.help.councilTitle, body: t.help.councilBody },
    { icon: Lock, title: t.help.privacyTitle, body: t.help.privacyBody },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t.help.open}
        title={t.help.open}
        className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors active:scale-[0.96] hover:border-primary hover:text-primary"
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-card">
          <div>
            <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
              {t.help.title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t.help.subtitle}
            </DialogDescription>
          </div>

          <ul className="space-y-3">
            {sections.map(({ icon: Icon, title, body }) => (
              <li key={title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-primary/12">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-card-foreground">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-card border border-border bg-secondary/40 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-card-foreground">
              <Keyboard className="h-4 w-4 text-primary" />
              {t.help.shortcutsTitle}
            </p>
            <dl className="mt-2 grid gap-1.5 sm:grid-cols-3">
              {[
                [t.help.keySlash, t.help.keySlashWhat],
                [t.help.keyEsc, t.help.keyEscWhat],
                [t.help.keyF, t.help.keyFWhat],
              ].map(([key, what]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-xs font-semibold text-card-foreground">
                    {key}
                  </kbd>
                  <dd className="min-w-0 text-xs text-muted-foreground">{what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
