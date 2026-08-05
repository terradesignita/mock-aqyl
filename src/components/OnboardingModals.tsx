import { useState } from "react";
import { Files, FolderOpen } from "lucide-react";
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

interface Step {
  icon: typeof FolderOpen;
  title: string;
  description: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: FolderOpen,
    title: "Что такое Кейс",
    description: "Первая из двух сущностей платформы",
    body: "Кейс — это папка вокруг одной темы, а не один файл. Вы сами объединяете в него несколько документов про один и тот же вопрос: краткое резюме, ключевой инсайт и все источники оказываются в одном месте, чтобы не листать документы по отдельности.",
  },
  {
    icon: Files,
    title: "Что такое Материал",
    description: "Вторая сущность платформы",
    body: "Материал — это конкретный файл или документ внутри Кейса: отчёт, презентация, статья. Каждый Материал — источник, на основе которого строится анализ. Один Кейс может объединять несколько Материалов на одну тему.",
  },
];

export function OnboardingModals({ onClose }: { onClose: (dontShowAgain: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose(dontShowAgain)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-card-foreground">{current.body}</p>

        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            Больше не показывать
          </label>
          <Button
            onClick={() => {
              if (isLast) onClose(dontShowAgain);
              else setStep((s) => s + 1);
            }}
          >
            {isLast ? "Понятно" : "Далее"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
