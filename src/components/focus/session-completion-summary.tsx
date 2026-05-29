"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn, formatMinutesPlain } from "@/lib/utils";

/**
 * Bottom summary: total tracked vs. the session's actual duration, remaining
 * untracked time, and a completion ring. Surfaces a subtle warning with
 * Auto balance / Reset when the user allocates more than the tracked duration.
 */
export function SessionCompletionSummary({
  totalTracked,
  sessionMinutes,
  onAutoBalance,
  onReset,
}: {
  totalTracked: number;
  sessionMinutes: number;
  onAutoBalance: () => void;
  onReset: () => void;
}) {
  const untracked = sessionMinutes - totalTracked;
  const over = untracked < 0;
  const completion =
    sessionMinutes > 0
      ? Math.min(100, Math.round((totalTracked / sessionMinutes) * 100))
      : totalTracked > 0
        ? 100
        : 0;

  return (
    <Card className="p-5">
      {over && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          <span className="flex-1 min-w-0">
            You&apos;ve allocated {formatMinutesPlain(Math.abs(untracked))} more
            than the {formatMinutesPlain(sessionMinutes)} you tracked.
          </span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={onAutoBalance}>
              Auto balance
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Total Tracked Time</div>
          <div className="text-base font-semibold tabular-nums">
            {formatMinutesPlain(totalTracked)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Untracked Time</div>
          <div
            className={cn(
              "text-base font-semibold tabular-nums",
              over ? "text-danger" : "text-primary",
            )}
          >
            {formatMinutesPlain(Math.abs(untracked))}
            {over ? " over" : ""}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-muted-foreground">Completion</div>
          <ProgressRing value={completion} size={48} stroke={5} />
        </div>
      </div>
    </Card>
  );
}
