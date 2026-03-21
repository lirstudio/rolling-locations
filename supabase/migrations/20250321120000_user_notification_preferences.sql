-- Notification preferences per authenticated user (email channel groups).
create table if not exists public.user_notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_new_booking_request boolean not null default true,
  email_booking_status boolean not null default true,
  email_messages boolean not null default true,
  email_marketing boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_notification_preferences_updated_at
  on public.user_notification_preferences (updated_at desc);

alter table public.user_notification_preferences enable row level security;

-- Users manage only their own row
create policy "users select own notification preferences"
  on public.user_notification_preferences for select
  using (auth.uid() = user_id);

create policy "users insert own notification preferences"
  on public.user_notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "users update own notification preferences"
  on public.user_notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Dedup / audit for status-change emails (server actions use service role)
alter table public.booking_requests
  add column if not exists last_status_notified text null;

comment on column public.booking_requests.last_status_notified is
  'Last booking status for which a status-change email was sent (idempotency).';

-- Resolve auth user id by email (service_role only; used for creator prefs lookup)
create or replace function public.user_id_by_email (email_input text)
returns uuid
language sql
security definer
set search_path = auth
stable
as $$
  select id
  from auth.users
  where lower(email) = lower(trim(email_input))
  limit 1;
$$;

revoke all on function public.user_id_by_email (text) from public;
grant execute on function public.user_id_by_email (text) to service_role;
