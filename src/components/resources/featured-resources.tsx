"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ResourceItem } from "@/lib/data/resources";
import { ResourcesSectionHeader } from "./resources-section-header";
import { FeaturedResourceCard } from "./featured-resource-card";

export function FeaturedResources({
  resources,
  onSelect,
}: {
  resources: ResourceItem[];
  onSelect?: (resource: ResourceItem) => void;
}) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-3">
      <ResourcesSectionHeader
        title="Featured Content"
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous featured"
              onClick={() => scrollBy(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next featured"
              onClick={() => scrollBy(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <div
        ref={scrollerRef}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {resources.map((resource) => (
          <FeaturedResourceCard
            key={resource.id}
            resource={resource}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
