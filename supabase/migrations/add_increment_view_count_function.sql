-- Atomic increment for location view count.
-- Using a function eliminates the read-then-write race condition that exists
-- when application code fetches the current value and writes back value + 1.
--
-- IMPORTANT: This migration must be run before deploying the updated
-- incrementLocationViewCount server action. If the function doesn't exist,
-- the code will fall back to SELECT → UPDATE (non-atomic but functional).
--
-- To run this migration:
-- 1. Via Supabase CLI: supabase db push
-- 2. Via Supabase Dashboard: SQL Editor → paste and run
-- 3. Via psql: psql <connection_string> -f add_increment_view_count_function.sql
create or replace function increment_location_view_count(p_location_id uuid)
returns void
language sql
security definer
as $$
  update locations
  set view_count = coalesce(view_count, 0) + 1
  where id = p_location_id;
$$;

-- Grant execute permission to authenticated users (if using RLS)
-- The function uses SECURITY DEFINER so it runs with elevated privileges
-- but can be called by any authenticated user
grant execute on function increment_location_view_count(uuid) to authenticated;
grant execute on function increment_location_view_count(uuid) to anon;
