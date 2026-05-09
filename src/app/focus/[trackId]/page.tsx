import { notFound } from "next/navigation";
import { FocusRunner } from "@/components/focus-runner";
import { getTrack } from "@/lib/data/tracks";
import { getSessionWithTodos } from "@/lib/data/calendar-sessions";
import { getSessionTypes } from "@/lib/data/session-types";
import { getAllTracks } from "@/lib/data/tracks";

export const dynamic = "force-dynamic";

export default async function FocusPage({
  params,
  searchParams,
}: {
  params: Promise<{ trackId: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { trackId } = await params;
  const sp = await searchParams;
  const track = await getTrack(trackId);
  if (!track) notFound();

  const [plannedSession, sessionTypes, tracks] = await Promise.all([
    sp.session ? getSessionWithTodos(sp.session) : Promise.resolve(null),
    getSessionTypes(),
    getAllTracks(),
  ]);

  return (
    <FocusRunner
      track={track}
      primaryAction={track.primaryAction}
      plannedSession={plannedSession}
      sessionTypes={sessionTypes}
      tracks={tracks}
    />
  );
}
