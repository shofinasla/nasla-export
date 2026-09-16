-- NASLA EXPORT - Stage 2: Template Marketplace
-- Safe additive migration. Does not remove existing columns/data.

alter table public.templates
  add column if not exists screenshots jsonb not null default '[]'::jsonb,
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists tech_stack jsonb not null default '[]'::jsonb,
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 0;

create index if not exists templates_marketplace_idx
  on public.templates(is_published, is_featured, sort_order, created_at desc);

-- Keep the existing public-read policy, but make its intended audience explicit.
-- Drop/recreate only this SELECT policy; admin write policy is untouched.
drop policy if exists "published templates read" on public.templates;
create policy "published templates read"
  on public.templates
  for select
  to anon, authenticated
  using (is_published = true or public.is_admin());
