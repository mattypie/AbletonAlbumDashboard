import { notFound } from "next/navigation";
import { FocusRunner } from "@/components/focus-runner";
import { getTrack } from "@/lib/data/tracks";

export const dynamic = "force-dynamic";

export default async function FocusPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = await getTrack(trackId);
  if (!track) notFound();

  return (
    <FocusRunner
      track={track}
      primaryAction={track.primaryAction}
    />
  );
}
