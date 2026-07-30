import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { BUSINESS_UNITS, TOPIC_TAGS } from "@/data/mockCards";
import type { Filters } from "@/lib/search";
import { MEDIA_LABELS, emptyFilters } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGS = ["RU", "EN", "KK", "UZ", "AZ"] as const;

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
}

export function FiltersBar({ filters, onChange, total }: FiltersBarProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const dirty =
    filters.mediaType !== "all" ||
    filters.businessUnit !== "all" ||
    filters.language !== "all" ||
    filters.topic !== "all";

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Фильтры
      </span>

      <Select
        value={filters.mediaType}
        onValueChange={(v) => onChange({ ...filters, mediaType: v as Filters["mediaType"] })}
      >
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          {Object.entries(MEDIA_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.businessUnit}
        onValueChange={(v) => onChange({ ...filters, businessUnit: v })}
      >
        <SelectTrigger className="h-9 w-[190px] text-xs">
          <SelectValue placeholder="Направление" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все направления</SelectItem>
          {BUSINESS_UNITS.map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.language}
        onValueChange={(v) => onChange({ ...filters, language: v as Filters["language"] })}
      >
        <SelectTrigger className="h-9 w-[130px] text-xs">
          <SelectValue placeholder="Язык" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все языки</SelectItem>
          {LANGS.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>


      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs"
          onClick={() => onChange(emptyFilters)}
        >
          Сбросить
        </Button>
      )}

      <span className="ml-auto text-xs text-muted-foreground opacity-70">
        Найдено: {total}
      </span>
      </div>

      <div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 overflow-hidden transition-[max-height] duration-300",
            tagsExpanded ? "max-h-[999px]" : "max-h-[68px]",
          )}
        >
          <button
            onClick={() => onChange({ ...filters, topic: "all" })}
            title="Показать все материалы"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors active:scale-[0.96]",
              filters.topic === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            Все
          </button>
          {TOPIC_TAGS.map((t) => {
            const active = filters.topic.toLowerCase() === t.label.toLowerCase();
            return (
              <button
                key={t.label}
                onClick={() => onChange({ ...filters, topic: t.label })}
                title={t.description}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors active:scale-[0.96]",
                  active
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                #{t.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setTagsExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-primary hover:underline"
        >
          {tagsExpanded ? "Свернуть" : "Ещё"}
        </button>
      </div>
    </div>
  );
}
