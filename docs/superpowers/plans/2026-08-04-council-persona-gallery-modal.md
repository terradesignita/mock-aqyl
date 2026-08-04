# Консилиум: модалка-галерея выбора участников — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "contacts" step of the council-creation wizard (`NewCouncilPanel` in `src/routes/council.tsx`) with a full-screen gallery modal — a 4×3 grid of 12 persona cards with a black-and-white → color reveal on selection, a 3-participant limit with a toast on overflow, and a "pick automatically" shortcut — per `docs/superpowers/specs/2026-08-04-council-persona-gallery-modal-design.md`.

**Architecture:** Two new functions in `src/routes/council.tsx` — `GalleryCard` (one persona tile) and `PersonaGalleryModal` (the Radix `Dialog` shell around a grid of `GalleryCard`s) — built entirely from data and styling primitives that already exist (`CouncilPersona`, `PersonaAvatar`, `PersonaTag`, `personaColorVars`, `PERSONA_BORDER_CLASS`, `PERSONA_TINT_CLASS`). `NewCouncilPanel` keeps its existing `step`/`personaIds` state; only what it renders for `step === "contacts"` changes, from an inline searchable list to this modal. The topic/case-search step (`step === "topic"`) and the sidebar's own `PersonaPicker` (used to edit an existing session's composition) are untouched.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Radix Dialog (via existing `@/components/ui/dialog`), Vitest. No new dependencies.

## Global Constraints

- No new dependencies — `Dialog`/`DialogContent`/`DialogHeader`/`DialogFooter`/`DialogTitle`/`DialogDescription` already exist in `@/components/ui/dialog`; `Check` is a standard `lucide-react` icon, same package already imported in this file.
- Personas stay **fictional** — no real names, no real photos, no Wikipedia/X/Website links. This is a deliberate business decision (legal/reputational risk), not an oversight — do not "complete" the card with real-person links even though the external PRD (`Консилиум.md`) asks for them.
- Do not touch `src/data/council.ts`, the sidebar's `PersonaPicker` (composition editor for an already-created session), or the `step === "topic"` case-search panel — all three are explicitly out of scope.
- Modal corner radius uses the existing `rounded-modal` utility (`--radius-modal`, `src/styles.css:38`) — do not hardcode a pixel value.
- The black-and-white → color effect is a CSS `filter` transition on the existing colored `PersonaAvatar` (`grayscale saturate-[.35]` removed on selection) — no new image assets.

---

### Task 1: `PersonaGalleryModal` + wire it into `NewCouncilPanel`

**Files:**
- Modify: `src/routes/council.tsx:1-27` (imports)
- Modify: `src/routes/council.tsx` (insert `GalleryCard` + `PersonaGalleryModal` before `NewCouncilPanel`; replace `NewCouncilPanel`'s body)

**Interfaces:**
- Consumes: `CouncilPersona`, `COUNCIL_PERSONAS`, `getPersona`, `hasLikelyDisagreement`, `pickDefaultTrio` (`@/data/council`); `PersonaAvatar` (`@/components/PersonaAvatar`); `personaColorVars`, `PERSONA_BORDER_CLASS`, `PERSONA_TINT_CLASS`, `PersonaTag`, `MAX_PERSONAS` (all already defined earlier in `council.tsx`).
- Produces: `GalleryCard({ persona, selected, disabled, onToggle })`, `PersonaGalleryModal({ open, selected, onChange, onConfirm, onClose })` — both local to `council.tsx`, not exported.

- [ ] **Step 1: Add the `Check` icon and `Dialog` imports**

Find:
```tsx
import { PanelLeft, PanelLeftClose, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```
Replace with:
```tsx
import { Check, PanelLeft, PanelLeftClose, Plus, Search, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
```

- [ ] **Step 2: Add `GalleryCard` and `PersonaGalleryModal`, immediately before `function NewCouncilPanel(`**

```tsx
function GalleryCard({
  persona,
  selected,
  disabled,
  onToggle,
}: {
  persona: CouncilPersona;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      style={personaColorVars(persona)}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-[transform,box-shadow,border-color,background-color,opacity] duration-200 disabled:pointer-events-none disabled:opacity-40",
        selected
          ? cn("-translate-y-0.5 shadow-md", PERSONA_BORDER_CLASS, PERSONA_TINT_CLASS)
          : "border-border hover:border-primary/30 hover:shadow-sm",
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      <PersonaAvatar
        initials={persona.initials}
        size="lg"
        style={{ backgroundColor: persona.hex }}
        className={cn(
          "transition-[filter,transform] duration-200 group-hover:scale-105",
          !selected && "grayscale saturate-[.35]",
        )}
      />
      <span className="text-sm font-semibold text-card-foreground">{persona.name}</span>
      <PersonaTag tag={persona.tag} hex={persona.hex} />
      <span className="line-clamp-2 text-xs text-muted-foreground">
        {persona.role} · в духе {persona.inspiredBy}
      </span>
    </button>
  );
}

/** Full-screen gallery for the "who's in the council?" step — replaces the old inline
 *  searchable list. Controlled: `open` follows the wizard's own step state (see
 *  NewCouncilPanel) so Radix can play its own open/close transition instead of the
 *  component being mounted/unmounted abruptly. */
function PersonaGalleryModal({
  open,
  selected,
  onChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  selected: string[];
  onChange: (ids: string[]) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length >= MAX_PERSONAS) {
      toast.error("Можно выбрать не более трёх участников.");
      return;
    }
    onChange([...selected, id]);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-[90vw] max-w-[1400px] min-w-[1100px] flex-col gap-4 rounded-modal p-6 sm:rounded-modal">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-bold">Соберите консилиум</DialogTitle>
          <DialogDescription>
            Выберите от одного до трёх участников для обсуждения вашей задачи.
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 items-center justify-between gap-2">
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            Выбрано {selected.length} из {MAX_PERSONAS}
          </span>
          <button
            type="button"
            onClick={() => onChange(pickDefaultTrio())}
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            Подобрать автоматически
          </button>
        </div>

        {selected.length >= 2 && !hasLikelyDisagreement(selected) && (
          <p
            role="status"
            className="shrink-0 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-card-foreground"
          >
            В этом составе взгляды похожи — спора может не быть. Попробуйте добавить
            контрарианку или скептика.
          </p>
        )}

        <div className="grid flex-1 grid-cols-4 gap-3 overflow-y-auto pr-1">
          {COUNCIL_PERSONAS.map((p) => {
            const isSelected = selected.includes(p.id);
            const disabled = !isSelected && selected.length >= MAX_PERSONAS;
            return (
              <GalleryCard
                key={p.id}
                persona={p}
                selected={isSelected}
                disabled={disabled}
                onToggle={() => toggle(p.id)}
              />
            );
          })}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button disabled={selected.length === 0} onClick={onConfirm}>
            Создать совет
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Replace `NewCouncilPanel`'s body to use the modal for the "contacts" step**

Find the whole function (from `function NewCouncilPanel({` through its closing `}` — the one immediately before `/** Inline persona picker`):
```tsx
function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"contacts" | "topic">("contacts");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [personaQuery, setPersonaQuery] = useState("");
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const stepHeadingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }, [step]);

  const personaResults = useMemo(() => {
    const q = personaQuery.trim().toLowerCase();
    if (!q) return COUNCIL_PERSONAS;
    return COUNCIL_PERSONAS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.inspiredBy.toLowerCase().includes(q),
    );
  }, [personaQuery]);

  const togglePersona = (id: string) =>
    setPersonaIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_PERSONAS
          ? prev
          : [...prev, id],
    );

  const caseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const start = () => {
    if (!card || personaIds.length === 0) return;
    const topic = {
      title: card.title,
      summary: card.executive_summary,
      insight: card.core_insight,
      businessUnit: card.business_unit,
    };
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      messages: buildOpeningMessages(personaIds, topic),
      topic,
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {step === "contacts" ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p
                  ref={stepHeadingRef as React.RefObject<HTMLParagraphElement>}
                  tabIndex={-1}
                  className="text-sm font-bold text-card-foreground outline-none"
                >
                  Кто в совете?
                </p>
                <p className="text-xs text-muted-foreground">
                  Выберите до {MAX_PERSONAS} участников
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                {personaIds.length}/{MAX_PERSONAS}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={personaQuery}
                onChange={(e) => setPersonaQuery(e.target.value)}
                placeholder="Найдите персону по имени или стилю"
                aria-label="Найдите персону по имени или стилю"
                className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            {personaIds.length >= 2 && !hasLikelyDisagreement(personaIds) && (
              <p
                role="status"
                className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-card-foreground"
              >
                В этом составе взгляды похожи — спора может не быть. Попробуйте добавить
                контрарианку или скептика.
              </p>
            )}

            <button
              type="button"
              onClick={() => setPersonaIds(pickDefaultTrio())}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Подобрать автоматически
            </button>

            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {personaResults.map((p) => {
                const isSelected = personaIds.includes(p.id);
                const disabled = !isSelected && personaIds.length >= MAX_PERSONAS;
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-[color,background-color,border-color,opacity] disabled:opacity-40",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/30 hover:bg-secondary/30",
                    )}
                  >
                    <PersonaAvatar
                      initials={p.initials}
                      size="md"
                      ringClassName={PERSONA_BORDER_CLASS}
                      style={personaAvatarStyle(p)}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-sm font-semibold text-card-foreground">
                          {p.name}
                        </span>
                        <PersonaTag tag={p.tag} hex={p.hex} />
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.role} · в духе {p.inspiredBy}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={personaIds.length === 0}
                onClick={() => setStep("topic")}
              >
                Далее
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                ref={stepHeadingRef as React.RefObject<HTMLLabelElement>}
                tabIndex={-1}
                htmlFor="council-case-search"
                className="mb-2 block text-xs font-bold text-muted-foreground outline-none"
              >
                О чём поговорим?
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="council-case-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найдите кейс по названию"
                  className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {caseResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCard(c)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      card?.id === c.id
                        ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary/50",
                    )}
                  >
                    <span className="block truncate" title={c.title}>
                      {c.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep("contacts")}>
                Назад
              </Button>
              <Button className="flex-1 gap-1.5" disabled={!card} onClick={start}>
                <Plus className="h-4 w-4" /> Начать совет
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```
Replace with:
```tsx
function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"contacts" | "topic">("contacts");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const stepHeadingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }, [step]);

  const caseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const start = () => {
    if (!card || personaIds.length === 0) return;
    const topic = {
      title: card.title,
      summary: card.executive_summary,
      insight: card.core_insight,
      businessUnit: card.business_unit,
    };
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      messages: buildOpeningMessages(personaIds, topic),
      topic,
    });
  };

  return (
    <>
      <PersonaGalleryModal
        open={step === "contacts"}
        selected={personaIds}
        onChange={setPersonaIds}
        onConfirm={() => setStep("topic")}
        onClose={onCancel}
      />
      {step === "topic" && (
        <div className="mx-auto w-full max-w-xl px-6 py-10">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div>
              <label
                ref={stepHeadingRef as React.RefObject<HTMLLabelElement>}
                tabIndex={-1}
                htmlFor="council-case-search"
                className="mb-2 block text-xs font-bold text-muted-foreground outline-none"
              >
                О чём поговорим?
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="council-case-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найдите кейс по названию"
                  className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {caseResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCard(c)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      card?.id === c.id
                        ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary/50",
                    )}
                  >
                    <span className="block truncate" title={c.title}>
                      {c.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep("contacts")}>
                Назад
              </Button>
              <Button className="flex-1 gap-1.5" disabled={!card} onClick={start}>
                <Plus className="h-4 w-4" /> Начать совет
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

Note what changed: `personaQuery`/`personaResults`/`togglePersona` are gone (that logic now lives inside `PersonaGalleryModal`/`GalleryCard`); the function now returns both the (always-mounted, Radix-controlled) modal and the topic panel, gated by `step`, instead of an early single `return` per step — this lets Radix's own open/close CSS transition play on `PersonaGalleryModal` instead of the whole thing being abruptly unmounted when `step` flips.

- [ ] **Step 4: Typecheck and test**

Run: `bunx tsc --noEmit && bunx vitest run`
Expected: both clean. (`personaAvatarStyle`, `PersonaAvatar`, `PersonaTag`, `PERSONA_BORDER_CLASS`, `PERSONA_TINT_CLASS`, `COUNCIL_PERSONAS`, `hasLikelyDisagreement`, `pickDefaultTrio` all remain used elsewhere in the file — e.g. the sidebar's `PersonaPicker` still uses `personaAvatarStyle` — so no unused-symbol errors are expected from removing them out of `NewCouncilPanel` specifically.)

- [ ] **Step 5: Manual browser check**

Open `/council`, click "Создать совет". Confirm, in both light and dark theme:
- the modal opens centered, ~90% of the viewport, with the background (sidebar + whatever was in `<main>`) dimmed behind it;
- all 12 persona cards render in a 4×3 grid, initially desaturated (grayscale avatar);
- clicking a card selects it: avatar goes to full color, a checkmark badge appears, the card lifts slightly and gets an accent border + soft tint, and the counter updates to "Выбрано 1 из 3";
- after selecting 3, the remaining 9 cards become non-interactive and dimmed (`opacity-40`), and clicking one shows the "Можно выбрать не более трёх участников." toast instead of selecting it;
- clicking an already-selected card deselects it (reverts to grayscale) and immediately re-enables the other cards;
- "Подобрать автоматически" selects a bullish/skeptical/neutral trio in one click;
- "Отмена", clicking the dark overlay, and `Esc` all close the modal and return to whatever was showing before (`SessionsOverview` or the previous chat) with no council created;
- "Создать совет" (enabled only once ≥1 persona is selected) closes the modal and advances to the existing case-search step; clicking "Назад" there re-opens the gallery modal with the same personas still selected.

- [ ] **Step 6: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Replace inline persona picker with a full-screen gallery modal for council creation"
```
