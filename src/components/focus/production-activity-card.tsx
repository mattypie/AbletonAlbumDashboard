"use client";

import { useState } from "react";
import { Minus, Plus, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProductionActivity } from "@/lib/production-activities";

const STEP = 5;

/**
 * One production activity: icon + label, an editable minutes value with
 * +/- 5-minute steppers, and an expandable per-activity note.
 */
export function ProductionActivityCard({
  activity,
  minutes,
  note,
  onMinutesChange,
  onNoteChange,
}: {
  activity: ProductionActivity;
  minutes: number;
  note: string;
  onMinutesChange: (next: number) => void;
  onNoteChange: (next: string) => void;
}) {
  const Icon = activity.icon;
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(minutes ? String(minutes) : "");

  // Keep the manual-entry draft in sync when steppers change the value.
  const display = draft !== "" && Number(draft) === minutes ? draft : String(minutes);

  const commitDraft = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    setDraft(cleaned);
    const next = cleaned === "" ? 0 : parseInt(cleaned, 10);
    onMinutesChange(next);
  };

  const showNote = editingNote || note.trim().length > 0;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-3 text-center shadow-sm">
      <div
        className={cn(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg",
          activity.iconClassName,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="mt-2 text-xs font-medium leading-tight">
        {activity.label}
      </div>

      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Subtract ${STEP} minutes from ${activity.label}`}
          onClick={() => {
            const next = Math.max(0, minutes - STEP);
            setDraft(next ? String(next) : "");
            onMinutesChange(next);
          }}
          disabled={minutes <= 0}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>

        <label className="flex min-w-0 flex-1 items-baseline justify-center">
          <input
            inputMode="numeric"
            aria-label={`Minutes for ${activity.label}`}
            value={display}
            onChange={(e) => commitDraft(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="0"
            className="w-full min-w-0 bg-transparent text-center text-base font-semibold tabular-nums outline-none"
          />
          <span className="text-sm font-semibold text-muted-foreground">m</span>
        </label>

        <button
          type="button"
          aria-label={`Add ${STEP} minutes to ${activity.label}`}
          onClick={() => {
            const next = minutes + STEP;
            setDraft(String(next));
            onMinutesChange(next);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 border-t border-border pt-2 text-left">
        {showNote ? (
          <Textarea
            autoFocus={editingNote && note.length === 0}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            onBlur={() => setEditingNote(false)}
            rows={2}
            placeholder="Add note…"
            className="min-h-0 resize-none border-0 bg-transparent p-0 text-xs leading-snug shadow-none focus-visible:ring-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <StickyNote className="h-3.5 w-3.5" aria-hidden />
            Add note…
          </button>
        )}
      </div>
    </div>
  );
}
