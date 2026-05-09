import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type { SessionRecurrenceRow } from "@/lib/types";

export async function getSessionRecurrences(): Promise<SessionRecurrenceRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("session_recurrences")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
