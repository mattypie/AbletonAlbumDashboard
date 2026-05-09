import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type {
  CalendarSessionRow,
  SessionRow,
  SessionTodoRow,
  SessionTypeRow,
} from "@/lib/types";

type RawSession = SessionRow & {
  session_type: SessionTypeRow | null;
  track: { id: string; name: string; cover_image_url: string | null } | null;
};

// Sessions whose [start, end] intersects the [from, to] window.
// "start" is planned_start when set, otherwise started_at.
async function querySessionsInRange(
  from: Date,
  to: Date,
): Promise<CalendarSessionRow[]> {
  const supabase = getServerSupabase();
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      session_type:session_types(*),
      track:tracks!sessions_track_id_fkey(id, name, cover_image_url, owner_id)
      `,
    )
    .or(
      `and(planned_start.gte.${fromIso},planned_start.lt.${toIso}),and(planned_start.is.null,started_at.gte.${fromIso},started_at.lt.${toIso})`,
    )
    .order("planned_start", { ascending: true, nullsFirst: false })
    .order("started_at", { ascending: true, nullsFirst: false });

  if (error) throw error;
  const rows = (data ?? []) as unknown as RawSession[];

  const ownerFiltered = rows.filter((r) => {
    if (!r.track) return true;
    const t = r.track as unknown as { owner_id?: string };
    return t.owner_id === OWNER_ID;
  });

  if (ownerFiltered.length === 0) return [];

  const ids = ownerFiltered.map((r) => r.id);
  const { data: todoData, error: todoError } = await supabase
    .from("session_todos")
    .select("*")
    .in("session_id", ids)
    .order("sort_order", { ascending: true });
  if (todoError) throw todoError;

  const todosBySession = new Map<string, SessionTodoRow[]>();
  (todoData ?? []).forEach((t) => {
    const list = todosBySession.get(t.session_id) ?? [];
    list.push(t);
    todosBySession.set(t.session_id, list);
  });

  return ownerFiltered.map((r) => ({
    ...(r as SessionRow),
    session_type: r.session_type,
    track: r.track
      ? { id: r.track.id, name: r.track.name, cover_image_url: r.track.cover_image_url }
      : null,
    todos: todosBySession.get(r.id) ?? [],
  }));
}

export function getSessionsInRange(from: Date, to: Date) {
  return querySessionsInRange(from, to);
}

export async function getSessionWithTodos(
  id: string,
): Promise<CalendarSessionRow | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      session_type:session_types(*),
      track:tracks!sessions_track_id_fkey(id, name, cover_image_url)
      `,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: todos, error: todoErr } = await supabase
    .from("session_todos")
    .select("*")
    .eq("session_id", id)
    .order("sort_order", { ascending: true });
  if (todoErr) throw todoErr;

  const raw = data as unknown as RawSession;
  return {
    ...(raw as SessionRow),
    session_type: raw.session_type,
    track: raw.track
      ? {
          id: raw.track.id,
          name: raw.track.name,
          cover_image_url: raw.track.cover_image_url,
        }
      : null,
    todos: todos ?? [],
  };
}
