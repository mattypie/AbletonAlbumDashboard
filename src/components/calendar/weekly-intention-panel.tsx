"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { upsertWeeklyReview } from "@/app/actions/weekly-reviews";
import { isoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function WeeklyIntentionPanel({
  weekStart,
  initialIntention,
  initialReflection,
}: {
  weekStart: Date;
  initialIntention: string;
  initialReflection: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <PanelField
        label="Weekly intention"
        hint="What do you want this week to feel like?"
        value={initialIntention}
        weekStart={weekStart}
        field="intention"
        accent="primary"
      />
      <PanelField
        label="End-of-week reflection"
        hint="What worked? What will you change next week?"
        value={initialReflection}
        weekStart={weekStart}
        field="reflection"
        accent="accent"
      />
    </div>
  );
}

function PanelField({
  label,
  hint,
  value: initialValue,
  weekStart,
  field,
  accent,
}: {
  label: string;
  hint: string;
  value: string;
  weekStart: Date;
  field: "intention" | "reflection";
  accent: "primary" | "accent";
}) {
  const [value, setValue] = useState(initialValue);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [, startTx] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Sync local form value when fresh server data arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (value === initialValue) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startTx(async () => {
        await upsertWeeklyReview({
          weekStart: isoDate(weekStart),
          [field]: value,
        });
        setSavedAt(Date.now());
      });
    }, 800);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, initialValue, weekStart, field]);

  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles
            className={cn(
              "h-3.5 w-3.5",
              accent === "primary" ? "text-primary" : "text-accent",
            )}
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {savedAt && (
          <span className="text-[10px] text-muted-foreground">Saved</span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder={hint}
        className="resize-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
