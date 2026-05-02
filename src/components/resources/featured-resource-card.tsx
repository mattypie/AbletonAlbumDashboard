import { Clock, ImageIcon } from "lucide-react";
import type { ResourceItem } from "@/lib/data/resources";
import { ResourceTypeBadge } from "./resource-type-badge";

export function FeaturedResourceCard({
  resource,
  onSelect,
}: {
  resource: ResourceItem;
  onSelect?: (resource: ResourceItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(resource)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-colors hover:border-primary/30"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
        {resource.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resource.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-border text-muted-foreground">
            <ImageIcon className="h-8 w-8" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <ResourceTypeBadge type={resource.type} className="self-start" />
        <h3 className="text-sm font-semibold leading-snug tracking-tight">
          {resource.title}
        </h3>
        <p className="text-xs leading-snug text-muted-foreground">
          {resource.description}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <span>{resource.readMinutes} min read</span>
        </div>
      </div>
    </button>
  );
}
