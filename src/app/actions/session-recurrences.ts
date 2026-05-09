"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import { addDays, format } from "date-fns";
import { startOfWeekMonday } from "@/lib/dates";

const REVALIDATE = () => {
  revalidatePath("/calendar");
  revalidatePath("/settings/recurring-blocks");
};

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  templateId: z.string().uuid().nullable().optional(),
  sessionTypeId: z.string().uuid().nullable().optional(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  durationMinutes: z.number().int().min(5).max(720),
  trackId: z.string().uuid().nullable().optional(),
  activeFrom: z.string().optional(),
  activeUntil: z.string().nullable().optional(),
});

export async function createSessionRecurrence(input: {
  templateId?: string | null;
  sessionTypeId?: string | null;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  trackId?: string | null;
  activeFrom?: string;
  activeUntil?: string | null;
}) {
  const parsed = upsertSchema.parse(input);
  const supabase = getServerSupabase();

  const { error } = await supabase.from("session_recurrences").insert({
    owner_id: OWNER_ID,
    template_id: parsed.templateId ?? null,
    session_type_id: parsed.sessionTypeId ?? null,
    weekday: parsed.weekday,
    start_time: parsed.startTime,
    duration_minutes: parsed.durationMinutes,
    track_id: parsed.trackId ?? null,
    active_from: parsed.activeFrom ?? new Date().toISOString().slice(0, 10),
    active_until: parsed.activeUntil ?? null,
  });
  if (error) throw error;
  REVALIDATE();
}

export async function deleteSessionRecurrence(id: string) {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("session_recurrences")
    .delete()
    .eq("id", id)
    .eq("owner_id", OWNER_ID);
  if (error) throw error;
  REVALIDATE();
}

// Materialize: for the given week, ensure each active recurrence has a planned
// session row. Idempotent thanks to the unique index on
// (recurrence_id, planned_start).
export async function materializeRecurrencesForWeek(weekStartIso: string) {
  const supabase = getServerSupabase();
  const weekStart = startOfWeekMonday(new Date(weekStartIso));

  const { data: recurrences, error } = await supabase
    .from("session_recurrences")
    .select("*")
    .eq("owner_id", OWNER_ID);
  if (error) throw error;
  if (!recurrences || recurrences.length === 0) return;

  // weekStart is Monday (date-fns weekStartsOn:1). DB weekday is 0=Sun..6=Sat.
  // Map: dayOffset 0 (Mon) -> weekday 1, ..., dayOffset 6 (Sun) -> weekday 0.
  const dbWeekdayForOffset = (offset: number) => (offset + 1) % 7;

  const inserts: Array<Record<string, unknown>> = [];
  for (const r of recurrences) {
    const activeFrom = new Date(r.active_from);
    const activeUntil = r.active_until ? new Date(r.active_until) : null;
    for (let offset = 0; offset < 7; offset++) {
      if (dbWeekdayForOffset(offset) !== r.weekday) continue;
      const day = addDays(weekStart, offset);
      if (day < activeFrom) continue;
      if (activeUntil && day > activeUntil) continue;

      const [hh, mm] = r.start_time.split(":");
      const start = new Date(day);
      start.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      const end = new Date(start.getTime() + r.duration_minutes * 60_000);

      inserts.push({
        track_id: r.track_id,
        session_type_id: r.session_type_id,
        template_id: r.template_id,
        recurrence_id: r.id,
        planned_start: start.toISOString(),
        planned_end: end.toISOString(),
        status: "planned",
      });
    }
  }

  if (inserts.length === 0) return;

  // Use upsert on the unique index. supabase-js doesn't expose a partial-index
  // upsert nicely, so attempt insert and ignore unique conflicts per-row.
  for (const row of inserts) {
    const { error: insertErr } = await supabase
      .from("sessions")
      .insert(row as never);
    if (insertErr && !/duplicate key|unique constraint/i.test(insertErr.message)) {
      throw insertErr;
    }
  }

  // Copy template todos onto newly-created sessions if any.
  // We can't tell from here which inserts succeeded, but on conflict we won't
  // duplicate todos because we only run this for materialization.
  const { data: weekSessions } = await supabase
    .from("sessions")
    .select("id, recurrence_id, planned_start, template_id")
    .gte("planned_start", weekStart.toISOString())
    .lt("planned_start", addDays(weekStart, 7).toISOString())
    .not("recurrence_id", "is", null);

  for (const s of weekSessions ?? []) {
    if (!s.template_id) continue;
    const { count } = await supabase
      .from("session_todos")
      .select("id", { count: "exact", head: true })
      .eq("session_id", s.id);
    if ((count ?? 0) > 0) continue;
    const { data: tplTodos } = await supabase
      .from("session_template_todos")
      .select("description, sort_order")
      .eq("template_id", s.template_id)
      .order("sort_order", { ascending: true });
    if (tplTodos && tplTodos.length > 0) {
      await supabase.from("session_todos").insert(
        tplTodos.map((t) => ({
          session_id: s.id,
          description: t.description,
          sort_order: t.sort_order,
        })),
      );
    }
  }

  // Touch a date to silence unused-import lint when format isn't used elsewhere.
  void format;

  REVALIDATE();
}
