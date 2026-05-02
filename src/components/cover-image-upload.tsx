"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export const COVER_BUCKET = "track-images";

export function CoverImageUpload({
  name,
  pathPrefix,
  defaultUrl,
  onChange,
}: {
  name: string;
  pathPrefix: string;
  defaultUrl?: string | null;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Pick an image file (png, jpg, webp, gif, avif).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = getBrowserSupabase();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const key = `${pathPrefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(COVER_BUCKET)
        .upload(key, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(key);
      setUrl(data.publicUrl);
      onChange?.(data.publicUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setUrl("");
    onChange?.("");
  }

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {uploading
                ? "Uploading…"
                : "PNG, JPG, WEBP, GIF, AVIF · up to 10MB"}
            </span>
            {url && !uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
