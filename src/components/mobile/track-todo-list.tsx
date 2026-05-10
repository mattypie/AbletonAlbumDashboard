"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  addTrackTodo,
  deleteTrackTodo,
  toggleTrackTodo,
  updateTrackTodo,
} from "@/app/actions/track-todos";
import type { ActionRow } from "@/lib/types";

type TodoItem = ActionRow & { _temp?: boolean };

type Action =
  | { kind: "add"; item: TodoItem }
  | { kind: "toggle"; id: string; done: boolean }
  | { kind: "edit"; id: string; description: string }
  | { kind: "delete"; id: string };

function reducer(state: TodoItem[], action: Action): TodoItem[] {
  switch (action.kind) {
    case "add":
      return [...state, action.item];
    case "toggle":
      return state.map((t) =>
        t.id === action.id
          ? {
              ...t,
              completed_at: action.done ? new Date().toISOString() : null,
            }
          : t,
      );
    case "edit":
      return state.map((t) =>
        t.id === action.id ? { ...t, description: action.description } : t,
      );
    case "delete":
      return state.filter((t) => t.id !== action.id);
  }
}

export function TrackTodoList({
  trackId,
  initial,
}: {
  trackId: string;
  initial: ActionRow[];
}) {
  const [optimistic, applyOptimistic] = useOptimistic<TodoItem[], Action>(
    initial,
    reducer,
  );
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submitDraft = () => {
    const description = draft.trim();
    if (!description) return;
    setDraft("");
    const tempId = `temp-${crypto.randomUUID()}`;
    startTransition(async () => {
      applyOptimistic({
        kind: "add",
        item: {
          id: tempId,
          track_id: trackId,
          description,
          category: null,
          estimated_minutes: null,
          is_primary: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          _temp: true,
        },
      });
      try {
        await addTrackTodo({ trackId, description });
      } catch (e) {
        alert((e as Error).message);
      }
    });
    inputRef.current?.focus();
  };

  const onToggle = (item: TodoItem, next: boolean) => {
    if (item._temp) return;
    startTransition(async () => {
      applyOptimistic({ kind: "toggle", id: item.id, done: next });
      try {
        await toggleTrackTodo(item.id, next, trackId);
      } catch (e) {
        alert((e as Error).message);
      }
    });
  };

  const onEdit = (item: TodoItem, description: string) => {
    const trimmed = description.trim();
    if (!trimmed || trimmed === item.description || item._temp) return;
    startTransition(async () => {
      applyOptimistic({ kind: "edit", id: item.id, description: trimmed });
      try {
        await updateTrackTodo(item.id, trimmed, trackId);
      } catch (e) {
        alert((e as Error).message);
      }
    });
  };

  const onDelete = (item: TodoItem) => {
    if (item._temp) return;
    startTransition(async () => {
      applyOptimistic({ kind: "delete", id: item.id });
      try {
        await deleteTrackTodo(item.id, trackId);
      } catch (e) {
        alert((e as Error).message);
      }
    });
  };

  const openCount = optimistic.filter((t) => t.completed_at == null).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          To-do
        </h2>
        <span className="text-xs text-muted-foreground">
          {openCount} open
        </span>
      </div>

      <form
        className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          submitDraft();
        }}
      >
        <Plus className="ml-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          className="h-11 border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0"
          enterKeyHint="done"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="sm"
          className="h-11 px-4"
          disabled={!draft.trim()}
        >
          Add
        </Button>
      </form>

      {optimistic.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">
          No tasks yet. Type one above and tap Add.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {optimistic.map((item) => (
            <TodoRow
              key={item.id}
              item={item}
              onToggle={(next) => onToggle(item, next)}
              onEdit={(desc) => onEdit(item, desc)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TodoRow({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: TodoItem;
  onToggle: (done: boolean) => void;
  onEdit: (description: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.description);
  const done = item.completed_at != null;

  const commit = () => {
    setEditing(false);
    onEdit(draft);
  };

  const cancel = () => {
    setDraft(item.description);
    setEditing(false);
  };

  return (
    <li className="flex min-h-[56px] items-center gap-3 border-b border-border/60 py-2">
      <label className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Checkbox
          checked={done}
          onCheckedChange={(v) => onToggle(v === true)}
          className="h-6 w-6"
          aria-label={done ? "Mark not done" : "Mark done"}
        />
      </label>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              cancel();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-base outline-none focus:ring-2 focus:ring-primary"
          enterKeyHint="done"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`min-w-0 flex-1 truncate rounded-md px-1 py-2 text-left text-base ${
            done ? "text-muted-foreground line-through" : ""
          }`}
        >
          {item.description}
          {item._temp && (
            <Check
              className="ml-2 inline h-3 w-3 animate-pulse text-muted-foreground"
              aria-hidden
            />
          )}
        </button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0"
        onClick={onDelete}
        aria-label="Delete task"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </li>
  );
}
