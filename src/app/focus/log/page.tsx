import { SessionLogPage } from "@/components/focus/session-log-page";
import { getAllTracks } from "@/lib/data/tracks";
import { getSessionTypes } from "@/lib/data/session-types";

export const dynamic = "force-dynamic";

export default async function FocusLogPage() {
  const [sessionTypes, tracks] = await Promise.all([
    getSessionTypes(),
    getAllTracks(),
  ]);

  return <SessionLogPage tracks={tracks} sessionTypes={sessionTypes} />;
}
