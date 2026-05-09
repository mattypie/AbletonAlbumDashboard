import { addDays, format, startOfWeek as dfStartOfWeek } from "date-fns";

// Monday-anchored week start. Calendar planning revolves around weekly cadence.
export function startOfWeekMonday(d: Date): Date {
  return dfStartOfWeek(d, { weekStartsOn: 1 });
}

export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function parseWeekParam(s: string | undefined): Date {
  if (!s) return startOfWeekMonday(new Date());
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return startOfWeekMonday(new Date());
  const d = new Date(
    parseInt(m[1], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10),
  );
  return startOfWeekMonday(d);
}

export function parseDayParam(s: string | undefined): Date {
  if (!s) return new Date();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date();
  return new Date(
    parseInt(m[1], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10),
  );
}

// 6am-1am render window. Sessions outside still render but get clamped/scrolled.
export const CALENDAR_DAY_START_HOUR = 6;
export const CALENDAR_DAY_END_HOUR = 25; // 1am next day
export const CALENDAR_HOUR_HEIGHT_PX = 48;

export function minutesFromDayStart(d: Date, dayAnchor: Date): number {
  const anchorStart = new Date(dayAnchor);
  anchorStart.setHours(0, 0, 0, 0);
  return (d.getTime() - anchorStart.getTime()) / 60000;
}
