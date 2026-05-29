"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMinutesPlain } from "@/lib/utils";

/**
 * Top "Session Overview" card: when the session started, the total tracked
 * timer duration, and a secondary/destructive action to end or discard.
 */
export function SessionOverviewCard({
  startedAt,
  durationMinutes,
  onEnd,
  ended,
}: {
  startedAt: Date | null;
  durationMinutes: number;
  onEnd: () => void;
  ended?: boolean;
}) {
  const startedLabel = startedAt
    ? formatStarted(startedAt)
    : "—";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold">Session Overview</h2>
        <Button variant="outline" size="sm" className="text-danger" onClick={onEnd}>
          {ended ? "Discard" : "End Session"}
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat
          label="Started"
          value={startedLabel}
        />
        <Stat
          label="Total Time"
          value={formatMinutesPlain(durationMinutes)}
        />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 text-primary" aria-hidden />
        {label}
      </div>
      <div className="text-base font-medium tabular-nums">{value}</div>
    </div>
  );
}

function formatStarted(d: Date): string {
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return sameDay ? `Today, ${time}` : `${d.toLocaleDateString()}, ${time}`;
}
