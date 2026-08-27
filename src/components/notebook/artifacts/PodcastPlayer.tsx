import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Radio, RotateCcw, RotateCw } from "lucide-react";
import type { KnowledgeCardData } from "@/data/mockCards";
import { useT, type Dictionary } from "@/lib/i18n";

const AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

export interface Line {
  t: number;
  speaker: string;
  text: string;
}

export function buildTranscript(card: KnowledgeCardData, t: Dictionary): Line[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const sentences = card.executive_summary.split(/(?<=\.)\s+/).filter(Boolean);
  const v = t.viewers;
  const a = v.podcastHostA;
  const b = v.podcastHostB;

  const base: Omit<Line, "t">[] = [
    { speaker: a, text: v.podcastLine1(card.title) },
    { speaker: b, text: v.podcastLine2(card.source, card.author, card.date) },
    { speaker: a, text: v.podcastLine3(card.business_unit) },
    ...sentences.slice(0, 4).map((sentence, i) => ({
      speaker: i % 2 ? b : a,
      text: sentence,
    })),
    { speaker: b, text: v.podcastLineTurn },
    { speaker: a, text: card.core_insight },
    ...steps.slice(0, 4).map((step, i) => ({
      speaker: i % 2 ? a : b,
      text: v.podcastLineStep(i + 1, step),
    })),
    { speaker: b, text: v.podcastLineDoubt },
    { speaker: a, text: v.podcastLineAgree },
    { speaker: b, text: v.podcastLineOutro },
  ];

  return base.map((l, i) => ({ ...l, t: i * 7.5 }));
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function PodcastPlayer({ lines, fullscreen }: { lines: Line[]; fullscreen: boolean }) {
  const t = useT();
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
            <p className="truncate text-sm font-bold">{t.viewers.podcastEpisode}</p>
            <p className="truncate text-xs text-primary-foreground/70">
              {t.viewerExtra.podcastHosts(
                t.viewers.podcastHostA,
                t.viewers.podcastHostB,
                lines.length,
              )}
            </p>
          </div>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={t.viewers.podcastSeek}
          aria-valuenow={Math.round(time)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * duration);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek(time + 5);
            else if (e.key === "ArrowLeft") seek(time - 5);
            else if (e.key === "Home") seek(0);
            else if (e.key === "End") seek(duration);
            else return;
            e.preventDefault();
          }}
          className="mt-4 h-2 cursor-pointer rounded-full bg-primary-foreground/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            aria-label={t.viewers.podcastBack10}
            className="rounded-full p-2 text-primary-foreground/80 transition-[background-color,transform] active:scale-[0.96] hover:bg-primary-foreground/10"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? t.viewers.podcastPause : t.viewers.podcastPlay}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-[0.96]"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <button
            onClick={() => seek(time + 10)}
            aria-label={t.viewers.podcastForward10}
            className="rounded-full p-2 text-primary-foreground/80 transition-[background-color,transform] active:scale-[0.96] hover:bg-primary-foreground/10"
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
                  className={`mr-1.5 text-xs font-bold ${
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
      <p className="text-xs text-muted-foreground">{t.viewerExtra.podcastHint}</p>
    </div>
  );
}
