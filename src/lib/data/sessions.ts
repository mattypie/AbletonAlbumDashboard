import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";

export type SessionStats = { seconds: number; count: number };

// Per-track aggregate of all-time logged session time and session count.
export async function getSessionStatsByTrack(): Promise<
  Map<string, SessionStats>
> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("sessions")
    .select("track_id, duration_seconds, tracks!inner(owner_id)")
    .eq("tracks.owner_id", OWNER_ID);

  const map = new Map<string, SessionStats>();
  (data ?? []).forEach((row) => {
    if (!row.track_id) return;
    const prev = map.get(row.track_id) ?? { seconds: 0, count: 0 };
    map.set(row.track_id, {
      seconds: prev.seconds + (row.duration_seconds ?? 0),
      count: prev.count + 1,
    });
  });
  return map;
}
