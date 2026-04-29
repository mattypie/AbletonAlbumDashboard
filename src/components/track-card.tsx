import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Play, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrackCardActions } from "@/components/track-card-actions";
import {
  BOTTLENECK_LABELS,
  progressFromStages,
  type TrackWithDetails,
} from "@/lib/types";

export function TrackCard({ track }: { track: TrackWithDetails }) {
  const progress = progressFromStages(track.stages);
  const lastWorked = track.last_worked_at
    ? formatDistanceToNow(new Date(track.last_worked_at), { addSuffix: true })
    : "never";

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[5/2] w-full bg-gradient-to-br from-primary/30 via-surface-2 to-accent/20">
        {track.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-bold text-foreground/30">
            {track.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/40 backdrop-blur"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/tracks/${track.id}`}>Open detail</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tracks/${track.id}/edit`}>Edit metadata</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <TrackCardActions trackId={track.id} status={track.status} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/tracks/${track.id}`}
              className="text-base font-semibold leading-tight hover:underline"
            >
              {track.name}
            </Link>
            <span className="shrink-0 text-xs text-muted-foreground">
              {progress}%
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {track.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Progress value={progress} />

        <div className="flex flex-col gap-3 text-sm">
          {track.bottleneck ? (
            <div className="flex gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Bottleneck ·{" "}
                  {BOTTLENECK_LABELS[
                    track.bottleneck
                      .category as keyof typeof BOTTLENECK_LABELS
                  ] ?? track.bottleneck.category}
                </div>
                <p className="line-clamp-2 text-foreground">
                  {track.bottleneck.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 text-muted-foreground">
              <Zap className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-xs">No active bottleneck</span>
            </div>
          )}

          {track.primaryAction ? (
            <div className="flex gap-2">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next action
                </div>
                <p className="line-clamp-2 text-foreground">
                  {track.primaryAction.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 text-muted-foreground">
              <Target className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-xs">No next action set</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Last worked: {lastWorked}
          </span>
          <Button asChild size="sm">
            <Link href={`/focus/${track.id}`}>
              <Play className="h-4 w-4" />
              Continue
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
