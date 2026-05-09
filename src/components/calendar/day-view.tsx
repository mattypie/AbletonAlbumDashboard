"use client";

import { format, isSameDay } from "date-fns";
import { SessionBlock } from "./session-block";
import {
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_HOUR_HEIGHT_PX,
} from "@/lib/dates";
import type { CalendarSessionRow } from "@/lib/types";

const HOUR_RANGE = Array.from(
  { length: CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR },
  (_, i) => CALENDAR_DAY_START_HOUR + i,
);

export function DayView({
  day,
  sessions,
  onCreateSlot,
  onSelectSession,
}: {
  day: Date;
  sessions: CalendarSessionRow[];
  onCreateSlot: (start: Date, end: Date) => void;
  onSelectSession: (session: CalendarSessionRow) => void;
}) {
  const totalHeight =
    (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) *
    CALENDAR_HOUR_HEIGHT_PX;

  const filtered = sessions.filter((s) => {
    const start = s.planned_start ?? s.started_at;
    return start && isSameDay(new Date(start), day);
  });

  const handleClick = (ev: React.MouseEvent) => {
    const target = ev.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const offsetY = ev.clientY - rect.top;
    const hourFrac = offsetY / CALENDAR_HOUR_HEIGHT_PX;
    const totalMinutes = (CALENDAR_DAY_START_HOUR + hourFrac) * 60;
    const snapped = Math.round(totalMinutes / 30) * 30;
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(snapped);
    const end = new Date(start.getTime() + 60 * 60_000);
    onCreateSlot(start, end);
  };

  return (
    <div className="overflow-x-auto">
      <div
        className="grid border border-border bg-surface"
        style={{ gridTemplateColumns: "60px 1fr" }}
      >
        <div className="border-b border-r border-border bg-surface-2 px-2 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          Hour
        </div>
        <div className="border-b border-border bg-surface-2 px-3 py-2 text-sm font-medium">
          {format(day, "EEEE, MMM d")}
        </div>

        <div
          className="relative border-r border-border"
          style={{ height: totalHeight }}
        >
          {HOUR_RANGE.map((hour) => (
            <div
              key={hour}
              className="border-b border-border/40 px-1.5 pt-0.5 text-[10px] text-muted-foreground"
              style={{ height: CALENDAR_HOUR_HEIGHT_PX }}
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        <div
          className="relative"
          style={{ height: totalHeight }}
          onClick={handleClick}
        >
          {HOUR_RANGE.map((hour) => (
            <div
              key={hour}
              className="border-b border-border/40 hover:bg-surface-2/50"
              style={{ height: CALENDAR_HOUR_HEIGHT_PX }}
            />
          ))}
          {filtered.map((s) => {
            const start = new Date(s.planned_start ?? s.started_at!);
            const end = new Date(
              s.planned_end ?? s.ended_at ?? start.getTime() + 30 * 60_000,
            );
            const startMin = start.getHours() * 60 + start.getMinutes();
            const endMin = end.getHours() * 60 + end.getMinutes();
            const top =
              ((startMin - CALENDAR_DAY_START_HOUR * 60) / 60) *
              CALENDAR_HOUR_HEIGHT_PX;
            const height = Math.max(
              24,
              ((endMin - startMin) / 60) * CALENDAR_HOUR_HEIGHT_PX - 2,
            );
            return (
              <div
                key={s.id}
                className="absolute left-1 right-1"
                style={{ top, height }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSession(s);
                }}
              >
                <SessionBlock session={s} className="h-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatHourLabel(hour: number) {
  const normalized = hour >= 24 ? hour - 24 : hour;
  if (normalized === 0) return "12a";
  if (normalized === 12) return "12p";
  if (normalized < 12) return `${normalized}a`;
  return `${normalized - 12}p`;
}
