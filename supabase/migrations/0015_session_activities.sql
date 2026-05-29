-- Per-activity time allocation + progress/impact rating for production sessions.
--
-- A completed focus session can now break its tracked minutes down across
-- production activities (sound design, arrangement, mixing, …) with an optional
-- per-activity note. One row per (session, activity_key). This child table
-- mirrors the session_todos shape (single-user app, no RLS).

create table session_activities (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  activity_key text not null check (activity_key in (
    'sound_design','arrangement','mixing','organization','melody_harmony',
    'automation','reference_listening','fx_design','other'
  )),
  minutes      integer not null default 0 check (minutes >= 0),
  note         text,
  created_at   timestamptz not null default now(),
  unique (session_id, activity_key)
);

create index session_activities_session_idx on session_activities (session_id);
create index session_activities_key_idx on session_activities (activity_key);

-- Progress/Impact rating (Counterproductive → Breakthrough). Distinct from the
-- existing energy_rating and enjoyment_rating columns.
alter table sessions
  add column progress_impact_rating smallint
    check (progress_impact_rating between 1 and 5);
