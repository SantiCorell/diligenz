"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { authFetch } from "@/lib/auth-client";
import { formatMeetingWhen, madridDateKey, type MeetingPreview } from "@/lib/agent-shared";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

type CivilDate = { y: number; m: number; d: number; key: string };

function civilFromKey(key: string): CivilDate {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d, key };
}

function shiftCivil(date: CivilDate, days: number): CivilDate {
  const utc = new Date(Date.UTC(date.y, date.m - 1, date.d, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + days);
  return civilFromKey(madridDateKey(utc.toISOString()));
}

function weekdayMondayIndex(date: CivilDate) {
  const utc = new Date(Date.UTC(date.y, date.m - 1, date.d, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
  }).format(utc);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[weekday] ?? 0;
}

function monthLabel(date: CivilDate) {
  const utc = new Date(Date.UTC(date.y, date.m - 1, 1, 12, 0, 0));
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    month: "long",
    year: "numeric",
  }).format(utc);
}

function buildCells(month: CivilDate) {
  const first = { y: month.y, m: month.m, d: 1, key: "" };
  const start = shiftCivil({ ...first, key: `${month.y}-${String(month.m).padStart(2, "0")}-01` }, -weekdayMondayIndex(first));
  return Array.from({ length: 42 }, (_, index) => shiftCivil(start, index));
}

export default function MeetingsCalendar() {
  const [meetings, setMeetings] = useState<MeetingPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const today = civilFromKey(madridDateKey(new Date().toISOString()));
    return { ...today, d: 1 };
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/me/meetings");
      const data = (await res.json().catch(() => ({}))) as { meetings?: MeetingPreview[] };
      if (res.ok) setMeetings(data.meetings ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<string, MeetingPreview[]>();
    for (const meeting of meetings) {
      if (!meeting.startsAt) continue;
      const key = madridDateKey(meeting.startsAt);
      map.set(key, [...(map.get(key) ?? []), meeting]);
    }
    return map;
  }, [meetings]);

  const cells = useMemo(() => buildCells(month), [month]);
  const pending = meetings.filter((meeting) => !meeting.startsAt);
  const visible = selectedKey
    ? meetings.filter((meeting) => meeting.startsAt && madridDateKey(meeting.startsAt) === selectedKey)
    : [...meetings].sort((a, b) => {
        if (!a.startsAt && !b.startsAt) return 0;
        if (!a.startsAt) return -1;
        if (!b.startsAt) return 1;
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });

  const saveTime = async (id: string) => {
    if (!when) return;
    setError(null);
    const startsAt = new Date(when);
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    const res = await authFetch(`/api/me/meetings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error || "No se pudo guardar la hora.");
      return;
    }
    setEditingId(null);
    setWhen("");
    await load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              setMonth((current) => {
                const prev = current.m === 1 ? { y: current.y - 1, m: 12, d: 1, key: "" } : { y: current.y, m: current.m - 1, d: 1, key: "" };
                return prev;
              })
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-base font-semibold capitalize text-slate-900">{monthLabel(month)}</h2>
          <button
            type="button"
            onClick={() =>
              setMonth((current) => {
                const next = current.m === 12 ? { y: current.y + 1, m: 1, d: 1, key: "" } : { y: current.y, m: current.m + 1, d: 1, key: "" };
                return next;
              })
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date) => {
            const inMonth = date.m === month.m && date.y === month.y;
            const count = byDay.get(date.key)?.length ?? 0;
            const selected = selectedKey === date.key;
            return (
              <button
                key={date.key}
                type="button"
                onClick={() => setSelectedKey((current) => (current === date.key ? null : date.key))}
                className={`flex h-12 flex-col items-center justify-center rounded-xl text-sm ${
                  selected
                    ? "bg-[#7c4dff] font-semibold text-white"
                    : inMonth
                      ? "text-slate-800 hover:bg-[#f6f0ff]"
                      : "text-slate-300 hover:bg-slate-50"
                }`}
              >
                {date.d}
                {count > 0 && (
                  <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-[#7c4dff]"}`} />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">Pulsa un día para filtrar. Las horas se muestran en España.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            {selectedKey ? "Reuniones del día" : "Tus reuniones"}
          </h2>
          {selectedKey && (
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-xs font-semibold text-[#5b34d6]"
            >
              Ver todas
            </button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando calendario…</p>
        ) : visible.length === 0 && pending.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-500">
            Todavía no hay reuniones. Cuando reserves con tu agente, aparecerán aquí y podrás añadirlas a tu calendario personal.
          </p>
        ) : (
          <ul className="space-y-3">
            {(selectedKey ? visible : [...pending, ...visible.filter((meeting) => meeting.startsAt)]).map((meeting) => (
              <li key={meeting.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {meeting.startsAt ? formatMeetingWhen(meeting.startsAt) : "Hora por confirmar"}
                  {" · "}
                  {meeting.agentName}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {meeting.startsAt && (
                    <a
                      href={`/api/me/meetings/${meeting.id}/ics`}
                      className="rounded-lg bg-[#7c4dff] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Añadir a mi calendario
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(meeting.id);
                      setWhen("");
                      setError(null);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {meeting.startsAt ? "Corregir hora" : "Indicar hora"}
                  </button>
                </div>
                {editingId === meeting.id && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="datetime-local"
                      value={when}
                      onChange={(event) => setWhen(event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={!when}
                      onClick={() => void saveTime(meeting.id)}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>
    </div>
  );
}
