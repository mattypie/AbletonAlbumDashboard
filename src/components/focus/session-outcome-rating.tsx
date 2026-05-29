"use client";

import { Card } from "@/components/ui/card";
import { RatingPicker } from "@/components/ui/rating-picker";

/**
 * Compact "Session Outcome" card — two quick 1–5 rows (Progress/Impact and
 * Enjoyment) with scale-end labels. Designed for fast one-thumb input.
 */
export function SessionOutcomeRating({
  progressImpact,
  enjoyment,
  onProgressImpactChange,
  onEnjoymentChange,
}: {
  progressImpact: number | null;
  enjoyment: number | null;
  onProgressImpactChange: (v: number | null) => void;
  onEnjoymentChange: (v: number | null) => void;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Session Outcome</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        How would you rate this session?
      </p>

      <div className="mt-4 flex flex-col gap-5">
        <Row
          label="Progress / Impact"
          leftLabel="Counterproductive"
          rightLabel="Breakthrough"
          value={progressImpact}
          onChange={onProgressImpactChange}
        />
        <Row
          label="Enjoyment"
          leftLabel="Not enjoyable"
          rightLabel="Highly enjoyable"
          value={enjoyment}
          onChange={onEnjoymentChange}
        />
      </div>
    </Card>
  );
}

function Row({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <RatingPicker value={value} onChange={onChange} size="lg" />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
