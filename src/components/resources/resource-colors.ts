import type { ResourceColor, ResourceType } from "@/lib/data/resources";

export const RESOURCE_COLOR_CLASSES: Record<
  ResourceColor,
  { tile: string; badge: string }
> = {
  green: {
    tile: "bg-primary/15 text-primary",
    badge: "bg-primary/15 text-primary border border-primary/30",
  },
  orange: {
    tile: "bg-accent/15 text-accent",
    badge: "bg-accent/15 text-accent border border-accent/30",
  },
  purple: {
    tile: "bg-purple-100 text-purple-700",
    badge: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  blue: {
    tile: "bg-blue-100 text-blue-700",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

export const RESOURCE_TYPE_COLOR: Record<ResourceType, ResourceColor> = {
  guide: "green",
  tutorial: "orange",
  article: "blue",
  video: "purple",
  mindset: "green",
};
