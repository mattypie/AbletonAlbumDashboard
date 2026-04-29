"use client";

import { useTransition } from "react";
import { setTrackStatus } from "@/app/actions/tracks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function TrackCardActions({
  trackId,
  status,
}: {
  trackId: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  const run = (next: string) => {
    start(async () => {
      try {
        await setTrackStatus(trackId, next);
      } catch (e) {
        alert((e as Error).message);
      }
    });
  };

  return (
    <>
      {status !== "completed" && (
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            run("completed");
          }}
        >
          Mark complete
        </DropdownMenuItem>
      )}
      {status !== "backlog" && (
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            run("backlog");
          }}
        >
          Move to backlog
        </DropdownMenuItem>
      )}
      {status !== "active" && (
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            run("active");
          }}
        >
          Activate
        </DropdownMenuItem>
      )}
      {status !== "archived" && (
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            run("archived");
          }}
        >
          Archive
        </DropdownMenuItem>
      )}
    </>
  );
}
