-- NASLA EXPORT - Stage 4: Order Core & Transaction System
-- Additive & safe migration. Extends existing schema without breaking existing data.

-- 1. Extend orders table with discount and notes
alter table public.orders
  add column if not exists discount numeric(14,2) not null default 0,
  add column if not exists notes text,
  add column if not exists payment_method text;

-- 2. Extend order_items table with product_id, slug, metadata, and created_at
alter table public.order_items
  add column if not exists product_id uuid,
  add column if not exists slug text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

-- 3. Expand item_type check constraint safely
alter table public.order_items drop constraint if exists order_items_item_type_check;
alter table public.order_items add constraint order_items_item_type_check 
  check (item_type in ('template', 'domain', 'service', 'website', 'export'));

-- 4. Order number sequence & generator helper
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns text language plpgsql
as $$
declare
  seq_val bigint;
  date_str text;
begin
  seq_val := nextval('public.order_number_seq');
  date_str := to_char(now(), 'YYYYMMDD');
  return 'NEX-' || date_str || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- 5. Row Level Security for orders and order_items
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Orders policies
drop policy if exists "customer orders read" on public.orders;
drop policy if exists "customer orders insert" on public.orders;
drop policy if exists "admin orders write" on public.orders;
drop policy if exists "admins can manage orders" on public.orders;

create policy "customer orders read" on public.orders
  for select
  to authenticated
  using (customer_id = auth.uid() or public.is_admin());

create policy "customer orders insert" on public.orders
  for insert
  to authenticated
  with check (customer_id = auth.uid());

create policy "admins can manage orders" on public.orders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Order items policies
drop policy if exists "customer order items read" on public.order_items;
drop policy if exists "customer order items insert" on public.order_items;
drop policy if exists "admin order items write" on public.order_items;
drop policy if exists "admins can manage order items" on public.order_items;

create policy "customer order items read" on public.order_items
  for select
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

create policy "customer order items insert" on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    ) or public.is_admin()
  );

create policy "admins can manage order items" on public.order_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
