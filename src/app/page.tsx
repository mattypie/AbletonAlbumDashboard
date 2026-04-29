import Link from "next/link";
import { Plus } from "lucide-react";
import { TrackCard } from "@/components/track-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { StatsStrip } from "@/components/stats-strip";
import { FocusPanel } from "@/components/focus-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTracksByStatus } from "@/lib/data/tracks";
import { recommendTrack } from "@/lib/recommend";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";

export const dynamic = "force-dynamic";

async function fetchSessionsLast7DaysByTrack() {
  const supabase = getServerSupabase();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data } = await supabase
    .from("sessions")
    .select("track_id, tracks!inner(owner_id)")
    .eq("tracks.owner_id", OWNER_ID)
    .gte("started_at", since.toISOString());
  const map = new Map<string, number>();
  (data ?? []).forEach((row) => {
    map.set(row.track_id, (map.get(row.track_id) ?? 0) + 1);
  });
  return map;
}

export default async function DashboardPage() {
  const [active, sessionCounts] = await Promise.all([
    getTracksByStatus("active"),
    fetchSessionsLast7DaysByTrack(),
  ]);
  const recommendation = recommendTrack(active, sessionCounts);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Your active five — what&apos;s in motion, what&apos;s stuck, and
            what&apos;s next.
          </p>
        </header>

        <StatsStrip />

        <RecommendationCard rec={recommendation} />

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-semibold">
              Active tracks{" "}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({active.length} / 5)
              </span>
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/tracks/new">
                <Plus className="h-4 w-4" />
                Add Track
              </Link>
            </Button>
          </div>

          {active.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-start gap-3 p-8">
                <h3 className="text-lg font-semibold">
                  Your five slots are empty
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add up to five tracks to focus on. Anything else lives in
                  the backlog until you&apos;re ready.
                </p>
                <Button asChild>
                  <Link href="/tracks/new">
                    <Plus className="h-4 w-4" />
                    Add your first track
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="hidden lg:block">
        <FocusPanel />
      </aside>
    </div>
  );
}
