-- Add view_count column to locations table
alter table locations
  add column if not exists view_count integer not null default 0;

-- Add index for sorting by popularity
create index if not exists idx_locations_view_count on locations(view_count desc);

-- Add comment
comment on column locations.view_count is 'Number of times this location has been viewed';
