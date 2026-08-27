import { useState } from "react";
import { Files, FileText, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function OnboardingModals({ onClose }: { onClose: (dontShowAgain: boolean) => void }) {
  const t = useT();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const samples = [
    t.onboarding.fileReport,
    t.onboarding.filePresentation,
    t.onboarding.fileArticle,
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.onboarding.title}</DialogTitle>
          <DialogDescription>{t.onboarding.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center gap-2.5 text-base font-bold text-primary">
            <FolderOpen className="h-6 w-6" /> {t.onboarding.caseIsFolder}
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {samples.map((label) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-soft"
              >
                <FileText className="h-4 w-4 text-muted-foreground" /> {label}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Files className="h-3.5 w-3.5 shrink-0" /> {t.onboarding.threeFilesNote}
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-card-foreground">
          <p>{t.onboarding.caseBody}</p>
          <p>{t.onboarding.materialBody}</p>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            {t.onboarding.dontShowAgain}
          </label>
          <Button onClick={() => onClose(dontShowAgain)}>{t.onboarding.gotIt}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
