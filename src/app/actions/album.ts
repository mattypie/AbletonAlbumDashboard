"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";

const updateSchema = z.object({
  title: z.string().max(120).optional().default(""),
  cover_image_url: z.string().url().optional().or(z.literal("")),
});

export async function updateAlbumSettings(formData: FormData) {
  const parsed = updateSchema.parse({
    title: formData.get("title") ?? "",
    cover_image_url: formData.get("cover_image_url") ?? "",
  });

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("album_settings")
    .upsert(
      {
        owner_id: OWNER_ID,
        title: parsed.title || null,
        cover_image_url: parsed.cover_image_url || null,
      },
      { onConflict: "owner_id" },
    );
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/settings");
}
