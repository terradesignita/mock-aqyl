import { Link } from "@tanstack/react-router";
import { Home, LogOut, Moon, Settings, Sun, User, Users } from "lucide-react";
import { toast } from "sonner";
import { BiLogo } from "@/components/BiLogo";
import { HelpSheet } from "@/components/HelpSheet";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { CURRENT_USER } from "@/data/backend";
import { BUSINESS_UNITS } from "@/data/mockCards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { unitLabel, useT } from "@/lib/i18n";

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  className?: string;
}

const NAV = [
  { id: "cases" as const, icon: Home, to: "/" as const, exact: true },
  { id: "council" as const, icon: Users, to: "/council" as const, exact: false },
];

export function Header({ dark, onToggleDark, className }: HeaderProps) {
  const t = useT();
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-card/60 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center">
          <BiLogo size={30} />
        </Link>

        <nav className="flex justify-center">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/70 p-1 shadow-soft">
            {NAV.map((item) => {
              const Icon = item.icon;
              const label = item.id === "cases" ? t.nav.cases : t.nav.council;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  aria-label={label}
                  className="flex h-9 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-colors active:scale-[0.96] md:px-3"
                  activeProps={{ className: "bg-card text-foreground shadow-soft" }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {/* Единственный вход в справку: подсказки «?» из рабочих зон убраны. */}
          <HelpSheet />

          <div className="flex items-center rounded-full border border-border bg-background p-0.5">
            <button
              onClick={() => dark && onToggleDark()}
              aria-label={t.nav.lightTheme}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors active:scale-[0.96]",
                dark ? "text-muted-foreground" : "bg-card text-foreground shadow-soft",
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => !dark && onToggleDark()}
              aria-label={t.nav.darkTheme}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors active:scale-[0.96]",
                dark ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t.nav.userMenu(`${t.profile.firstName} ${t.profile.lastName}`)}
                className="rounded-full transition-transform active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <PersonaAvatar
                  initials={t.profile.initials}
                  size="md"
                  className="bg-primary text-primary-foreground text-xs font-bold"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="pb-1">
                <span className="block truncate text-sm font-bold text-card-foreground">
                  {t.profile.firstName} {t.profile.lastName}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {t.positions[CURRENT_USER.position]}
                </span>
                <span className="mt-1 block truncate text-xs font-normal text-muted-foreground/70">
                  {CURRENT_USER.email} · {t.roles[CURRENT_USER.role]}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" /> {t.nav.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.info(
                    t.nav.profileFromSso(
                      unitLabel(BUSINESS_UNITS[CURRENT_USER.businessUnitIndex], t),
                      t.roles[CURRENT_USER.role],
                    ),
                  )
                }
              >
                <User className="h-4 w-4" /> {t.nav.myProfile}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.info(t.nav.logoutInSso)}>
                <LogOut className="h-4 w-4" /> {t.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
