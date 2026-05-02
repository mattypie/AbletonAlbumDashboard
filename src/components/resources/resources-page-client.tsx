"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategory,
  type ResourceItem,
} from "@/lib/data/resources";
import { ResourceCategoryGrid } from "./resource-category-grid";
import { FeaturedResources } from "./featured-resources";
import { RecentResourcesTable } from "./recent-resources-table";

const CATEGORY_TITLES = new Map(
  RESOURCE_CATEGORIES.map((c) => [c.id, c.title.toLowerCase()]),
);

export function ResourcesPageClient({
  categories,
  featured,
  recent,
}: {
  categories: ResourceCategory[];
  featured: ResourceItem[];
  recent: ResourceItem[];
}) {
  const [items, setItems] = React.useState<ResourceItem[]>(recent);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filteredRecent = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const categoryTitle = CATEGORY_TITLES.get(item.categoryId) ?? "";
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        categoryTitle.includes(q)
      );
    });
  }, [items, query]);

  const handleSearchChange = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  const handleToggleBookmark = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
          <p className="mt-1 text-muted-foreground">
            Curated guides, tools, and learning materials to help you create
            better music.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
            className="pl-9"
          />
        </div>
      </header>

      <ResourceCategoryGrid categories={categories} />

      <FeaturedResources resources={featured} />

      <RecentResourcesTable
        resources={filteredRecent}
        page={page}
        onPageChange={setPage}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
