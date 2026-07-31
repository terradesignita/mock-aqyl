import { Link } from "@tanstack/react-router";
import { Home, Moon, Sun, Users } from "lucide-react";
import { BiLogo } from "@/components/BiLogo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  className?: string;
}

const NAV = [
  { id: "cases", label: "Кейсы", icon: Home, to: "/" as const, exact: true },
  { id: "council", label: "Консилиум", icon: Users, to: "/council" as const, exact: false },
];

export function Header({ dark, onToggleDark, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-card/75 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center">
          <BiLogo size={30} />
        </Link>

        <nav className="hidden justify-center md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/70 p-1 shadow-soft">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.96]"
                  activeProps={{ className: "bg-card text-foreground shadow-soft" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <div className="flex items-center rounded-full border border-border bg-background p-0.5">
            <button
              onClick={() => dark && onToggleDark()}
              aria-label="Светлая тема"
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors active:scale-[0.96]",
                dark ? "text-muted-foreground" : "bg-card text-foreground shadow-soft",
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => !dark && onToggleDark()}
              aria-label="Тёмная тема"
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors active:scale-[0.96]",
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
