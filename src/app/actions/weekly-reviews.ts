"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import { isoDate, startOfWeekMonday } from "@/lib/dates";
import type { Database } from "@/lib/database.types";

type WeeklyReviewInsert =
  Database["public"]["Tables"]["weekly_reviews"]["Insert"];

const schema = z.object({
  weekStart: z.string(),
  intention: z.string().max(2000).optional(),
  reflection: z.string().max(2000).optional(),
});

export async function upsertWeeklyReview(input: {
  weekStart: string;
  intention?: string;
  reflection?: string;
}) {
  const parsed = schema.parse(input);
  const supabase = getServerSupabase();
  const week = isoDate(startOfWeekMonday(new Date(parsed.weekStart)));

  const update: WeeklyReviewInsert = {
    owner_id: OWNER_ID,
    week_start: week,
  };
  if (parsed.intention !== undefined) update.intention = parsed.intention;
  if (parsed.reflection !== undefined) update.reflection = parsed.reflection;

  const { error } = await supabase.from("weekly_reviews").upsert(update, {
    onConflict: "owner_id,week_start",
  });
  if (error) throw error;
  revalidatePath("/calendar");
}
