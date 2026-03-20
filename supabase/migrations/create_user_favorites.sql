-- Create user_favorites table
create table if not exists user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, location_id)
);

-- Enable RLS
alter table user_favorites enable row level security;

-- Creators can manage their own favorites
create policy "creators manage own favorites"
  on user_favorites for all
  using (auth.uid() = user_id);

-- Index for queries
create index if not exists idx_user_favorites_user_id on user_favorites(user_id);
create index if not exists idx_user_favorites_location_id on user_favorites(location_id);
