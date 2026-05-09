import Link from "next/link";
import {
  CalendarClock,
  Disc3,
  LayoutTemplate,
  Repeat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CoverImageUpload } from "@/components/cover-image-upload";
import { ComingSoon } from "@/components/coming-soon";
import { Settings as SettingsIcon } from "lucide-react";
import { updateAlbumSettings } from "@/app/actions/album";
import { getAlbumSettings } from "@/lib/data/album";
import { OWNER_ID } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const album = await getAlbumSettings();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Album cover and dashboard preferences.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-primary" />
            Album
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateAlbumSettings} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label>Album cover</Label>
              <CoverImageUpload
                name="cover_image_url"
                pathPrefix={`album/${OWNER_ID}`}
                defaultUrl={album?.cover_image_url}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="album_title">Album title (optional)</Label>
              <Input
                id="album_title"
                name="title"
                defaultValue={album?.title ?? ""}
                placeholder="Untitled album"
                maxLength={120}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save album</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Calendar planning
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <SettingsTile
            href="/settings/session-types"
            icon={CalendarClock}
            title="Session types"
            description="Categories shown on the calendar (Sound Design, Arrangement, etc.) with colors."
          />
          <SettingsTile
            href="/settings/session-templates"
            icon={LayoutTemplate}
            title="Session templates"
            description="Reusable session shapes with default duration and todo lists."
          />
          <SettingsTile
            href="/settings/recurring-blocks"
            icon={Repeat}
            title="Recurring blocks"
            description="Auto-populate the calendar each week (e.g., every Tue 9–11am)."
          />
        </CardContent>
      </Card>

      <ComingSoon
        icon={SettingsIcon}
        title="Preferences"
        description="Default focus duration, recommendation weights, and display preferences. (Single-user app, no auth.)"
      />
    </div>
  );
}

function SettingsTile({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof CalendarClock;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-md border border-border bg-surface p-3 text-sm transition-colors hover:bg-surface-2"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </Link>
  );
}
