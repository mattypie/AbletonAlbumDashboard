import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionTypes } from "@/lib/data/session-types";
import { getSessionTemplates } from "@/lib/data/session-templates";
import { getSessionRecurrences } from "@/lib/data/session-recurrences";
import { getAllTracks } from "@/lib/data/tracks";
import { RecurringBlocksEditor } from "./recurring-blocks-editor";

export const dynamic = "force-dynamic";

export default async function RecurringBlocksPage() {
  const [types, templates, recurrences, tracks] = await Promise.all([
    getSessionTypes(),
    getSessionTemplates(),
    getSessionRecurrences(),
    getAllTracks(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/settings">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">
          Recurring blocks
        </h1>
        <p className="mt-1 text-muted-foreground">
          Auto-populate the calendar each week — set it once, skip individual
          instances on the calendar.
        </p>
      </header>
      <RecurringBlocksEditor
        recurrences={recurrences}
        sessionTypes={types}
        templates={templates}
        tracks={tracks}
      />
    </div>
  );
}
