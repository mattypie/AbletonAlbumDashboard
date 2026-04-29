import Link from "next/link";
import { Headphones, Play, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTracksByStatus } from "@/lib/data/tracks";
import { recommendTrack } from "@/lib/recommend";

export async function FocusPanel() {
  const active = await getTracksByStatus("active");
  const recommendation = recommendTrack(active);

  if (!recommendation) {
    return (
      <Card className="sticky top-20">
        <CardContent className="flex flex-col gap-3 p-5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>No active tracks</span>
          </div>
          <p className="text-muted-foreground">
            Add a track to start a focus session.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/tracks/new">Add a track</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { track, primaryAction } = recommendation;
  return (
    <Card className="sticky top-20">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <Headphones className="h-3.5 w-3.5" />
          Today&apos;s focus
        </div>
        <div>
          <div className="text-base font-semibold leading-tight">
            {track.name}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {primaryAction
              ? primaryAction.description
              : "No primary task set yet."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={`/focus/${track.id}`}>
            <Play className="h-4 w-4" />
            Start focus session
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
