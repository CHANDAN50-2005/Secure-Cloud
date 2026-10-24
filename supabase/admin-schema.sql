-- Admin role and audit log support for SecureCloud.
-- Run after schema.sql. Assign an admin manually from the SQL Editor.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from public, anon, authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$function$;

revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  event_type text not null check (
    event_type in ('file.uploaded', 'file.downloaded', 'file.deleted')
  ),
  file_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_idx
  on public.audit_events (created_at desc);

alter table public.audit_events enable row level security;
revoke all on table public.audit_events from public, anon, authenticated;

create or replace function public.log_file_activity(p_event_type text, p_file_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_event_type not in ('file.uploaded', 'file.downloaded', 'file.deleted') then
    raise exception 'Unsupported activity type';
  end if;

  if not exists (
    select 1
    from public.file_records
    where id = p_file_id
      and owner_id = (select auth.uid())
  ) then
    raise exception 'File not found for this account';
  end if;

  insert into public.audit_events (actor_id, event_type, file_id)
  values ((select auth.uid()), p_event_type, p_file_id);
end;
$function$;

revoke all on function public.log_file_activity(text, uuid) from public, anon;
grant execute on function public.log_file_activity(text, uuid) to authenticated;

create or replace function public.get_admin_summary()
returns table (user_count bigint, file_count bigint, storage_bytes numeric, activity_count bigint)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if not public.is_current_user_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    (select count(*) from auth.users),
    (select count(*) from public.file_records),
    (select coalesce(sum(size_bytes), 0)::numeric from public.file_records),
    (select count(*) from public.audit_events);
end;
$function$;

revoke all on function public.get_admin_summary() from public, anon;
grant execute on function public.get_admin_summary() to authenticated;

create or replace function public.get_admin_recent_activity(p_limit integer default 25)
returns table (id uuid, actor_id uuid, actor_email text, event_type text, file_id uuid, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if not public.is_current_user_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    activity.id,
    activity.actor_id,
    users.email::text,
    activity.event_type,
    activity.file_id,
    activity.created_at
  from public.audit_events as activity
  left join auth.users as users on users.id = activity.actor_id
  order by activity.created_at desc
  limit least(greatest(coalesce(p_limit, 25), 1), 100);
end;
$function$;

revoke all on function public.get_admin_recent_activity(integer) from public, anon;
grant execute on function public.get_admin_recent_activity(integer) to authenticated;

create or replace function public.get_my_recent_activity(p_limit integer default 10)
returns table (id uuid, event_type text, file_id uuid, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $function$
  select activity.id, activity.event_type, activity.file_id, activity.created_at
  from public.audit_events as activity
  where activity.actor_id = (select auth.uid())
  order by activity.created_at desc
  limit least(greatest(coalesce(p_limit, 10), 1), 100);
$function$;

revoke all on function public.get_my_recent_activity(integer) from public, anon;
grant execute on function public.get_my_recent_activity(integer) to authenticated;
