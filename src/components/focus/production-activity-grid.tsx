"use client";

import { ProductionActivityCard } from "./production-activity-card";
import {
  PRODUCTION_ACTIVITIES,
  type ProductionActivityKey,
} from "@/lib/production-activities";

export type ActivityState = Record<
  ProductionActivityKey,
  { minutes: number; note: string }
>;

/**
 * 3-column responsive grid of the nine production activities, matching the
 * mockup. Pure controlled component — all state lives in the parent.
 */
export function ProductionActivityGrid({
  values,
  onChange,
}: {
  values: ActivityState;
  onChange: (
    key: ProductionActivityKey,
    patch: Partial<{ minutes: number; note: string }>,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {PRODUCTION_ACTIVITIES.map((activity) => {
        const v = values[activity.key];
        return (
          <ProductionActivityCard
            key={activity.key}
            activity={activity}
            minutes={v.minutes}
            note={v.note}
            onMinutesChange={(minutes) => onChange(activity.key, { minutes })}
            onNoteChange={(note) => onChange(activity.key, { note })}
          />
        );
      })}
    </div>
  );
}
