"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type { Database } from "@/lib/database.types";

type SessionTemplateUpdate =
  Database["public"]["Tables"]["session_templates"]["Update"];

const REVALIDATE = () => {
  revalidatePath("/calendar");
  revalidatePath("/templates");
  revalidatePath("/settings/session-templates");
};

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(60),
  sessionTypeId: z.string().uuid().nullable().optional(),
  defaultDurationMinutes: z.number().int().min(5).max(720),
  defaultNotesMd: z.string().max(10000).optional().nullable(),
  todos: z.array(z.string().min(1).max(500)).optional(),
});

export async function createSessionTemplate(input: {
  name: string;
  sessionTypeId?: string | null;
  defaultDurationMinutes: number;
  defaultNotesMd?: string | null;
  todos?: string[];
}) {
  const parsed = upsertSchema.parse(input);
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("session_templates")
    .insert({
      owner_id: OWNER_ID,
      name: parsed.name,
      session_type_id: parsed.sessionTypeId ?? null,
      default_duration_minutes: parsed.defaultDurationMinutes,
      default_notes_md: parsed.defaultNotesMd ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;

  const todos = (parsed.todos ?? []).filter((t) => t.trim().length > 0);
  if (todos.length > 0) {
    const { error: tErr } = await supabase
      .from("session_template_todos")
      .insert(
        todos.map((description, i) => ({
          template_id: data.id,
          description,
          sort_order: i,
        })),
      );
    if (tErr) throw tErr;
  }

  REVALIDATE();
  return { id: data.id };
}

export async function updateSessionTemplate(input: {
  id: string;
  name?: string;
  sessionTypeId?: string | null;
  defaultDurationMinutes?: number;
  defaultNotesMd?: string | null;
  todos?: string[];
}) {
  const supabase = getServerSupabase();
  const update: SessionTemplateUpdate = {};
  if (input.name) update.name = input.name;
  if (input.sessionTypeId !== undefined)
    update.session_type_id = input.sessionTypeId;
  if (input.defaultDurationMinutes)
    update.default_duration_minutes = input.defaultDurationMinutes;
  if (input.defaultNotesMd !== undefined)
    update.default_notes_md = input.defaultNotesMd;

  const { error } = await supabase
    .from("session_templates")
    .update(update)
    .eq("id", input.id)
    .eq("owner_id", OWNER_ID);
  if (error) throw error;

  if (input.todos !== undefined) {
    const cleaned = input.todos
      .map((d) => d.trim())
      .filter((d) => d.length > 0);
    await supabase
      .from("session_template_todos")
      .delete()
      .eq("template_id", input.id);
    if (cleaned.length > 0) {
      await supabase.from("session_template_todos").insert(
        cleaned.map((description, i) => ({
          template_id: input.id,
          description,
          sort_order: i,
        })),
      );
    }
  }

  REVALIDATE();
}

export async function deleteSessionTemplate(id: string) {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("session_templates")
    .delete()
    .eq("id", id)
    .eq("owner_id", OWNER_ID);
  if (error) throw error;
  REVALIDATE();
}

const instantiateSchema = z.object({
  templateId: z.string().uuid(),
  plannedStart: z.string(),
  trackId: z.string().uuid().nullable().optional(),
});

export async function instantiateTemplate(input: {
  templateId: string;
  plannedStart: string;
  trackId?: string | null;
}): Promise<{ id: string }> {
  const parsed = instantiateSchema.parse(input);
  const supabase = getServerSupabase();

  const { data: template, error: tErr } = await supabase
    .from("session_templates")
    .select("*")
    .eq("id", parsed.templateId)
    .eq("owner_id", OWNER_ID)
    .single();
  if (tErr) throw tErr;

  const start = new Date(parsed.plannedStart);
  const end = new Date(
    start.getTime() + template.default_duration_minutes * 60_000,
  );

  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .insert({
      track_id: parsed.trackId ?? null,
      session_type_id: template.session_type_id,
      template_id: template.id,
      planned_start: start.toISOString(),
      planned_end: end.toISOString(),
      notes_md: template.default_notes_md,
      status: "planned",
    })
    .select("id")
    .single();
  if (sErr) throw sErr;

  const { data: tplTodos } = await supabase
    .from("session_template_todos")
    .select("description, sort_order")
    .eq("template_id", template.id)
    .order("sort_order", { ascending: true });
  if (tplTodos && tplTodos.length > 0) {
    await supabase.from("session_todos").insert(
      tplTodos.map((t) => ({
        session_id: session.id,
        description: t.description,
        sort_order: t.sort_order,
      })),
    );
  }

  REVALIDATE();
  return { id: session.id };
}
