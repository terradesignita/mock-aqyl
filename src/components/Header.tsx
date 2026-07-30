import { Link } from "@tanstack/react-router";
import { Bookmark, BookOpen, Home, Moon, PenSquare, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BiLogo } from "@/components/BiLogo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  bookmarkCount?: number;
  onOpenBookmarks?: () => void;
}

const NAV = [
  { id: "cases", label: "Кейсы", icon: Home, active: true },
  { id: "library", label: "Библиотека", icon: BookOpen },
  { id: "notes", label: "Заметки", icon: PenSquare },
  { id: "advisors", label: "Советники", icon: Users },
];

export function Header({
  dark,
  onToggleDark,
  bookmarkCount = 0,
  onOpenBookmarks,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center">
          <BiLogo size={30} />
        </Link>

        <nav className="hidden justify-center md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/70 p-1 shadow-soft">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
                    item.active
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  aria-label={item.label}
                >
                  <Icon className="h-4 w-4" />
                  {item.active && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {onOpenBookmarks && (
            <Button variant="ghost" size="sm" onClick={onOpenBookmarks} className="gap-1.5">
              <Bookmark className="h-4 w-4" />
              <span className="hidden lg:inline">Закладки</span>
              {bookmarkCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
                  {bookmarkCount}
                </span>
              )}
            </Button>
          )}

          <div className="flex items-center rounded-full border border-border bg-background p-0.5">
            <button
              onClick={() => dark && onToggleDark()}
              aria-label="Светлая тема"
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors",
                dark ? "text-muted-foreground" : "bg-card text-foreground shadow-soft",
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => !dark && onToggleDark()}
              aria-label="Тёмная тема"
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors",
                dark ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            МА
          </span>
        </div>
      </div>
    </header>
  );
}
