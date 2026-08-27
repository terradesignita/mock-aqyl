import { BiLogo } from "@/components/BiLogo";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2">
          <BiLogo size={14} />
          <span className="h-3 w-px bg-border" />
          {t.footer.tagline}
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <span>{t.footer.docs}</span>
          <span>{t.footer.support}</span>
          <span className="opacity-70">{t.footer.version}</span>
        </div>
      </div>
    </footer>
  );
}
