import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";
import type { Database } from "@/lib/database.types";

export type AlbumSettings =
  Database["public"]["Tables"]["album_settings"]["Row"];

export async function getAlbumSettings(): Promise<AlbumSettings | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("album_settings")
    .select("*")
    .eq("owner_id", OWNER_ID)
    .maybeSingle();
  if (error) throw error;
  return data;
}
