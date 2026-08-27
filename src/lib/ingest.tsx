import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  deriveTitle,
  extensionOf,
  familyOf,
  formatBytes,
  ingestStages,
  triageFiles,
  buildNotebookSources,
  type IngestStage,
} from "@/lib/sources";
import type { KnowledgeCardData, MediaType } from "@/data/mockCards";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  useActivity,
  useUserCards,
  type CardSourceState,
  type UploadedSource,
} from "@/hooks/useAppState";
import { BCP47, useCards, useI18n, useT, type Dictionary } from "@/lib/i18n";

/** Длительность одного этапа обработки. Прототип показывает состояние, не работу. */
const STAGE_MS = 700;

/** Тип материала выводится из формата файла — так же, как это сделал бы разбор на сервере. */
const MEDIA_BY_FAMILY: Record<ReturnType<typeof familyOf>, MediaType> = {
  text: "document",
  document: "document",
  slides: "presentation",
  audio: "podcast",
  video: "video",
};

/** Куда попадёт разобранный файл: в новый кейс или в уже открытый. */
export type IngestTarget = { kind: "new"; unit: string } | { kind: "case"; cardId: string };

export interface IngestJob {
  id: string;
  fileName: string;
  size: string;
  /** Кейс, к которому относится файл. У отклонённого файла кейса нет. */
  cardId?: string;
  cardTitle?: string;
  stages: IngestStage[];
  step: number;
  state: "running" | "done" | "error";
  /** Формат, из-за которого файл отклонён. */
  badFormat?: string;
  /** Цель — чтобы «Выбрать другой файл» повторил ту же операцию. */
  target: IngestTarget;
}

interface IngestApi {
  jobs: IngestJob[];
  /** Принимает файлы: валидирует формат, ведёт по этапам и дописывает результат в кейс. */
  start: (files: FileList | File[] | null, target: IngestTarget) => Promise<void>;
  dismiss: (id: string) => void;
  clearFinished: () => void;
  /** Идущая обработка для карточки — от неё зависит прогресс на самой карточке. */
  jobFor: (cardId: string) => IngestJob | undefined;
}

const IngestContext = createContext<IngestApi | null>(null);

export function useIngest(): IngestApi {
  const api = useContext(IngestContext);
  if (!api) throw new Error("useIngest используется вне IngestProvider");
  return api;
}

const EMPTY_STATE: CardSourceState = { selected: null, renames: {}, removed: [], uploads: [] };

/**
 * Дописывает загруженный файл в источники любого кейса — не только открытого.
 * Выбор источников материализуется: пока он `null`, это «все исходные», и новый
 * файл в него бы не попал.
 */
function useCardUploads() {
  const [, setAll] = useLocalStorage<Record<string, CardSourceState>>("biaqyl:card-sources", {});

  return useCallback(
    (card: KnowledgeCardData, baseIds: string[], upload: Omit<UploadedSource, "id" | "date">) => {
      const created: UploadedSource = {
        ...upload,
        id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        date: new Date().toLocaleDateString("ru-RU"),
      };
      setAll((prev) => {
        const state = { ...EMPTY_STATE, ...(prev[card.id] ?? {}) };
        return {
          ...prev,
          [card.id]: {
            ...state,
            uploads: [...state.uploads, created],
            selected: [...(state.selected ?? baseIds), created.id],
          },
        };
      });
    },
    [setAll],
  );
}

export function IngestProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { locale } = useI18n();
  const seedCards = useCards();
  const { cards: userCards, add: addUserCard } = useUserCards();
  const addUpload = useCardUploads();
  const { log: logActivity } = useActivity();

  const [jobs, setJobs] = useState<IngestJob[]>([]);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  // Карточки нужны, чтобы посчитать исходные источники кейса при дозаписи.
  const allCards = useMemo(() => [...userCards, ...seedCards], [userCards, seedCards]);
  const cardsRef = useRef(allCards);
  cardsRef.current = allCards;

  const dismiss = useCallback((id: string) => setJobs((p) => p.filter((j) => j.id !== id)), []);
  const clearFinished = useCallback(
    () => setJobs((p) => p.filter((j) => j.state === "running")),
    [],
  );

  const start = useCallback(
    async (list: FileList | File[] | null, target: IngestTarget) => {
      const incoming = Array.from(list ?? []);
      if (incoming.length === 0) return;

      const { accepted, rejected } = triageFiles(incoming);

      // Отклонённый файл — такая же запись в виджете, с причиной и кнопкой выбрать другой.
      for (const file of rejected) {
        setJobs((p) => [
          {
            id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            fileName: file.name,
            size: formatBytes(file.size, t),
            stages: [],
            step: 0,
            state: "error",
            badFormat: (extensionOf(file.name) || t.sources.noTypeLabel).toUpperCase(),
            target,
          },
          ...p,
        ]);
      }
      if (rejected.length > 0) {
        toast.error(
          rejected.length === 1
            ? t.sources.rejectedOne(rejected[0].name)
            : t.sources.rejectedMany(rejected.length),
        );
      }

      for (const file of accepted) {
        const stages = ingestStages(file.name, t);
        const title = await deriveTitle(file, t, BCP47[locale]);
        const family = familyOf(file.name);
        const excerpt =
          family === "text"
            ? await file
                .text()
                .then((text) => text.trim().slice(0, 900))
                .catch(() => undefined)
            : undefined;

        const upload = {
          title,
          format: extensionOf(file.name).toUpperCase(),
          size: formatBytes(file.size, t),
          fileName: file.name,
          excerpt,
        };

        // Кейс появляется в сетке сразу — с прогрессом, а не после разбора.
        let cardId: string;
        let cardTitle: string;
        if (target.kind === "new") {
          const card = newCase(file, title, excerpt, target.unit, family, locale, t);
          addUserCard(card);
          cardId = card.id;
          cardTitle = card.title;
        } else {
          cardId = target.cardId;
          cardTitle = cardsRef.current.find((c) => c.id === cardId)?.title ?? "";
        }

        const job: IngestJob = {
          id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          fileName: file.name,
          size: upload.size,
          cardId,
          cardTitle,
          stages,
          step: 0,
          state: "running",
          target,
        };
        setJobs((p) => [job, ...p]);

        // Этапы идут последовательно — как приходили бы статусы разбора с сервера.
        stages.forEach((_, i) => {
          if (i === 0) return;
          timersRef.current.push(
            window.setTimeout(
              () => setJobs((p) => p.map((j) => (j.id === job.id ? { ...j, step: i } : j))),
              i * STAGE_MS,
            ),
          );
        });

        timersRef.current.push(
          window.setTimeout(() => {
            const card = cardsRef.current.find((c) => c.id === cardId);
            if (card)
              addUpload(
                card,
                buildNotebookSources(card, t).map((s) => s.id),
                upload,
              );
            setJobs((p) =>
              p.map((j) =>
                j.id === job.id ? { ...j, state: "done", step: stages.length - 1 } : j,
              ),
            );
            logActivity("upload", title);
          }, stages.length * STAGE_MS),
        );
      }
    },
    [t, locale, addUserCard, addUpload, logActivity],
  );

  const jobFor = useCallback(
    (cardId: string) => jobs.find((j) => j.cardId === cardId && j.state === "running"),
    [jobs],
  );

  const api = useMemo<IngestApi>(
    () => ({ jobs, start, dismiss, clearFinished, jobFor }),
    [jobs, start, dismiss, clearFinished, jobFor],
  );

  return <IngestContext.Provider value={api}>{children}</IngestContext.Provider>;
}

function newCase(
  file: File,
  title: string,
  excerpt: string | undefined,
  unit: string,
  family: ReturnType<typeof familyOf>,
  locale: string,
  t: Dictionary,
): KnowledgeCardData {
  return {
    id: `case_${Date.now()}`,
    title,
    // Содержимое не разобрано — говорим об этом прямо, а не подставляем выдуманный текст.
    executive_summary: excerpt ?? t.newCase.pendingSummary,
    core_insight: t.newCase.pendingInsight,
    citations: [],
    source: file.name,
    author: `${t.profile.firstName} ${t.profile.lastName}`,
    language: locale.toUpperCase() as KnowledgeCardData["language"],
    scope: "INTERNAL",
    // Свежий кейс виден сразу: relevance участвует только в ранжировании поиска.
    relevance: 95,
    date: new Date().toISOString().slice(0, 10),
    media_type: MEDIA_BY_FAMILY[family],
    business_unit: unit,
    tags: [],
    isNew: true,
  };
}
