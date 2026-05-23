"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pause, Play, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SessionLogDialog,
  type SessionDraft,
} from "@/components/session-log-dialog";
import { SessionCompleteDialog } from "@/components/calendar/session-complete-dialog";
import { SessionTodoChecklist } from "@/components/calendar/session-todo-checklist";
import { useFocusSession } from "@/components/focus-session-provider";
import type {
  ActionRow,
  CalendarSessionRow,
  SessionTypeRow,
  TrackRow,
} from "@/lib/types";

export function FocusRunner({
  track,
  primaryAction,
  plannedSession,
  sessionTypes,
  tracks,
  trackTodos,
}: {
  track: TrackRow;
  primaryAction: ActionRow | null;
  plannedSession?: CalendarSessionRow | null;
  sessionTypes?: SessionTypeRow[];
  tracks?: TrackRow[];
  trackTodos?: ActionRow[];
}) {
  const router = useRouter();
  const ctx = useFocusSession();
  const [logOpen, setLogOpen] = useState(false);

  const isOtherTrackActive =
    (ctx.phase === "running" || ctx.phase === "paused") &&
    ctx.trackId != null &&
    ctx.trackId !== track.id;

  const isSameTrack = ctx.trackId === track.id;

  // Open the log dialog automatically the moment a session stops for this track.
  useEffect(() => {
    if (isSameTrack && ctx.phase === "stopped") {
      /* eslint-disable react-hooks/set-state-in-effect */
      setLogOpen(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [isSameTrack, ctx.phase]);

  if (isOtherTrackActive) {
    return (
      <ActiveElsewhereNotice
        activeTrackName={ctx.trackName}
        onReturn={() => router.push(`/focus/${ctx.trackId}`)}
        onStopAndLog={() => {
          const target = `/focus/${ctx.trackId}`;
          ctx.stop();
          router.push(target);
        }}
      />
    );
  }

  const phase = isSameTrack ? ctx.phase : "idle";
  const elapsedMs = isSameTrack ? ctx.elapsedMs : 0;
  const todos = isSameTrack ? ctx.todos : [];
  const notes = isSameTrack ? ctx.notes : "";

  const start = () => {
    const plannedTodos = (plannedSession?.todos ?? []).map((t) => ({
      id: t.id,
      description: t.description,
      done: t.done,
    }));
    // No planned session (or it has no todos) — seed the checklist from the
    // track's own open to-dos so the session doesn't start blank.
    const initialTodos =
      plannedTodos.length > 0
        ? plannedTodos
        : (trackTodos ?? []).map((t) => ({
            id: t.id,
            description: t.description,
            done: t.completed_at != null,
          }));
    ctx.start({
      trackId: track.id,
      trackName: track.name,
      plannedSessionId: plannedSession?.id ?? null,
      initialTodos,
    });
  };

  const draft: SessionDraft | null =
    phase === "stopped"
      ? (() => {
          const totalMs = ctx.accumulatedMs;
          const ended = new Date();
          const started = new Date(ended.getTime() - totalMs);
          return {
            startedAt: started.toISOString(),
            endedAt: ended.toISOString(),
            durationSeconds: Math.round(totalMs / 1000),
          };
        })()
      : null;

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
            onChange={ctx.setTodos}
            placeholder="Add a todo for this session…"
          />
        </div>
        <div className="mx-auto mt-1 w-full max-w-md text-left">
          <Label htmlFor="focus-notes" className="text-xs text-muted-foreground">
            Session notes
          </Label>
          <Textarea
            id="focus-notes"
            value={notes}
            onChange={(e) => ctx.setNotes(e.target.value)}
            rows={3}
            placeholder="Jot ideas, blockers, or thoughts as they come up…"
            className="mt-1"
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
            <Button size="lg" variant="outline" onClick={ctx.pause}>
              <Pause className="h-5 w-5" />
              Pause
            </Button>
            <Button size="lg" variant="accent" onClick={ctx.stop}>
              <Square className="h-5 w-5" />
              Stop &amp; log
            </Button>
          </>
        )}
        {phase === "paused" && (
          <>
            <Button size="lg" onClick={ctx.resume}>
              <Play className="h-5 w-5" />
              Resume
            </Button>
            <Button size="lg" variant="accent" onClick={ctx.stop}>
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
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                setLogOpen(false);
                ctx.reset();
              }}
            >
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
          initialNotes={notes}
          onCompleted={() => {
            setLogOpen(false);
            ctx.reset();
          }}
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
          notes={notes}
          onCompleted={() => {
            setLogOpen(false);
            ctx.reset();
          }}
          redirectTo="/"
        />
      )}
    </div>
  );
}

function ActiveElsewhereNotice({
  activeTrackName,
  onReturn,
  onStopAndLog,
}: {
  activeTrackName: string | null;
  onReturn: () => void;
  onStopAndLog: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Focus
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          A session is already running
        </h1>
        <p className="text-muted-foreground">
          You have an active focus session on{" "}
          <span className="font-medium text-foreground">
            {activeTrackName ?? "another track"}
          </span>
          . Return to it or stop and log it before starting a new one.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={onReturn}>
          Return to session
        </Button>
        <Button size="lg" variant="outline" onClick={onStopAndLog}>
          Stop &amp; log
        </Button>
      </div>
    </div>
  );
}

function formatHMS(totalMs: number) {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
