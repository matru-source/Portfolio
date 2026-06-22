-- ============================================================================
-- MATRU PANDA PORTFOLIO — Supabase setup
-- Run this ONCE: Supabase dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent).
-- ============================================================================

-- 1) Content table: a single row holding the whole editable site as JSON.
create table if not exists public.site_content (
  id          text primary key default 'site',
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Seed the single row.
insert into public.site_content (id, data)
values ('site', '{}'::jsonb)
on conflict (id) do nothing;

-- 2) Row Level Security
alter table public.site_content enable row level security;

-- Anyone (the public site) can READ the content.
drop policy if exists "public read content" on public.site_content;
create policy "public read content"
  on public.site_content for select
  using (true);

-- Only the two admin emails can WRITE (insert/update/delete).
drop policy if exists "admins write content" on public.site_content;
create policy "admins write content"
  on public.site_content for all
  to authenticated
  using ( (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') )
  with check ( (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- 3) Storage policies for the 'Media' bucket (images).
-- Public read (bucket is public, but this makes it explicit).
drop policy if exists "public read media" on storage.objects;
create policy "public read media"
  on storage.objects for select
  using ( bucket_id = 'Media' );

-- Only admins can upload / replace / delete.
drop policy if exists "admins manage media" on storage.objects;
create policy "admins manage media"
  on storage.objects for all
  to authenticated
  using ( bucket_id = 'Media' and (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') )
  with check ( bucket_id = 'Media' and (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- 4) Contact messages — visitors submit; only admins can read/delete.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone can send a message (the contact form).
drop policy if exists "anyone can submit a message" on public.messages;
create policy "anyone can submit a message"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- Only the two admins can read messages.
drop policy if exists "admins read messages" on public.messages;
create policy "admins read messages"
  on public.messages for select
  to authenticated
  using ( (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );

-- Only the two admins can delete messages.
drop policy if exists "admins delete messages" on public.messages;
create policy "admins delete messages"
  on public.messages for delete
  to authenticated
  using ( (auth.jwt() ->> 'email') in ('itsmatruprasad@gmail.com', 'matruprasadpanda497@gmail.com') );
