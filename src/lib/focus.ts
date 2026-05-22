import { progressFromStages, type TrackWithDetails } from "@/lib/types";

// The track to suggest finishing next: highest progress, tie-broken by the
// least estimated time remaining.
export function suggestFocusTrack(
  tracks: TrackWithDetails[],
): TrackWithDetails | null {
  if (tracks.length === 0) return null;
  return [...tracks].sort((a, b) => {
    const byProgress =
      progressFromStages(b.stages) - progressFromStages(a.stages);
    if (byProgress !== 0) return byProgress;
    return a.estMinutesRemaining - b.estMinutesRemaining;
  })[0];
}
