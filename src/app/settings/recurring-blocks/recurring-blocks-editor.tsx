"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSessionRecurrence,
  deleteSessionRecurrence,
} from "@/app/actions/session-recurrences";
import type {
  SessionRecurrenceRow,
  SessionTypeRow,
  TrackRow,
} from "@/lib/types";
import type { TemplateWithTodos } from "@/lib/data/session-templates";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RecurringBlocksEditor({
  recurrences,
  sessionTypes,
  templates,
  tracks,
}: {
  recurrences: SessionRecurrenceRow[];
  sessionTypes: SessionTypeRow[];
  templates: TemplateWithTodos[];
  tracks: TrackRow[];
}) {
  const router = useRouter();
  const [, startTx] = useTransition();
  const [adding, setAdding] = useState(false);
  const [weekday, setWeekday] = useState<string>("1");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [sessionTypeId, setSessionTypeId] = useState<string>("");
  const [templateId, setTemplateId] = useState<string>("");
  const [trackId, setTrackId] = useState<string>("");

  const typeName = (id: string | null) =>
    id ? sessionTypes.find((t) => t.id === id)?.name ?? "—" : "—";
  const trackName = (id: string | null) =>
    id ? tracks.find((t) => t.id === id)?.name ?? "—" : "—";

  return (
    <div className="flex flex-col gap-3">
      {recurrences.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No recurring blocks yet.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {recurrences.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">
                {WEEKDAY_LABELS[r.weekday]} · {r.start_time.slice(0, 5)} ·{" "}
                {r.duration_minutes}m
              </span>
              <span className="text-xs text-muted-foreground">
                {typeName(r.session_type_id)} · {trackName(r.track_id)}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!confirm("Delete this recurring block?")) return;
                startTx(async () => {
                  await deleteSessionRecurrence(r.id);
                  router.refresh();
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Weekday</Label>
              <Select value={weekday} onValueChange={setWeekday}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAY_LABELS.map((d, i) => (
                    <SelectItem key={d} value={String(i)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dur">Duration (min)</Label>
              <Input
                id="dur"
                inputMode="numeric"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value.replace(/[^0-9]/g, ""))
                }
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Session type</Label>
              <Select value={sessionTypeId} onValueChange={setSessionTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Track</Label>
              <Select value={trackId} onValueChange={setTrackId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                startTx(async () => {
                  await createSessionRecurrence({
                    weekday: parseInt(weekday, 10),
                    startTime,
                    durationMinutes: parseInt(duration, 10),
                    sessionTypeId: sessionTypeId || null,
                    templateId: templateId || null,
                    trackId: trackId || null,
                  });
                  setAdding(false);
                  router.refresh();
                })
              }
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          New recurring block
        </Button>
      )}
    </div>
  );
}
