"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  ChevronDown,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";

interface ActivityOption {
  id: string;
  nombre: string;
  year: number;
  estado: string;
}

interface VolunteerOption {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface ReportsFiltersProps {
  activities: ActivityOption[];
  volunteers: VolunteerOption[];
  active: {
    fromIso: string;
    toIso: string;
    activityId?: string;
    volunteerId?: string;
  };
}

const ESTADO_LABELS: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const PRESET_OPTIONS = [
  { id: "today", label: "Hoy" },
  { id: "last_7_days", label: "Últimos 7 días" },
  { id: "last_30_days", label: "Últimos 30 días" },
  { id: "current_month", label: "Mes actual" },
  { id: "previous_month", label: "Mes anterior" },
  { id: "current_quarter", label: "Trimestre actual" },
  { id: "current_year", label: "Año actual" },
  { id: "previous_year", label: "Año anterior" },
  { id: "last_12_months", label: "Últimos 12 meses" },
  { id: "all_time", label: "Histórico completo" },
  { id: "custom", label: "Personalizado" },
] as const;

type PresetId = (typeof PRESET_OPTIONS)[number]["id"];

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function dateToIso(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function isoToDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function presetRange(id: PresetId): { from: Date; to: Date } {
  const today = todayUtc();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();

  switch (id) {
    case "today":
      return { from: today, to: today };
    case "last_7_days": {
      const from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 6);
      return { from, to: today };
    }
    case "last_30_days": {
      const from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 29);
      return { from, to: today };
    }
    case "current_month":
      return {
        from: new Date(Date.UTC(y, m, 1)),
        to: new Date(Date.UTC(y, m + 1, 0)),
      };
    case "previous_month":
      return {
        from: new Date(Date.UTC(y, m - 1, 1)),
        to: new Date(Date.UTC(y, m, 0)),
      };
    case "current_quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return {
        from: new Date(Date.UTC(y, qStart, 1)),
        to: new Date(Date.UTC(y, qStart + 3, 0)),
      };
    }
    case "current_year":
      return {
        from: new Date(Date.UTC(y, 0, 1)),
        to: new Date(Date.UTC(y, 11, 31)),
      };
    case "previous_year":
      return {
        from: new Date(Date.UTC(y - 1, 0, 1)),
        to: new Date(Date.UTC(y - 1, 11, 31)),
      };
    case "last_12_months":
      return {
        from: new Date(Date.UTC(y, m - 11, 1)),
        to: new Date(Date.UTC(y, m + 1, 0)),
      };
    case "all_time":
      return {
        from: new Date(Date.UTC(2000, 0, 1)),
        to: today,
      };
    case "custom":
    default:
      return {
        from: new Date(Date.UTC(y, 0, 1)),
        to: new Date(Date.UTC(y, 11, 31)),
      };
  }
}

function detectPreset(fromIso: string, toIso: string): PresetId {
  for (const p of PRESET_OPTIONS) {
    if (p.id === "custom") continue;
    const r = presetRange(p.id);
    if (dateToIso(r.from) === fromIso && dateToIso(r.to) === toIso) {
      return p.id;
    }
  }
  return "custom";
}

function formatLongDate(iso: string): string {
  const d = isoToDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ReportsFilters({
  activities,
  volunteers,
  active,
}: ReportsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialPreset = useMemo(
    () => detectPreset(active.fromIso, active.toIso),
    // run once: derive from initial URL state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [presetId, setPresetId] = useState<PresetId>(initialPreset);

  const apply = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(sp.toString());
      next.delete("year");
      mutate(next);
      const qs = next.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [router, pathname, sp],
  );

  function applyRange(from: Date, to: Date) {
    apply((p) => {
      p.set("from", dateToIso(from));
      p.set("to", dateToIso(to));
    });
  }

  function handlePresetChange(id: PresetId) {
    setPresetId(id);
    if (id !== "custom") {
      const r = presetRange(id);
      applyRange(r.from, r.to);
    }
  }

  function handleFromChange(value: string) {
    const newFrom = isoToDate(value);
    if (!newFrom) return;
    const currentTo = isoToDate(active.toIso) ?? newFrom;
    setPresetId("custom");
    if (newFrom > currentTo) {
      applyRange(newFrom, newFrom);
    } else {
      applyRange(newFrom, currentTo);
    }
  }

  function handleToChange(value: string) {
    const newTo = isoToDate(value);
    if (!newTo) return;
    const currentFrom = isoToDate(active.fromIso) ?? newTo;
    setPresetId("custom");
    if (newTo < currentFrom) {
      applyRange(newTo, newTo);
    } else {
      applyRange(currentFrom, newTo);
    }
  }

  function setActivity(id: string | null) {
    apply((p) => {
      if (id) p.set("activity", id);
      else p.delete("activity");
    });
  }

  function setVolunteer(id: string | null) {
    apply((p) => {
      if (id) p.set("volunteer", id);
      else p.delete("volunteer");
    });
  }

  function clearAll() {
    setPresetId("current_year");
    const r = presetRange("current_year");
    apply((p) => {
      p.delete("activity");
      p.delete("volunteer");
      p.set("from", dateToIso(r.from));
      p.set("to", dateToIso(r.to));
    });
  }

  const showCustomInputs = presetId === "custom";
  const todayIso = dateToIso(todayUtc());

  const defaultPreset = detectPreset(
    dateToIso(presetRange("current_year").from),
    dateToIso(presetRange("current_year").to),
  );
  const hasFilters =
    Boolean(active.activityId) ||
    Boolean(active.volunteerId) ||
    detectPreset(active.fromIso, active.toIso) !== defaultPreset;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-text-primary">
          <span className="text-sm font-semibold">Filtros</span>
          {isPending ? (
            <Loader2
              className="h-4 w-4 animate-spin text-text-muted"
              aria-label="Actualizando"
            />
          ) : null}
          <span className="text-xs text-text-muted">
            · {formatLongDate(active.fromIso)} – {formatLongDate(active.toIso)}
          </span>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Restablecer
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PeriodSelect value={presetId} onChange={handlePresetChange} />
        <ActivitySelect
          value={active.activityId ?? null}
          options={activities}
          onChange={setActivity}
        />
        <VolunteerCombobox
          value={active.volunteerId ?? null}
          options={volunteers}
          onChange={setVolunteer}
        />
      </div>

      {showCustomInputs ? (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DateField
            label="Desde"
            value={active.fromIso}
            max={todayIso}
            onChange={handleFromChange}
          />
          <DateField
            label="Hasta"
            value={active.toIso}
            max={todayIso}
            onChange={handleToChange}
          />
        </div>
      ) : null}
    </div>
  );
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: PresetId;
  onChange: (v: PresetId) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
        Período
      </span>
      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as PresetId)}
          className="w-full h-11 rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        >
          {PRESET_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      </div>
    </label>
  );
}

function DateField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
        {label}
      </span>
      <input
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
      />
    </label>
  );
}

function ActivitySelect({
  value,
  options,
  onChange,
}: {
  value: string | null;
  options: ActivityOption[];
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
        Proyecto
      </span>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full h-11 rounded-lg border border-border bg-white px-3 pr-9 text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        >
          <option value="">Todos los proyectos</option>
          {options.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} · {a.year} · {ESTADO_LABELS[a.estado] ?? a.estado}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      </div>
    </label>
  );
}

function VolunteerCombobox({
  value,
  options,
  onChange,
}: {
  value: string | null;
  options: VolunteerOption[];
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(() => {
    if (!value) return "";
    const v = options.find((o) => o.id === value);
    if (!v) return "";
    return `${v.nombre} ${v.apellido}`.trim();
  }, [value, options]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 30);
    return options
      .filter((o) => {
        const full = `${o.nombre} ${o.apellido}`.toLowerCase();
        return full.includes(q) || o.email.toLowerCase().includes(q);
      })
      .slice(0, 50);
  }, [options, query]);

  function selectId(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <div ref={containerRef} className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-1">
        Voluntario
      </span>
      <div className="relative">
        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={open ? query : selectedLabel}
          placeholder={value ? selectedLabel : "Todos los voluntarios"}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setOpen(true);
            setQuery(e.target.value);
          }}
          className="w-full h-11 rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
        {value ? (
          <button
            type="button"
            onClick={() => selectId(null)}
            aria-label="Quitar voluntario"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        )}
        {open ? (
          <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
            <button
              type="button"
              onClick={() => selectId(null)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover text-text-primary"
            >
              Todos los voluntarios
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-text-muted">
                Sin resultados
              </div>
            ) : (
              filtered.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectId(v.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover"
                >
                  <span className="block text-text-primary">
                    {v.nombre} {v.apellido}
                  </span>
                  <span className="block text-xs text-text-muted truncate">
                    {v.email}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
