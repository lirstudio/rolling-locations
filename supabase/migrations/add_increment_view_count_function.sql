-- Atomic increment for location view count.
-- Using a function eliminates the read-then-write race condition that exists
-- when application code fetches the current value and writes back value + 1.
create or replace function increment_location_view_count(p_location_id uuid)
returns void
language sql
security definer
as $$
  update locations
  set view_count = coalesce(view_count, 0) + 1
  where id = p_location_id;
$$;
