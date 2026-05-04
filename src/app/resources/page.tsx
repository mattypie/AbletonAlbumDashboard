import { ResourcesPageClient } from "@/components/resources/resources-page-client";
import {
  FEATURED_RESOURCES,
  RECENT_RESOURCES,
  RESOURCE_CATEGORIES,
} from "@/lib/data/resources";

export const dynamic = "force-dynamic";

export default function ResourcesPage() {
  return (
    <ResourcesPageClient
      categories={RESOURCE_CATEGORIES}
      featured={FEATURED_RESOURCES}
      recent={RECENT_RESOURCES}
    />
  );
}
