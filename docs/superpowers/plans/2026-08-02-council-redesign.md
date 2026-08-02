# Редизайн «Консилиума» — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переделать раздел «Консилиум» — авто-подбор персон при создании сессии, 3-колоночный layout (история+персоны / чат / живой вердикт), ростер из 12 архетипов со стилевой отсылкой к реальным лидерам.

**Architecture:** Вся новая логика — чистые детерминированные функции в `src/data/council.ts` (`suggestPersonas`, `buildVerdict`), покрытые unit-тестами. UI (`src/routes/council.tsx`) и persistence-хук (`src/hooks/useAppState.ts`) остаются без бэкенда/LLM — тот же mock-паттерн, что и сегодняшний `buildPersonaTake`.

**Tech Stack:** React 19 + TypeScript + Vite + TanStack Router/Start + Tailwind v4, shadcn/radix UI-примитивы (`Dialog`, `Button`). Тесты — Vitest (новая dev-зависимость, в репозитории пока нет тест-раннера).

## Global Constraints

- Никакой реальной LLM-генерации: `suggestPersonas`/`buildVerdict`/`buildPersonaTake` — детерминированные функции без `Math.random`/сети.
- Реальное имя лидера (`inspiredBy`) — только как ссылка на стиль в bio персоны. Никогда не используется как атрибуция цитаты/мнения текстам, которые генерирует приложение.
- Цвета персон — контраст ≥4.5:1 с белым текстом инициалов (WCAG AA), как в существующем комментарии над `COUNCIL_PERSONAS`.
- В репозитории нет UI-тест-раннера (нет React Testing Library/jsdom) — компонентные изменения проверяются вручную через dev-сервер (Task 10), а не автотестами. Автотестами покрываются только чистые функции в `council.ts`.

---

### Task 1: Vitest + расширение ростера персон до 12

**Files:**
- Modify: `package.json` (добавить `vitest` в devDependencies и скрипт `test`)
- Create: `vitest.config.ts`
- Modify: `src/data/council.ts:1-21` (интерфейс `CouncilPersona` + `COUNCIL_PERSONAS`)
- Modify: `src/data/council.ts:39-69` (`SEED_COUNCIL_SESSIONS` — обновить `personaIds` под новый ростер; поле `followUps` добавится в Task 5)
- Create: `src/data/council.test.ts`

**Interfaces:**
- Produces: `CouncilPersona` теперь включает `inspiredBy: string`. `COUNCIL_PERSONAS` содержит 12 записей с id: `founder, operator, engineer, contrarian, industrialist, product, brand, platform, competitor, resilience, scale, transform`.

- [ ] **Step 1: Установить Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Создать конфиг Vitest**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Добавить скрипт `test` в package.json**

В `"scripts"` рядом с `"lint"` добавить:

```json
"test": "vitest run",
```

- [ ] **Step 4: Написать падающий тест на новый ростер**

```ts
// src/data/council.test.ts
import { describe, expect, it } from "vitest";
import { COUNCIL_PERSONAS, SEED_COUNCIL_SESSIONS } from "./council";

describe("COUNCIL_PERSONAS", () => {
  it("has 12 personas with unique ids", () => {
    expect(COUNCIL_PERSONAS).toHaveLength(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.id)).size).toBe(12);
  });

  it("has unique colors and initials", () => {
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.color)).size).toBe(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.initials)).size).toBe(12);
  });

  it("every persona names a real-world style reference", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(p.inspiredBy.length).toBeGreaterThan(0);
    }
  });
});

describe("SEED_COUNCIL_SESSIONS", () => {
  it("references only valid persona ids", () => {
    const validIds = new Set(COUNCIL_PERSONAS.map((p) => p.id));
    for (const session of SEED_COUNCIL_SESSIONS) {
      for (const id of session.personaIds) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 5: Запустить и убедиться, что тест падает**

Run: `npx vitest run src/data/council.test.ts`
Expected: FAIL — текущий ростер содержит 6 персон, а не 12; `SEED_COUNCIL_SESSIONS` ссылается на старые id (`strategy`, `legal` и т.д.).

- [ ] **Step 6: Заменить интерфейс и ростер персон**

Заменить блок `src/data/council.ts:1-17`:

```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Реальный лидер — только как отсылка к стилю в bio. Никогда не источник цитаты. */
  inspiredBy: string;
  color: string;
}

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // Цвета подобраны на контраст ≥4.5:1 с белым текстом инициалов (WCAG AA).
  { id: "founder", name: "Артур Ким", initials: "AK", role: "Визионер-фаундер", inspiredBy: "Илона Маска", color: "bg-amber-700" },
  { id: "operator", name: "Роза Ниязова", initials: "RN", role: "Операционный директор", inspiredBy: "Тима Кука", color: "bg-violet-600" },
  { id: "engineer", name: "Виктор Тен", initials: "VT", role: "Инженер-прагматик", inspiredBy: "Стива Возняка", color: "bg-blue-600" },
  { id: "contrarian", name: "Лейла Асанова", initials: "LA", role: "Контрарианка-инвестор", inspiredBy: "Джорджа Сороса", color: "bg-teal-700" },
  { id: "industrialist", name: "Данияр Оспанов", initials: "DO", role: "Промышленник", inspiredBy: "Уоррена Баффета", color: "bg-orange-700" },
  { id: "product", name: "Мила Ержанова", initials: "ME", role: "Продакт-лидер", inspiredBy: "Джеффа Безоса", color: "bg-fuchsia-600" },
  { id: "brand", name: "Николь Багрова", initials: "NB", role: "Бренд-стратег", inspiredBy: "Ричарда Брэнсона", color: "bg-rose-700" },
  { id: "platform", name: "Самат Ержигитов", initials: "SE", role: "Платформенный стратег", inspiredBy: "Сатьи Наделлы", color: "bg-indigo-600" },
  { id: "competitor", name: "Алина Достаева", initials: "AD", role: "Директор по M&A", inspiredBy: "Ларри Эллисона", color: "bg-red-700" },
  { id: "resilience", name: "Тимур Нурланов", initials: "TN", role: "Директор по устойчивости", inspiredBy: "Джека Ма", color: "bg-cyan-700" },
  { id: "scale", name: "Диана Рахимова", initials: "DR", role: "Операционная эффективность", inspiredBy: "Сэма Уолтона", color: "bg-emerald-700" },
  { id: "transform", name: "Ержан Тулегенов", initials: "ET", role: "Директор по трансформации", inspiredBy: "Мэри Барра", color: "bg-stone-600" },
];
```

- [ ] **Step 7: Обновить `personaIds` в `SEED_COUNCIL_SESSIONS`**

В `src/data/council.ts` (текущие строки 39-69): у сессии `seed-1` заменить `personaIds: ["strategy", "legal", "external"]` на `personaIds: ["founder", "contrarian", "transform"]`; у сессии `seed-2` заменить `personaIds: ["ops", "hr", "external"]` на `personaIds: ["operator", "competitor", "resilience"]`. Остальные поля обеих сессий не трогать.

- [ ] **Step 8: Запустить тест и убедиться, что он проходит**

Run: `npx vitest run src/data/council.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/data/council.ts src/data/council.test.ts
git commit -m "Расширить ростер Консилиума до 12 архетипов, добавить Vitest"
```

---

### Task 2: `suggestPersonas()` — авто-подбор персон по кейсу

**Files:**
- Modify: `src/data/council.ts` (вставить после интерфейса `CouncilTopic`)
- Modify: `src/data/council.test.ts`

**Interfaces:**
- Consumes: `COUNCIL_PERSONAS` (Task 1).
- Produces: `export function suggestPersonas(topic: CouncilTopic): string[]` — возвращает ровно 3 уникальных id из `COUNCIL_PERSONAS`, детерминированно зависящих от `topic.title` + `topic.businessUnit`.

- [ ] **Step 1: Написать падающий тест**

Добавить в `src/data/council.test.ts`:

```ts
import { COUNCIL_PERSONAS, SEED_COUNCIL_SESSIONS, suggestPersonas } from "./council";

describe("suggestPersonas", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("is deterministic for the same topic", () => {
    expect(suggestPersonas(topic)).toEqual(suggestPersonas(topic));
  });

  it("returns 3 unique valid persona ids", () => {
    const ids = suggestPersonas(topic);
    const validIds = new Set(COUNCIL_PERSONAS.map((p) => p.id));
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) expect(validIds.has(id)).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что тест падает**

Run: `npx vitest run src/data/council.test.ts`
Expected: FAIL с "suggestPersonas is not defined" / "no exported member"

- [ ] **Step 3: Реализовать `suggestPersonas`**

Вставить в `src/data/council.ts` сразу после интерфейса `CouncilTopic` (перед `export interface CouncilSession`):

```ts
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * ponytail: детерминированный подбор по хэшу заголовка+бизнес-юнита,
 * не семантическое сопоставление темы и архетипа. Заменить на более
 * умную логику, если подбор будет систематически невпопад.
 */
export function suggestPersonas(topic: CouncilTopic): string[] {
  const ids = COUNCIL_PERSONAS.map((p) => p.id);
  const start = hashString(topic.title + topic.businessUnit) % ids.length;
  return [0, 5, 10].map((offset) => ids[(start + offset) % ids.length]);
}
```

- [ ] **Step 4: Запустить тесты и убедиться, что проходят**

Run: `npx vitest run src/data/council.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "Добавить детерминированный авто-подбор персон suggestPersonas()"
```

---

### Task 3: `buildVerdict()` — живой синтез, открытые вопросы, теги

**Files:**
- Modify: `src/data/council.ts` (добавить в конец файла, после `buildPersonaTake` — которая переписывается в Task 4; порядок задач не важен для этого добавления)
- Modify: `src/data/council.test.ts`

**Interfaces:**
- Consumes: `CouncilTopic` (существующий тип).
- Produces: `export interface CouncilVerdict { synthesis: string; openQuestions: string[]; agreements: { label: string; kind: "agree" | "risk" }[] }` и `export function buildVerdict(topic: CouncilTopic, personaIds: string[], followUps: string[]): CouncilVerdict`.

- [ ] **Step 1: Написать падающий тест**

Добавить в `src/data/council.test.ts`:

```ts
import { buildVerdict } from "./council";

describe("buildVerdict", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("uses the topic insight as synthesis before any follow-up", () => {
    expect(buildVerdict(topic, ["operator"], []).synthesis).toBe(topic.insight);
  });

  it("folds the latest follow-up into the synthesis", () => {
    const verdict = buildVerdict(topic, ["operator"], ["А если спрос не подтвердится?"]);
    expect(verdict.synthesis).toContain("А если спрос не подтвердится?");
  });

  it("returns one open question per persona", () => {
    const verdict = buildVerdict(topic, ["operator", "competitor"], []);
    expect(verdict.openQuestions).toHaveLength(2);
  });

  it("adds a risk tag only when a risk-voiced persona is present", () => {
    expect(buildVerdict(topic, ["operator"], []).agreements.some((a) => a.kind === "risk")).toBe(false);
    expect(buildVerdict(topic, ["competitor"], []).agreements.some((a) => a.kind === "risk")).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что тест падает**

Run: `npx vitest run src/data/council.test.ts`
Expected: FAIL с "buildVerdict is not defined"

- [ ] **Step 3: Реализовать `buildVerdict`**

Добавить в конец `src/data/council.ts`:

```ts
export interface CouncilVerdict {
  synthesis: string;
  openQuestions: string[];
  agreements: { label: string; kind: "agree" | "risk" }[];
}

const PERSONA_QUESTIONS: Record<string, string> = {
  founder: "Меняет ли это правила игры для компании на годы вперёд?",
  operator: "Кто станет владельцем процесса после запуска?",
  engineer: "Что произойдёт при провале ключевого допущения?",
  contrarian: "Где консенсус рынка может ошибаться?",
  industrialist: "Стоит ли краткосрочная выгода долгосрочной репутации?",
  product: "Как это меняет жизнь конечного клиента?",
  brand: "Как мы объясним это решение публично?",
  platform: "Кто ещё выигрывает от этого решения?",
  competitor: "Кто сделает этот шаг, если не мы?",
  resilience: "Что если регуляторная ситуация изменится?",
  scale: "Где здесь скрытые издержки на масштабе?",
  transform: "Готова ли культура компании к этому изменению?",
};

const RISK_PERSONAS = new Set(["contrarian", "competitor", "resilience"]);

function buildAgreements(
  personaIds: string[],
  topic: CouncilTopic,
): { label: string; kind: "agree" | "risk" }[] {
  const agreements: { label: string; kind: "agree" | "risk" }[] = [
    {
      label: topic.insight.length > 40 ? `${topic.insight.slice(0, 40)}…` : topic.insight,
      kind: "agree",
    },
  ];
  if (personaIds.some((id) => RISK_PERSONAS.has(id))) {
    agreements.push({ label: `Риск: сроки и допущения по «${topic.businessUnit}»`, kind: "risk" });
  }
  return agreements;
}

export function buildVerdict(
  topic: CouncilTopic,
  personaIds: string[],
  followUps: string[],
): CouncilVerdict {
  const latest = followUps[followUps.length - 1];
  const synthesis = latest
    ? `${topic.insight} По вопросу «${latest}» совет расходится в деталях, но не в сути: решение зависит от того, какой риск готова принять компания.`
    : topic.insight;

  return {
    synthesis,
    openQuestions: personaIds.map((id) => PERSONA_QUESTIONS[id] ?? topic.insight),
    agreements: buildAgreements(personaIds, topic),
  };
}
```

- [ ] **Step 4: Запустить тесты и убедиться, что проходят**

Run: `npx vitest run src/data/council.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "Добавить buildVerdict() — живой синтез, открытые вопросы, теги согласия"
```

---

### Task 4: Переписать `buildPersonaTake` под 12 характеров

**Files:**
- Modify: `src/data/council.ts:71-88` (текущая функция `buildPersonaTake`)
- Modify: `src/data/council.test.ts`

**Interfaces:**
- Consumes: `COUNCIL_PERSONAS` (Task 1).
- Produces: `buildPersonaTake(personaId: string, topic: CouncilTopic): string` — сигнатура не меняется, меняется только содержимое `switch`.

- [ ] **Step 1: Написать падающий тест на покрытие всех персон**

Добавить в `src/data/council.test.ts`:

```ts
import { buildPersonaTake } from "./council";

describe("buildPersonaTake", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("has a distinct case for every persona (no silent default fallback)", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(buildPersonaTake(p.id, topic)).not.toBe(topic.insight);
    }
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что тест падает**

Run: `npx vitest run src/data/council.test.ts`
Expected: FAIL — для новых id (`founder`, `operator` и т.д.) `switch` попадает в `default` и возвращает `topic.insight` без изменений.

- [ ] **Step 3: Переписать `buildPersonaTake`**

Заменить весь блок `src/data/council.ts:71-88`:

```ts
export function buildPersonaTake(personaId: string, topic: CouncilTopic): string {
  switch (personaId) {
    case "founder":
      return `Смело: ${topic.insight} Если это не меняет правила игры на горизонте 10 лет — не стоит тратить на это ресурсы.`;
    case "operator":
      return `Операционно: ${topic.summary} Без чёткого владельца процесса и метрик это не повторится на масштабе «${topic.businessUnit}».`;
    case "engineer":
      return `Технически: прежде чем говорить про «${topic.title}», нужно проверить, что это вообще реализуемо без скрытых допущений.`;
    case "contrarian":
      return `Контрарианский взгляд: рынок наверняка уже заложил обратное — ${topic.insight.toLowerCase()} Стоит поставить на то, где консенсус ошибается.`;
    case "industrialist":
      return `Долгий горизонт: репутация «${topic.businessUnit}» стоит дороже быстрой выгоды. ${topic.insight} Спешить не буду.`;
    case "product":
      return `С точки зрения клиента: ${topic.summary} Если это не улучшает жизнь конечного пользователя — вопрос ещё не решён.`;
    case "brand":
      return `История имеет значение: как мы объясним «${topic.title}» людям внутри и снаружи компании? ${topic.insight}`;
    case "platform":
      return `Экосистемно: кто ещё выигрывает, если мы пойдём этим путём? Партнёрства важнее, чем контроль над каждым шагом.`;
    case "competitor":
      return `Конкурентно: ${topic.insight} Если мы не сделаем этот шаг первыми, это сделает кто-то другой в «${topic.businessUnit}».`;
    case "resilience":
      return `Через призму устойчивости: регуляторная и рыночная турбулентность рано или поздно ударит по «${topic.businessUnit}» — вопрос, готовы ли мы адаптироваться быстрее других.`;
    case "scale":
      return `Эффективность прежде всего: ${topic.summary} Каждый лишний доллар издержек на масштабе «${topic.businessUnit}» — упущенная маржа.`;
    case "transform":
      return `Трансформационно: старые процессы в «${topic.businessUnit}» не переживут это решение без изменений в культуре. ${topic.insight}`;
    default:
      return topic.insight;
  }
}
```

- [ ] **Step 4: Запустить тесты и убедиться, что проходят**

Run: `npx vitest run src/data/council.test.ts`
Expected: PASS (все тесты в файле, включая Task 1-3)

- [ ] **Step 5: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "Переписать buildPersonaTake под 12 характеров архетипов"
```

---

### Task 5: `CouncilSession.followUps` + методы хука `useCouncilSessions`

**Files:**
- Modify: `src/data/council.ts` (интерфейс `CouncilSession`, `SEED_COUNCIL_SESSIONS`)
- Modify: `src/hooks/useAppState.ts:50-68` (`useCouncilSessions`)

**Interfaces:**
- Consumes: `CouncilSession` (Task 1), `useLocalStorage` (существующий хук, без изменений).
- Produces: `useCouncilSessions()` теперь возвращает `{ sessions, create, markRead, updatePersonas, addFollowUp }`, где `updatePersonas(id: string, personaIds: string[]): void` и `addFollowUp(id: string, text: string): void`.

Нет автотестов на этот таск: в репозитории нет React Testing Library/jsdom, а добавлять их ради одного хука — за рамками задачи (см. Global Constraints). Проверяется вручную в Task 10.

- [ ] **Step 1: Добавить `followUps` в `CouncilSession` и seed-данные**

В `src/data/council.ts` заменить интерфейс:

```ts
export interface CouncilSession {
  id: string;
  title: string;
  date: string;
  personaIds: string[];
  unread?: boolean;
  topic: CouncilTopic;
  followUps: string[];
}
```

В обеих записях `SEED_COUNCIL_SESSIONS` (`seed-1`, `seed-2`) добавить поле `followUps: [],` сразу после `personaIds: [...]`.

- [ ] **Step 2: Добавить `updatePersonas` и `addFollowUp` в хук**

Заменить `src/hooks/useAppState.ts:50-68`:

```ts
export function useCouncilSessions() {
  const [sessions, setSessions] = useLocalStorage<CouncilSession[]>(
    "biaqyl:council-sessions",
    SEED_COUNCIL_SESSIONS,
  );

  const create = useCallback(
    (session: CouncilSession) => setSessions((prev) => [session, ...prev]),
    [setSessions],
  );

  const markRead = useCallback(
    (id: string) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, unread: false } : s))),
    [setSessions],
  );

  const updatePersonas = useCallback(
    (id: string, personaIds: string[]) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, personaIds } : s))),
    [setSessions],
  );

  const addFollowUp = useCallback(
    (id: string, text: string) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, followUps: [...s.followUps, text] } : s)),
      ),
    [setSessions],
  );

  return { sessions, create, markRead, updatePersonas, addFollowUp };
}
```

- [ ] **Step 3: Проверить типы**

Run: `npx tsc --noEmit`
Expected: без ошибок (после Task 5 `council.tsx` ещё использует старые поля — если `tsc` сообщит об ошибках в `council.tsx` про отсутствующий `followUps` при создании сессии, это ожидаемо и чинится в Task 7; ошибок в `council.ts`/`useAppState.ts` быть не должно).

- [ ] **Step 4: Commit**

```bash
git add src/data/council.ts src/hooks/useAppState.ts
git commit -m "Добавить followUps в CouncilSession и методы updatePersonas/addFollowUp"
```

---

### Task 6: Компонент `PersonaPicker` (поиск + выбор до 3 персон)

**Files:**
- Modify: `src/routes/council.tsx` (добавить импорты `Dialog*`, добавить компонент `PersonaPicker`)

**Interfaces:**
- Consumes: `COUNCIL_PERSONAS` (Task 1), `MAX_PERSONAS` (существующая константа в файле), `cn` (существующий импорт), `Dialog/DialogContent/DialogFooter/DialogHeader/DialogTitle` из `@/components/ui/dialog`, `Button` (существующий импорт), `Search` (существующий импорт из lucide-react).
- Produces: `function PersonaPicker({ selected: string[], onChange: (ids: string[]) => void, onClose: () => void })` — рендерит модалку с поиском; используется в Task 7 и Task 9.

Компонент внутри клиентского React-дерева, без сетевых вызовов — отдельный автотест не пишем (см. Global Constraints), проверяется вручную в Task 10.

- [ ] **Step 1: Добавить импорт `Dialog*`**

В `src/routes/council.tsx` после строки `import { Button } from "@/components/ui/button";` добавить:

```tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
```

- [ ] **Step 2: Добавить компонент `PersonaPicker`**

Вставить перед функцией `EmptyState` (после `NewCouncilPanel`):

```tsx
function PersonaPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = COUNCIL_PERSONAS.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.inspiredBy.toLowerCase().includes(q),
  );

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : selected.length >= MAX_PERSONAS
          ? selected
          : [...selected, id],
    );

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Состав совета ({selected.length}/{MAX_PERSONAS})
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найдите персону по имени или стилю"
            className="h-10 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
          {results.map((p) => {
            const isSelected = selected.includes(p.id);
            const disabled = !isSelected && selected.length >= MAX_PERSONAS;
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                disabled={disabled}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors disabled:opacity-40",
                  isSelected
                    ? "border-primary bg-primary/8"
                    : "border-border hover:border-primary/30 hover:bg-secondary/30",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                    p.color,
                  )}
                >
                  {p.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-card-foreground">
                    {p.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.role} · в духе {p.inspiredBy}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Готово</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Проверить типы**

Run: `npx tsc --noEmit`
Expected: `PersonaPicker` не используется нигде ещё — TypeScript может дать warning о неиспользуемом компоненте только если включён `noUnusedLocals` для функций верхнего уровня (обычно нет для объявлений функций, только для переменных/импортов) — ошибок быть не должно. Если появится ошибка о неиспользуемом импорте `Dialog*`, это ожидаемо устранится в Task 7-9.

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Добавить компонент PersonaPicker с поиском"
```

---

### Task 7: `NewCouncilPanel` — авто-подбор персон, без второго шага

**Files:**
- Modify: `src/routes/council.tsx:9-14` (импорт из `@/data/council` — добавить `suggestPersonas`)
- Modify: `src/routes/council.tsx:59-193` (весь компонент `NewCouncilPanel`)

**Interfaces:**
- Consumes: `suggestPersonas` (Task 2), `PersonaPicker` (Task 6), `getPersona`/`COUNCIL_PERSONAS` (Task 1), `CouncilSession` (с `followUps`, Task 5).
- Produces: `onCreate` вызывается с сессией, содержащей `followUps: []` и `personaIds`, подобранные автоматически.

- [ ] **Step 1: Обновить импорт из `@/data/council`**

Заменить блок импорта `src/routes/council.tsx:9-14`:

```tsx
import {
  buildPersonaTake,
  buildVerdict,
  COUNCIL_PERSONAS,
  getPersona,
  suggestPersonas,
  type CouncilSession,
} from "@/data/council";
```

- [ ] **Step 2: Переписать `NewCouncilPanel`**

Заменить весь блок `src/routes/council.tsx:59-193` (от `function NewCouncilPanel` до закрывающей `}` перед `function EmptyState`):

```tsx
function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const selectCard = (c: KnowledgeCardData) => {
    setCard(c);
    setPersonaIds(
      suggestPersonas({
        title: c.title,
        summary: c.executive_summary,
        insight: c.core_insight,
        businessUnit: c.business_unit,
      }),
    );
  };

  const start = () => {
    if (!card || personaIds.length === 0) return;
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      followUps: [],
      topic: {
        title: card.title,
        summary: card.executive_summary,
        insight: card.core_insight,
        businessUnit: card.business_unit,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-6 py-10">
      <div>
        <label
          htmlFor="council-case-search"
          className="mb-2 block text-xs font-bold text-muted-foreground"
        >
          Выберите кейс
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 transition-colors focus-within:border-primary">
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
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCard(c)}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                card?.id === c.id
                  ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                  : "border-transparent text-muted-foreground hover:bg-secondary/50",
              )}
            >
              <span className="block truncate">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {card && (
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">
            Совет ({personaIds.length}/{MAX_PERSONAS})
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {personaIds.map((id) => {
              const p = getPersona(id);
              return (
                <span
                  key={id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white",
                    p.color,
                  )}
                >
                  {p.initials} {p.name.split(" ")[0]}
                </span>
              );
            })}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Изменить состав
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          className="flex-1 gap-1.5"
          disabled={!card || personaIds.length === 0}
          onClick={start}
        >
          <Plus className="h-4 w-4" /> Начать совет
        </Button>
      </div>

      {pickerOpen && (
        <PersonaPicker
          selected={personaIds}
          onChange={setPersonaIds}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Проверить типы и линт**

Run: `npx tsc --noEmit && npm run lint`
Expected: без ошибок в `NewCouncilPanel` (компонент `SessionView`/`CouncilPage` ниже по файлу ещё не обновлены — их ошибки, если появятся, устраняются в Task 8-9).

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Убрать ручной выбор персон из NewCouncilPanel — авто-подбор одним экраном"
```

---

### Task 8: `SessionView` — убрать локальный тред-синтез, использовать `session.followUps`

**Files:**
- Modify: `src/routes/council.tsx:227-316` (весь компонент `SessionView`)

**Interfaces:**
- Consumes: `session.followUps: string[]` (Task 5), `buildPersonaTake` (Task 4).
- Produces: `function SessionView({ session: CouncilSession, onFollowUp: (text: string) => void })` — пропадает пропс без `onFollowUp` (сигнатура меняется), используется в Task 9.

- [ ] **Step 1: Переписать `SessionView`**

Заменить весь блок `src/routes/council.tsx:227-316` (от `function SessionView` до закрывающей `}` перед `function CouncilPage`):

```tsx
function SessionView({
  session,
  onFollowUp,
}: {
  session: CouncilSession;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");

  const send = () => {
    const text = followUp.trim();
    if (!text) return;
    onFollowUp(text);
    setFollowUp("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-6 py-8">
      <div>
        <p className="text-xs font-bold text-primary">Кейс</p>
        <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {session.topic.summary}
        </p>
      </div>

      <div className="space-y-3">
        {session.personaIds.map((id) => {
          const p = getPersona(id);
          return (
            <div key={id} className="flex gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white",
                  p.color,
                )}
              >
                {p.initials}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-3">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-card-foreground">
                  {buildPersonaTake(id, session.topic)}
                </p>
              </div>
            </div>
          );
        })}

        {session.followUps.map((text, i) => (
          <div
            key={i}
            className="ml-12 rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 p-3 text-sm text-card-foreground"
          >
            {text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-border pt-4">
        <label htmlFor="council-follow-up" className="sr-only">
          Уточняющий вопрос совету
        </label>
        <input
          id="council-follow-up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Задайте уточняющий вопрос совету"
          className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
        />
        <Button size="icon" disabled={!followUp.trim()} onClick={send} aria-label="Отправить">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit`
Expected: ошибка в `CouncilPage` — вызов `<SessionView session={active} />` без `onFollowUp` (ожидаемо, чинится в Task 9).

- [ ] **Step 3: Commit**

```bash
git add src/routes/council.tsx
git commit -m "SessionView: тред follow-up хранится в session.followUps вместо локального стейта"
```

---

### Task 9: `VerdictPanel` + 3-колоночный layout в `CouncilPage`

**Files:**
- Modify: `src/routes/council.tsx` (добавить компонент `VerdictPanel` перед `CouncilPage`, переписать `CouncilPage`)

**Interfaces:**
- Consumes: `buildVerdict` (Task 3), `SessionView`/`onFollowUp` (Task 8), `PersonaPicker` (Task 6), `updatePersonas`/`addFollowUp` (Task 5).
- Produces: рабочий 3-колоночный `CouncilPage` — история+персоны слева, чат в центре, вердикт справа (на узких экранах вердикт стекается под чат).

- [ ] **Step 1: Добавить компонент `VerdictPanel`**

Вставить перед `function CouncilPage() {`:

```tsx
function VerdictPanel({ session }: { session: CouncilSession }) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);

  return (
    <aside
      aria-label="Вердикт совета"
      className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-border bg-card p-4 lg:w-[260px] lg:border-l lg:border-t-0"
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="text-xs font-bold text-primary">Вердикт совета</p>
      </div>
      <div className="rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground">
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <ul className="space-y-1.5">
          {verdict.openQuestions.map((question, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-secondary/30 p-2 text-xs text-card-foreground"
            >
              {question}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Согласны / расходятся</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.agreements.map((a, i) => (
            <span
              key={i}
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                a.kind === "agree"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Переписать `CouncilPage`**

Заменить весь блок `function CouncilPage() { ... }` (текущие строки 318-398, до `function SessionRow`):

```tsx
function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { sessions, create, markRead, updatePersonas, addFollowUp } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const today = sessions.filter((s) => s.date === TODAY);
  const earlier = sessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col overflow-y-auto border-b border-border bg-card p-3 md:max-h-none md:w-[320px] md:border-b-0 md:border-r">
          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Новый совет
          </Button>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow key={s.id} session={s} active={s.id === activeId} onClick={openSession} />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow key={s.id} session={s} active={s.id === activeId} onClick={openSession} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              <div className="flex flex-wrap gap-1.5 px-1">
                {active.personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <span
                      key={id}
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white",
                        p.color,
                      )}
                    >
                      {p.initials}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
              >
                Изменить состав
              </button>
            </div>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            {creating ? (
              <NewCouncilPanel
                onCancel={() => setCreating(false)}
                onCreate={(session) => {
                  create(session);
                  setCreating(false);
                  setActiveId(session.id);
                }}
              />
            ) : active ? (
              <SessionView session={active} onFollowUp={(text) => addFollowUp(active.id, text)} />
            ) : (
              <EmptyState onNew={() => setCreating(true)} />
            )}
          </main>
          {active && <VerdictPanel session={active} />}
        </div>
      </div>

      {active && pickerOpen && (
        <PersonaPicker
          selected={active.personaIds}
          onChange={(ids) => updatePersonas(active.id, ids)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
```

`SessionRow` и `AvatarStack` ниже по файлу не меняются.

- [ ] **Step 3: Проверить типы, линт и тесты**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: всё проходит без ошибок.

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "3-колоночный layout Консилиума: история+персоны / чат / живой вердикт"
```

---

### Task 10: Ручная проверка в браузере

**Files:** нет изменений — только верификация.

- [ ] **Step 1: Запустить dev-сервер**

Run: `npm run dev`

- [ ] **Step 2: Проверить создание сессии одним экраном**

Открыть `/council`, нажать «Новый совет», выбрать кейс из списка. Ожидаемо: сразу появляются 3 чипа персон (без отдельного шага выбора) и активная кнопка «Начать совет».

- [ ] **Step 3: Проверить 3-колоночный layout**

Нажать «Начать совет». Ожидаемо: слева — история сессий + чипы персон текущей сессии + «Изменить состав»; в центре — реплики персон и поле ввода; справа — «Вердикт совета» с текстом синтеза (равен `topic.insight`, пока не задан уточняющий вопрос), блоком «Открытые вопросы» и «Согласны / расходятся».

- [ ] **Step 4: Проверить живой вердикт**

Ввести уточняющий вопрос и отправить. Ожидаемо: реплика появляется в центральной колонке, а текст в правой колонке «Вердикт совета» обновляется и включает текст заданного вопроса.

- [ ] **Step 5: Проверить «Изменить состав»**

Кликнуть «Изменить состав» слева. Ожидаемо: открывается модалка с поиском по 12 персонам; можно снять одну персону и выбрать другую (максимум 3); после закрытия модалки чипы слева и реплики в чате отражают новый состав.

- [ ] **Step 6: Проверить адаптивность и тему**

Сжать окно браузера до мобильной ширины — колонка вердикта должна уйти под чат, а не пропасть. Переключить тёмную/светлую тему через `Header` — цвета персон, вердикта и тегов согласия должны сохранять контраст в обеих темах.

- [ ] **Step 7: Зафиксировать результат**

Если что-то из Step 2-6 не совпадает с ожиданием — вернуться к соответствующему Task и исправить перед тем, как считать план выполненным.
