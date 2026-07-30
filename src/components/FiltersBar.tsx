import { SlidersHorizontal } from "lucide-react";
import { BUSINESS_UNITS } from "@/data/mockCards";
import type { Filters } from "@/lib/search";
import { MEDIA_LABELS, emptyFilters } from "@/lib/search";
import { Button } from "@/components/ui/button";
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
  const dirty =
    filters.mediaType !== "all" || filters.businessUnit !== "all" || filters.language !== "all";

  return (
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-4 sm:px-6">
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
  );
}
