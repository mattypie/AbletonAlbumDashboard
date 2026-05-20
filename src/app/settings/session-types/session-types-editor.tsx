"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  archiveSessionType,
  createSessionType,
  unarchiveSessionType,
  updateSessionType,
} from "@/app/actions/session-types";
import type { SessionTypeRow } from "@/lib/types";

const PRESET_COLORS = [
  "#7C5CFF",
  "#4CAF50",
  "#E91E63",
  "#03A9F4",
  "#00BCD4",
  "#FF9800",
  "#9E9E9E",
  "#607D8B",
  "#FFC107",
  "#673AB7",
];

export function SessionTypesEditor({ initial }: { initial: SessionTypeRow[] }) {
  const router = useRouter();
  const [pending, startTx] = useTransition();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newRequiresTrack, setNewRequiresTrack] = useState(false);

  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {initial.map((t) => (
          <TypeRow
            key={t.id}
            type={t}
            disabled={pending}
            onChange={() => refresh()}
          />
        ))}
      </ul>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="newName">Name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Vocal Recording"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className="h-9 w-9 rounded-full border-2"
                    style={{
                      backgroundColor: c,
                      borderColor: newColor === c ? "#000" : "transparent",
                    }}
                    aria-label={`Pick ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={newRequiresTrack}
              onCheckedChange={(v) => setNewRequiresTrack(v === true)}
            />
            Requires a track
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newName.trim() || pending}
              onClick={() =>
                startTx(async () => {
                  await createSessionType({
                    name: newName.trim(),
                    color: newColor,
                    requiresTrack: newRequiresTrack,
                  });
                  setAdding(false);
                  setNewName("");
                  setNewRequiresTrack(false);
                  refresh();
                })
              }
            >
              Add type
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add session type
        </Button>
      )}
    </div>
  );
}

function TypeRow({
  type,
  disabled,
  onChange,
}: {
  type: SessionTypeRow;
  disabled?: boolean;
  onChange: () => void;
}) {
  const [pending, startTx] = useTransition();
  const [name, setName] = useState(type.name);
  const [color, setColor] = useState(type.color);
  const [requiresTrack, setRequiresTrack] = useState(type.requires_track);

  const dirty =
    name !== type.name ||
    color !== type.color ||
    requiresTrack !== type.requires_track;

  return (
    <li
      className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 sm:flex-row sm:items-center sm:gap-3"
      style={{ opacity: type.is_archived ? 0.6 : 1 }}
    >
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-md border border-border bg-transparent"
          aria-label="Color"
        />
      </div>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={requiresTrack}
          onCheckedChange={(v) => setRequiresTrack(v === true)}
        />
        Requires track
      </label>
      <div className="flex items-center gap-2">
        {dirty && (
          <Button
            size="sm"
            disabled={pending || disabled}
            onClick={() =>
              startTx(async () => {
                await updateSessionType({
                  id: type.id,
                  name: name.trim(),
                  color,
                  requiresTrack,
                });
                onChange();
              })
            }
          >
            Save
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={pending || disabled}
          onClick={() =>
            startTx(async () => {
              if (type.is_archived) await unarchiveSessionType(type.id);
              else await archiveSessionType(type.id);
              onChange();
            })
          }
        >
          {type.is_archived ? (
            <>
              <ArchiveRestore className="h-4 w-4" />
              Restore
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              Archive
            </>
          )}
        </Button>
      </div>
    </li>
  );
}
