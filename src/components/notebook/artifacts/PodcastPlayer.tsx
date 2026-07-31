import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Radio, RotateCcw, RotateCw } from "lucide-react";
import type { KnowledgeCardData } from "@/data/mockCards";

const AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

export interface Line {
  t: number;
  speaker: string;
  text: string;
}

export function buildTranscript(card: KnowledgeCardData): Line[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const sentences = card.executive_summary.split(/(?<=\.)\s+/).filter(Boolean);

  const base: Omit<Line, "t">[] = [
    { speaker: "Алия", text: `Привет! Сегодня разбираем материал «${card.title}».` },
    { speaker: "Данияр", text: `Источник — ${card.source}, автор ${card.author}, ${card.date}.` },
    {
      speaker: "Алия",
      text: `Кому это важно в первую очередь? Бизнес-юниту «${card.business_unit}».`,
    },
    ...sentences.slice(0, 4).map((s, i) => ({ speaker: i % 2 ? "Данияр" : "Алия", text: s })),
    { speaker: "Данияр", text: "Окей, а в чём главный вывод, если убрать всю обёртку?" },
    { speaker: "Алия", text: card.core_insight },
    ...steps.slice(0, 4).map((s, i) => ({
      speaker: i % 2 ? "Алия" : "Данияр",
      text: `Шаг ${i + 1}: ${s}.`,
    })),
    { speaker: "Данияр", text: "Меня смущает одно: без baseline цифры невозможно проверить." },
    {
      speaker: "Алия",
      text: "Согласна. Поэтому предлагаем пилот на шесть недель и замер до старта.",
    },
    {
      speaker: "Данияр",
      text: "Договорились. Спасибо, что были с нами — и до следующего разбора.",
    },
  ];

  return base.map((l, i) => ({ ...l, t: i * 7.5 }));
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function PodcastPlayer({ lines, fullscreen }: { lines: Line[]; fullscreen: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(lines.length * 7.5);
  const [rate, setRate] = useState(1);

  // Реплики равномерно раскладываются по реальной длительности аудио.
  const timed = useMemo(
    () => lines.map((l, i) => ({ ...l, t: (i / lines.length) * duration })),
    [lines, duration],
  );

  const active = useMemo(() => {
    let idx = 0;
    timed.forEach((l, i) => {
      if (time >= l.t) idx = i;
    });
    return idx;
  }, [time, timed]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-line="${active}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      void a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const seek = (t: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, Math.min(duration - 0.2, t));
    setTime(t);
  };

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || duration)}
        onEnded={() => setPlaying(false)}
      />

      <div className="rounded-2xl border border-border bg-primary p-4 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Radio className="h-6 w-6 text-accent" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">AQYL Разбор · выпуск дня</p>
            <p className="truncate text-xs text-primary-foreground/70">
              Алия и Данияр · {lines.length} реплик
            </p>
          </div>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Перемотка"
          aria-valuenow={Math.round(time)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * duration);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") seek(time + 5);
            if (e.key === "ArrowDown") seek(time - 5);
          }}
          className="mt-4 h-2 cursor-pointer rounded-full bg-primary-foreground/20"
        >
          <div
            className="h-2 rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-primary-foreground/70">
          <span>{fmt(time)}</span>
          <span>{fmt(duration)}</span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={() => seek(time - 10)}
            aria-label="Назад 10 секунд"
            className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? "Пауза" : "Слушать"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <button
            onClick={() => seek(time + 10)}
            aria-label="Вперёд 10 секунд"
            className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
              setRate(next);
              if (audioRef.current) audioRef.current.playbackRate = next;
            }}
            className="ml-2 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-xs font-bold tabular-nums"
          >
            {rate}×
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className={`space-y-1 overflow-y-auto rounded-2xl border border-border bg-secondary/30 p-3 ${
          fullscreen ? "max-h-[46vh]" : "max-h-64"
        }`}
      >
        {timed.map((l, i) => {
          const isActive = i === active;
          return (
            <button
              key={`${l.t}-${i}`}
              data-line={i}
              onClick={() => seek(l.t)}
              className={`grid w-full grid-cols-[52px_minmax(0,1fr)] gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                isActive ? "bg-accent/10" : "hover:bg-secondary/60"
              }`}
            >
              <span
                className={`pt-0.5 text-xs tabular-nums ${
                  isActive ? "font-bold text-accent" : "text-muted-foreground/70"
                }`}
              >
                {fmt(l.t)}
              </span>
              <span
                className={`text-sm leading-relaxed transition-colors ${
                  isActive
                    ? "font-semibold text-card-foreground"
                    : i < active
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground"
                }`}
              >
                <span
                  className={`mr-1.5 text-xs font-bold uppercase tracking-wider ${
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  }`}
                >
                  {l.speaker}
                </span>
                {l.text}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Клик по реплике — перемотка. Текст подсвечивается синхронно с аудио.
      </p>
    </div>
  );
}
