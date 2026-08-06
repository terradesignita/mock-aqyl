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

const SAMPLE_MATERIALS = ["Отчёт", "Презентация", "Статья"];

export function OnboardingModals({ onClose }: { onClose: (dontShowAgain: boolean) => void }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Кейс и Материал</DialogTitle>
          <DialogDescription>Два главных слова на этой платформе</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center gap-2.5 text-base font-bold text-primary">
            <FolderOpen className="h-6 w-6" /> Кейс — папка
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {SAMPLE_MATERIALS.map((label) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-soft"
              >
                <FileText className="h-4 w-4 text-muted-foreground" /> {label}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Files className="h-3.5 w-3.5 shrink-0" /> Это и есть «3 файла» — та же надпись,
            что вы увидите на карточке Кейса
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-card-foreground">
          <p>
            <span className="font-bold text-primary">Кейс</span> — это как обычная бумажная папка
            на столе. Она сама по себе пустая. Вы кладёте туда бумаги на одну тему — и получается
            Кейс.
          </p>
          <p>
            <span className="font-bold text-primary">Материал</span> — это один такой лист бумаги
            внутри папки: отчёт, презентация или статья. В одной папке (Кейсе) может лежать сразу
            несколько бумаг (Материалов) — если они все про одно и то же.
          </p>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            Больше не показывать
          </label>
          <Button onClick={() => onClose(dontShowAgain)}>Понятно</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
