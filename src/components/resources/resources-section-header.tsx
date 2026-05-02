import * as React from "react";
import { cn } from "@/lib/utils";

export function ResourcesSectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        className,
      )}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
