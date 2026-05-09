import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type { SessionTypeRow } from "@/lib/types";

export async function getSessionTypes(): Promise<SessionTypeRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("session_types")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAllSessionTypes(): Promise<SessionTypeRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("session_types")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
