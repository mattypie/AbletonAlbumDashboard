"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { setActiveBottleneck } from "@/app/actions/bottlenecks";
import { completeAction } from "@/app/actions/actions";
import { BOTTLENECK_CATEGORIES } from "@/lib/types";

const logSchema = z.object({
  trackId: z.string().uuid(),
  actionId: z.string().uuid().nullable().optional(),
  startedAt: z.string(),
  endedAt: z.string(),
  improved: z.string().max(2000).optional().or(z.literal("")),
  stillBroken: z.string().max(2000).optional().or(z.literal("")),
  newBottleneckDescription: z
    .string()
    .max(500)
    .optional()
    .or(z.literal("")),
  newBottleneckCategory: z
    .enum(BOTTLENECK_CATEGORIES as unknown as [string, ...string[]])
    .optional(),
  completeAction: z.boolean().optional().default(false),
});

export async function logSession(input: {
  trackId: string;
  actionId?: string | null;
  startedAt: string;
  endedAt: string;
  improved?: string;
  stillBroken?: string;
  newBottleneckDescription?: string;
  newBottleneckCategory?: string;
  completeAction?: boolean;
}) {
  const parsed = logSchema.parse(input);
  const supabase = getServerSupabase();

  const { error } = await supabase.from("sessions").insert({
    track_id: parsed.trackId,
    action_id: parsed.actionId ?? null,
    started_at: parsed.startedAt,
    ended_at: parsed.endedAt,
    improved: parsed.improved || null,
    still_broken: parsed.stillBroken || null,
    new_bottleneck: parsed.newBottleneckDescription || null,
  });
  if (error) throw error;

  if (
    parsed.newBottleneckDescription &&
    parsed.newBottleneckCategory &&
    parsed.newBottleneckDescription.trim().length > 0
  ) {
    await setActiveBottleneck({
      trackId: parsed.trackId,
      description: parsed.newBottleneckDescription.trim(),
      category: parsed.newBottleneckCategory,
    });
  }

  if (parsed.completeAction && parsed.actionId) {
    await completeAction(parsed.actionId, parsed.trackId);
  }

  revalidatePath(`/tracks/${parsed.trackId}`);
  revalidatePath(`/focus/${parsed.trackId}`);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/analytics");
}
