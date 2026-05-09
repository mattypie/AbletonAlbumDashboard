"use client";

import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarSessionRow } from "@/lib/types";

export function MonthView({
  monthAnchor,
  sessions,
  onSelectSession,
  onCreateSlot,
}: {
  monthAnchor: Date;
  sessions: CalendarSessionRow[];
  onSelectSession: (s: CalendarSessionRow) => void;
  onCreateSlot: (start: Date, end: Date) => void;
}) {
  const monthStart = startOfMonth(monthAnchor);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const byDay = new Map<string, CalendarSessionRow[]>();
  sessions.forEach((s) => {
    const start = s.planned_start ?? s.started_at;
    if (!start) return;
    const key = format(new Date(start), "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(s);
    byDay.set(key, list);
  });

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="grid grid-cols-7 gap-1 text-xs uppercase tracking-wide text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-2 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, monthStart);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                const start = new Date(day);
                start.setHours(9, 0, 0, 0);
                const end = new Date(start.getTime() + 60 * 60_000);
                onCreateSlot(start, end);
              }}
              className={cn(
                "flex min-h-28 flex-col gap-1 rounded-md border p-2 text-left text-xs transition-colors",
                inMonth
                  ? "border-border bg-surface hover:bg-surface-2"
                  : "border-border/40 bg-surface/40 text-muted-foreground",
                isToday(day) && "ring-1 ring-primary",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{format(day, "d")}</span>
                {dayItems.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {dayItems.length}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-0.5">
                {dayItems.slice(0, 3).map((s) => (
                  <li
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(s);
                    }}
                    className="truncate rounded-sm px-1.5 py-0.5"
                    style={{
                      backgroundColor: hexWithAlpha(
                        s.session_type?.color ?? "#9E9E9E",
                        0.22,
                      ),
                      borderLeft: `2px solid ${s.session_type?.color ?? "#9E9E9E"}`,
                    }}
                  >
                    {s.session_type?.name ?? "Session"}
                    {s.track ? ` · ${s.track.name}` : ""}
                  </li>
                ))}
                {dayItems.length > 3 && (
                  <li className="text-muted-foreground">
                    +{dayItems.length - 3} more
                  </li>
                )}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hexWithAlpha(hex: string, alpha: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
