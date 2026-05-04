import type { ResourceCategory } from "@/lib/data/resources";
import { ResourcesSectionHeader } from "./resources-section-header";
import { ResourceCategoryCard } from "./resource-category-card";

export function ResourceCategoryGrid({
  categories,
  onSelect,
  onViewAll,
}: {
  categories: ResourceCategory[];
  onSelect?: (category: ResourceCategory) => void;
  onViewAll?: () => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <ResourcesSectionHeader
        title="Explore Resources by Category"
        action={
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm text-primary hover:underline"
          >
            View all categories
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <ResourceCategoryCard
            key={category.id}
            category={category}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
