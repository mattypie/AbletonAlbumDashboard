import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionTypes } from "@/lib/data/session-types";
import { getSessionTemplates } from "@/lib/data/session-templates";
import { SessionTemplatesEditor } from "./session-templates-editor";

export const dynamic = "force-dynamic";

export default async function SessionTemplatesPage() {
  const [types, templates] = await Promise.all([
    getSessionTypes(),
    getSessionTemplates(),
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
          Session templates
        </h1>
        <p className="mt-1 text-muted-foreground">
          Reusable session shapes — drop them onto the calendar in one click.
        </p>
      </header>
      <SessionTemplatesEditor
        templates={templates}
        sessionTypes={types}
      />
    </div>
  );
}
