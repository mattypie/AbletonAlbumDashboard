import { cn } from "@/lib/utils";
import {
  RESOURCE_TYPE_LABELS,
  type ResourceType,
} from "@/lib/data/resources";
import { RESOURCE_COLOR_CLASSES, RESOURCE_TYPE_COLOR } from "./resource-colors";

export function ResourceTypeBadge({
  type,
  className,
}: {
  type: ResourceType;
  className?: string;
}) {
  const color = RESOURCE_TYPE_COLOR[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        RESOURCE_COLOR_CLASSES[color].badge,
        className,
      )}
    >
      {RESOURCE_TYPE_LABELS[type]}
    </span>
  );
}
