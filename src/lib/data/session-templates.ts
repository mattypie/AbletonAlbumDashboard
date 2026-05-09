import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type {
  SessionTemplateRow,
  SessionTemplateTodoRow,
} from "@/lib/types";

export type TemplateWithTodos = SessionTemplateRow & {
  todos: SessionTemplateTodoRow[];
};

export async function getSessionTemplates(): Promise<TemplateWithTodos[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("session_templates")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const templates = data ?? [];
  if (templates.length === 0) return [];

  const ids = templates.map((t) => t.id);
  const { data: todos, error: tErr } = await supabase
    .from("session_template_todos")
    .select("*")
    .in("template_id", ids)
    .order("sort_order", { ascending: true });
  if (tErr) throw tErr;

  const byTemplate = new Map<string, SessionTemplateTodoRow[]>();
  (todos ?? []).forEach((t) => {
    const list = byTemplate.get(t.template_id) ?? [];
    list.push(t);
    byTemplate.set(t.template_id, list);
  });

  return templates.map((t) => ({ ...t, todos: byTemplate.get(t.id) ?? [] }));
}

export async function getSessionTemplate(
  id: string,
): Promise<TemplateWithTodos | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("session_templates")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: todos, error: tErr } = await supabase
    .from("session_template_todos")
    .select("*")
    .eq("template_id", id)
    .order("sort_order", { ascending: true });
  if (tErr) throw tErr;

  return { ...data, todos: todos ?? [] };
}
