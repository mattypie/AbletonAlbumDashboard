import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import { isoDate } from "@/lib/dates";
import type { WeeklyReviewRow } from "@/lib/types";

export async function getWeeklyReview(
  weekStart: Date,
): Promise<WeeklyReviewRow | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .eq("week_start", isoDate(weekStart))
    .maybeSingle();
  if (error) throw error;
  return data;
}
