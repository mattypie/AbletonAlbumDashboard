-- Albums had RLS enabled outside the repo (Supabase Table Editor enables it
-- by default). V1 is single-user with no auth and uses the anon key, so RLS
-- must be off to match every other table. See README "RLS is intentionally off
-- in V1".
alter table albums disable row level security;
