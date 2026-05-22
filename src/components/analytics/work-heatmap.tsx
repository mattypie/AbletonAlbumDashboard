"use client";

import { cn, formatDuration } from "@/lib/utils";
import { getHeatmapIntensity, toDayKey } from "@/lib/analytics";

const INTENSITY_CLASSES = [
  "bg-surface-2",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const;

const WEEKDAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type Cell = { key: string; date: Date; inRange: boolean; seconds: number };

function buildWeeks(
  startDate: Date,
  endDate: Date,
  dailyMap: Map<string, number>,
): Cell[][] {
  // Pad back to the Monday on or before the start date.
  const gridStart = new Date(startDate);
  gridStart.setHours(0, 0, 0, 0);
  const startOffset = (gridStart.getDay() + 6) % 7; // Mon=0
  gridStart.setDate(gridStart.getDate() - startOffset);

  const last = new Date(endDate);
  last.setHours(0, 0, 0, 0);

  const weeks: Cell[][] = [];
  const cursor = new Date(gridStart);
  let week: Cell[] = [];
  while (cursor <= last || week.length > 0) {
    const key = toDayKey(cursor);
    const inRange = cursor >= startDate && cursor <= last;
    week.push({
      key,
      date: new Date(cursor),
      inRange,
      seconds: inRange ? (dailyMap.get(key) ?? 0) : 0,
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
      if (cursor > last) break;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ key: `pad-${week.length}`, date: new Date(0), inRange: false, seconds: 0 });
    }
    weeks.push(week);
  }
  return weeks;
}

export function WorkHeatmap({
  dailyMap,
  startDate,
  endDate,
}: {
  dailyMap: Map<string, number>;
  startDate: Date;
  endDate: Date;
}) {
  const weeks = buildWeeks(startDate, endDate, dailyMap);

  // Month label appears on the first week-column whose first in-range day is a new month.
  const monthLabels: string[] = [];
  let lastMonth = -1;
  for (const week of weeks) {
    const firstInRange = week.find((c) => c.inRange);
    if (!firstInRange) {
      monthLabels.push("");
      continue;
    }
    const m = firstInRange.date.getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthLabels.push(MONTH_NAMES[m]);
    } else {
      monthLabels.push("");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Month labels row, aligned to the week columns (offset by the weekday gutter). */}
      <div className="flex gap-[3px] pl-7 text-[10px] text-muted-foreground">
        {monthLabels.map((label, i) => (
          <div key={i} className="min-w-0 flex-1 text-left">
            {label}
          </div>
        ))}
      </div>

      <div className="flex gap-[3px]">
        {/* Weekday gutter */}
        <div className="flex w-6 shrink-0 flex-col gap-[3px] text-[10px] text-muted-foreground">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="flex aspect-square items-center">
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
            {week.map((cell) => {
              if (!cell.inRange) {
                return (
                  <div
                    key={cell.key}
                    className="aspect-square rounded-[2px] bg-transparent"
                  />
                );
              }
              const minutes = cell.seconds / 60;
              const intensity = getHeatmapIntensity(minutes);
              return (
                <div
                  key={cell.key}
                  title={`${cell.key}: ${cell.seconds > 0 ? formatDuration(cell.seconds) : "no work"}`}
                  className={cn(
                    "aspect-square rounded-[2px]",
                    INTENSITY_CLASSES[intensity],
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span>Less</span>
      {INTENSITY_CLASSES.map((cls, i) => (
        <span key={i} className={cn("h-3 w-3 rounded-[2px]", cls)} />
      ))}
      <span>More</span>
    </div>
  );
}
