import { Activity, CheckCircle2, Clock3, ListMusic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSupabase } from "@/lib/supabase/server";
import { OWNER_ID } from "@/lib/owner";

async function fetchStats() {
  const supabase = getServerSupabase();
  const [active, completed, sessions] = await Promise.all([
    supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", OWNER_ID)
      .eq("status", "active"),
    supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", OWNER_ID)
      .eq("status", "completed"),
    supabase
      .from("sessions")
      .select("duration_seconds, id, tracks!inner(owner_id)")
      .eq("tracks.owner_id", OWNER_ID),
  ]);

  const sessionRows = sessions.data ?? [];
  const totalSeconds = sessionRows.reduce(
    (acc, s) => acc + (s.duration_seconds ?? 0),
    0,
  );

  return {
    activeCount: active.count ?? 0,
    completedCount: completed.count ?? 0,
    totalHours: totalSeconds / 3600,
    sessionCount: sessionRows.length,
  };
}

export async function StatsStrip() {
  const s = await fetchStats();
  const tiles = [
    {
      label: "In progress",
      value: s.activeCount.toString(),
      icon: ListMusic,
      tone: "text-primary",
    },
    {
      label: "Finished",
      value: s.completedCount.toString(),
      icon: CheckCircle2,
      tone: "text-accent",
    },
    {
      label: "Hours logged",
      value: s.totalHours.toFixed(1),
      icon: Clock3,
      tone: "text-foreground",
    },
    {
      label: "Sessions",
      value: s.sessionCount.toString(),
      icon: Activity,
      tone: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="mt-1 text-2xl font-semibold">{value}</div>
            </div>
            <Icon className={`h-5 w-5 ${tone}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
