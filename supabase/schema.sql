-- Run this once in the Supabase SQL Editor for your project.
-- The bucket is private. Users can access only files under their own user ID.

insert into storage.buckets (id, name, public, file_size_limit)
values ('securecloud-files', 'SecureCloud files', false, 52428800)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;

create table if not exists public.file_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  object_path text not null unique,
  name text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  content_type text not null default 'application/octet-stream',
  created_at timestamptz not null default now()
);

alter table public.file_records enable row level security;
revoke all on table public.file_records from anon, authenticated;
grant select, insert, delete on table public.file_records to authenticated;

create index if not exists file_records_owner_created_idx
  on public.file_records (owner_id, created_at desc);

drop policy if exists "Users can read their own file records" on public.file_records;
create policy "Users can read their own file records"
  on public.file_records for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Users can add their own file records" on public.file_records;
create policy "Users can add their own file records"
  on public.file_records for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Users can delete their own file records" on public.file_records;
create policy "Users can delete their own file records"
  on public.file_records for delete to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Users can upload their own SecureCloud files" on storage.objects;
create policy "Users can upload their own SecureCloud files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'securecloud-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can read their own SecureCloud files" on storage.objects;
create policy "Users can read their own SecureCloud files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'securecloud-files'
    and owner_id = (select auth.uid()::text)
  );

drop policy if exists "Users can delete their own SecureCloud files" on storage.objects;
create policy "Users can delete their own SecureCloud files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'securecloud-files'
    and owner_id = (select auth.uid()::text)
  );
