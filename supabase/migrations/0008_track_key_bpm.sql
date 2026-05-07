-- Finish Five: capture musical key and tempo on each track so the dashboard
-- can surface them on the track card and creation form.

alter table tracks add column if not exists song_key text;
alter table tracks add column if not exists bpm integer
  check (bpm is null or (bpm > 0 and bpm < 1000));
