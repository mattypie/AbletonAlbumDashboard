"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SessionLogDialog,
  type SessionDraft,
} from "@/components/session-log-dialog";
import { SessionCompleteDialog } from "@/components/calendar/session-complete-dialog";
import {
  SessionTodoChecklist,
  type ChecklistItem,
} from "@/components/calendar/session-todo-checklist";
import type {
  ActionRow,
  CalendarSessionRow,
  SessionTypeRow,
  TrackRow,
} from "@/lib/types";

type Phase = "idle" | "running" | "paused" | "stopped";

export function FocusRunner({
  track,
  primaryAction,
  plannedSession,
  sessionTypes,
  tracks,
}: {
  track: TrackRow;
  primaryAction: ActionRow | null;
  plannedSession?: CalendarSessionRow | null;
  sessionTypes?: SessionTypeRow[];
  tracks?: TrackRow[];
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [todos, setTodos] = useState<ChecklistItem[]>(() =>
    (plannedSession?.todos ?? []).map((t) => ({
      id: t.id,
      description: t.description,
      done: t.done,
    })),
  );
  const startedAtRef = useRef<number | null>(null);
  const accumRef = useRef(0);

  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => {
      const startedAt = startedAtRef.current ?? Date.now();
      setElapsedMs(accumRef.current + (Date.now() - startedAt));
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    startedAtRef.current = Date.now();
    setPhase("running");
  };

  const pause = () => {
    if (phase !== "running") return;
    accumRef.current += Date.now() - (startedAtRef.current ?? Date.now());
    startedAtRef.current = null;
    setPhase("paused");
  };

  const resume = () => {
    startedAtRef.current = Date.now();
    setPhase("running");
  };

  const stop = () => {
    if (phase === "running") {
      accumRef.current += Date.now() - (startedAtRef.current ?? Date.now());
    }
    const totalMs = accumRef.current;
    const ended = new Date();
    const started = new Date(ended.getTime() - totalMs);
    setDraft({
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      durationSeconds: Math.round(totalMs / 1000),
    });
    setLogOpen(true);
    setPhase("stopped");
  };

  const reset = () => {
    accumRef.current = 0;
    startedAtRef.current = null;
    setElapsedMs(0);
    setPhase("idle");
    setDraft(null);
  };

  const useEnhancedDialog = !!plannedSession && !!sessionTypes && !!tracks;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10 text-center">
      <div className="flex w-full justify-start">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/tracks/${track.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to track
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {plannedSession?.session_type?.name ?? "Focus"}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{track.name}</h1>
        <p className="text-lg text-muted-foreground">
          {primaryAction
            ? primaryAction.description
            : "No primary action — set one to anchor the session."}
        </p>
        <div className="mx-auto mt-2 w-full max-w-md text-left">
          <SessionTodoChecklist
            items={todos}
            onChange={setTodos}
            placeholder="Add a todo for this session…"
          />
        </div>
      </div>

      <div className="font-mono text-7xl tabular-nums">
        {formatHMS(elapsedMs)}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {phase === "idle" && (
          <Button size="lg" onClick={start}>
            <Play className="h-5 w-5" />
            Start session
          </Button>
        )}
        {phase === "running" && (
          <>
            <Button size="lg" variant="outline" onClick={pause}>
              <Pause className="h-5 w-5" />
              Pause
            </Button>
            <Button size="lg" variant="accent" onClick={stop}>
              <Square className="h-5 w-5" />
              Stop &amp; log
            </Button>
          </>
        )}
        {phase === "paused" && (
          <>
            <Button size="lg" onClick={resume}>
              <Play className="h-5 w-5" />
              Resume
            </Button>
            <Button size="lg" variant="accent" onClick={stop}>
              <Square className="h-5 w-5" />
              Stop &amp; log
            </Button>
          </>
        )}
        {phase === "stopped" && (
          <>
            <Button size="lg" variant="outline" onClick={() => setLogOpen(true)}>
              <Check className="h-5 w-5" />
              Open log
            </Button>
            <Button size="lg" variant="ghost" onClick={reset}>
              Reset
            </Button>
          </>
        )}
      </div>

      {useEnhancedDialog ? (
        <SessionCompleteDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          session={plannedSession ?? null}
          draft={draft}
          sessionTypes={sessionTypes!}
          tracks={tracks!}
          initialTodos={todos}
          redirectTo="/calendar"
        />
      ) : (
        <SessionLogDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          trackId={track.id}
          primaryAction={primaryAction}
          draft={draft}
          todos={todos}
          redirectTo="/"
        />
      )}
    </div>
  );
}

function formatHMS(totalMs: number) {
  const totalSeconds = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
