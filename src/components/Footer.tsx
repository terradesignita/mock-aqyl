import { BiLogo } from "@/components/BiLogo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2">
          <BiLogo size={14} />
          <span className="h-3 w-px bg-border" />
          AQYL — Knowledge Discovery Platform
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <span className="cursor-default transition-colors hover:text-foreground">Документация</span>
          <span className="cursor-default transition-colors hover:text-foreground">Поддержка</span>
          <span className="opacity-70">MVP v0.1 · demo mode</span>
        </div>
      </div>
    </footer>
  );
}
