import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  Database,
  Flag,
  Languages,
  Moon,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HelpHint } from "@/components/HelpHint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { CURRENT_USER, libraryStats } from "@/data/backend";
import { BUSINESS_UNITS } from "@/data/mockCards";
import {
  BCP47,
  dictionaryFor,
  LOCALES,
  LOCALE_META,
  tagLabel,
  unitLabel,
  useI18n,
  useT,
  type Locale,
} from "@/lib/i18n";
import {
  useActivity,
  useAllFeedback,
  useBookmarks,
  useCouncilSessions,
  useAdvisorSessions,
  useTheme,
  type ActivityType,
} from "@/hooks/useAppState";
import { cn } from "@/lib/utils";

/** Сколько дней показываем в разбивке активности. */
const ACTIVITY_DAYS = 14;

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — BI AQYL" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});

function Section({
  title,
  icon: Icon,
  hint,
  children,
}: {
  title: string;
  icon: typeof Activity;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        {title}
        {hint && <HelpHint side="bottom" text={hint} />}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: "muted" }) {
  return (
    <div className="rounded-control border border-border bg-secondary/40 p-3">
      <p
        className={cn(
          "text-xl font-extrabold tabular-nums",
          tone === "muted" ? "text-muted-foreground" : "text-primary",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{label}</p>
    </div>
  );
}

/** Столбики активности по дням — из журнала действий, без выдуманного фона. */
function ActivityChart({ buckets }: { buckets: { day: string; count: number }[] }) {
  const t = useT();
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="flex items-end gap-1" role="img" aria-label={t.settings.activityChartLabel}>
      {buckets.map((b) => (
        <div key={b.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex h-20 w-full items-end">
            <div
              title={t.settings.activityOnDay(b.day, b.count)}
              className={cn(
                "w-full rounded-t-sm transition-[height]",
                b.count > 0 ? "bg-primary" : "bg-border",
              )}
              style={{ height: b.count > 0 ? `${Math.max(8, (b.count / max) * 100)}%` : "2px" }}
            />
          </div>
          <span className="w-full truncate text-center text-[10px] tabular-nums text-muted-foreground/70">
            {b.day.slice(0, 5)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SettingsPage() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const { dark, toggle } = useTheme();
  const { events, clear: clearActivity, hydrated } = useActivity();
  const { totals: feedback } = useAllFeedback();
  const { bookmarks } = useBookmarks();
  const { sessions: councilSessions } = useCouncilSessions();
  const { sessions: advisorSessions } = useAdvisorSessions();

  const library = useMemo(() => libraryStats(), []);

  const byType = useMemo(() => {
    const map = new Map<ActivityType, number>();
    for (const e of events) map.set(e.type, (map.get(e.type) ?? 0) + 1);
    return map;
  }, [events]);

  // Разбивка по дням считается только после гидратации: на сервере «сегодня» другое.
  const buckets = useMemo(() => {
    if (!hydrated) return [];
    const out: { day: string; count: number }[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
      const end = new Date(today);
      end.setDate(end.getDate() - i);
      const start = new Date(end);
      start.setHours(0, 0, 0, 0);
      out.push({
        day: end.toLocaleDateString(BCP47[locale], { day: "2-digit", month: "2-digit" }),
        count: events.filter((e) => e.at >= start.getTime() && e.at <= end.getTime()).length,
      });
    }
    return out;
  }, [events, hydrated, locale]);

  const reasons = Object.entries(feedback.reasons).sort((a, b) => b[1] - a[1]);

  const switchLocale = (next: Locale) => {
    setLocale(next);
    toast.success(dictionaryFor(next).settings.languageChanged);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header dark={dark} onToggleDark={toggle} />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.settings.subtitle}</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Section title={t.settings.profile} icon={BadgeCheck} hint={t.settings.profileHint}>
            <div className="flex items-start gap-3">
              <PersonaAvatar
                initials={t.profile.initials}
                size="lg"
                className="bg-primary text-primary-foreground text-base font-bold"
              />
              <div className="min-w-0">
                <p className="text-base font-bold text-card-foreground">
                  {t.profile.firstName} {t.profile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.positions[CURRENT_USER.position]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {CURRENT_USER.email} ·{" "}
                  {unitLabel(BUSINESS_UNITS[CURRENT_USER.businessUnitIndex], t)}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="tint" className="font-bold">
                    {t.roles[CURRENT_USER.role]}
                  </Badge>
                  <HelpHint side="bottom" text={t.roles[`${CURRENT_USER.role}Desc`]} />
                  <span className="text-xs text-muted-foreground/70">
                    {t.settings.loginIs(CURRENT_USER.login)}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <Section title={t.settings.appearance} icon={Languages}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{t.settings.theme}</p>
                <div className="mt-1.5 flex w-fit items-center gap-1 rounded-2xl border border-border bg-background p-1">
                  <button
                    onClick={() => dark && toggle()}
                    aria-pressed={!dark}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors",
                      dark
                        ? "text-muted-foreground hover:text-foreground"
                        : "bg-card text-foreground shadow-soft",
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" /> {t.settings.themeLight}
                  </button>
                  <button
                    onClick={() => !dark && toggle()}
                    aria-pressed={dark}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors",
                      dark
                        ? "bg-card text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" /> {t.settings.themeDark}
                  </button>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  {t.settings.interfaceLanguage}
                  <HelpHint side="bottom" text={t.settings.languageHint} />
                </p>
                <div className="mt-1.5 flex w-fit items-center gap-1 rounded-2xl border border-border bg-background p-1">
                  {LOCALES.map((code) => (
                    <button
                      key={code}
                      onClick={() => switchLocale(code)}
                      aria-pressed={code === locale}
                      title={LOCALE_META[code].nativeName}
                      className={cn(
                        "h-8 rounded-xl px-3 text-xs font-semibold transition-colors",
                        code === locale
                          ? "bg-card text-foreground shadow-soft"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {LOCALE_META[code].code}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {t.settings.materialLanguages(
                    library.byLanguage.map((l) => `${l.lang} (${l.count})`).join(", "),
                  )}
                </p>
              </div>
            </div>
          </Section>

          <Section title={t.settings.library} icon={Database} hint={t.settings.libraryHint}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat value={String(library.cases)} label={t.settings.cases} />
              <Stat value={String(library.materials)} label={t.settings.materials} />
              <Stat value={String(library.businessUnits)} label={t.settings.units} />
              <Stat value={library.freshest} label={t.settings.freshest} tone="muted" />
            </div>

            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">{t.settings.internalExternal}</dt>
                <dd className="font-semibold tabular-nums text-card-foreground">
                  {library.internal} / {library.external}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">{t.settings.formats}</dt>
                <dd className="text-right font-medium text-card-foreground">
                  {library.byMedia.map((m) => `${t.media[m.type]} ${m.count}`).join(" · ")}
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              {t.settings.topTopics}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {library.topTags.map((tag) => (
                <Link
                  key={tag.tag}
                  to="/"
                  search={{ q: tag.tag }}
                  className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {tagLabel(tag.tag, t)}
                  <span className="ml-1 tabular-nums opacity-60">{tag.count}</span>
                </Link>
              ))}
            </div>
          </Section>

          <Section title={t.settings.activity} icon={Activity} hint={t.settings.activityHint}>
            {!hydrated ? (
              <p className="text-xs text-muted-foreground">{t.common.loading}</p>
            ) : events.length === 0 ? (
              <div className="rounded-control border border-dashed border-border p-4 text-center">
                <p className="text-sm font-semibold text-card-foreground">
                  {t.settings.activityEmptyTitle}
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {t.settings.activityEmptyBody}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link to="/">{t.settings.openCases}</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat value={String(byType.get("question") ?? 0)} label={t.settings.questions} />
                  <Stat value={String(byType.get("artifact") ?? 0)} label={t.settings.artifacts} />
                  <Stat value={String(byType.get("upload") ?? 0)} label={t.settings.uploads} />
                  <Stat
                    value={String(events.length)}
                    label={t.settings.totalActions}
                    tone="muted"
                  />
                </div>

                <div className="mt-4">
                  <ActivityChart buckets={buckets} />
                </div>

                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                  {t.settings.latest}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {events.slice(0, 5).map((e) => (
                    <li
                      key={e.id}
                      className="flex items-baseline justify-between gap-2 text-xs leading-snug"
                    >
                      <span className="min-w-0 truncate text-card-foreground">
                        <span className="font-semibold text-primary">{t.activity[e.type]}</span>
                        {" · "}
                        {e.label}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground/70">
                        {new Date(e.at).toLocaleDateString(BCP47[locale])}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    clearActivity();
                    toast.success(t.settings.logCleared);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t.settings.clearLog}
                </Button>
              </>
            )}
          </Section>

          <Section title={t.settings.feedback} icon={Flag} hint={t.settings.feedbackHint}>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-control border border-border bg-secondary/40 p-3">
                <p className="flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-success">
                  <ThumbsUp className="h-4 w-4" /> {feedback.up}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.settings.feedbackUp}</p>
              </div>
              <div className="rounded-control border border-border bg-secondary/40 p-3">
                <p className="flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-muted-foreground">
                  <ThumbsDown className="h-4 w-4" /> {feedback.down}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.settings.feedbackDown}</p>
              </div>
              <div className="rounded-control border border-border bg-secondary/40 p-3">
                <p className="flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-destructive">
                  <Flag className="h-4 w-4" /> {feedback.reports}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.settings.feedbackReports}</p>
              </div>
            </div>

            {reasons.length > 0 ? (
              <>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  {t.settings.reportReasons}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {reasons.map(([reason, count]) => (
                    <li key={reason} className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-card-foreground">{reason}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-destructive">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {t.settings.noReports}
              </p>
            )}
          </Section>

          <Section title={t.settings.stored} icon={Database} hint={t.settings.storedHint}>
            <ul className="space-y-2 text-sm">
              {[
                { label: t.settings.storedBookmarks, value: bookmarks.length, to: "/" as const },
                { label: t.settings.storedAdvisor, value: advisorSessions.length },
                {
                  label: t.settings.storedCouncil,
                  value: councilSessions.length,
                  to: "/council" as const,
                },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <span className="min-w-0 truncate text-card-foreground">{row.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-bold tabular-nums text-primary">{row.value}</span>
                    {row.to && (
                      <Link
                        to={row.to}
                        className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                      >
                        {t.settings.openLink}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
