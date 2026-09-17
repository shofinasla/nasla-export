-- NASLA EXPORT - Stage 5: Multi-Provider Payment Core
-- Safe & additive migration for payments and multi-provider transaction management.

-- 1. Create payments table (Multiple payment attempts per order)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'xendit',
  provider_payment_id text,
  provider_reference text,
  payment_method text not null, -- 'card', 'qris', 'virtual_account', 'bank_transfer', 'ewallet', 'paylater', 'direct_debit', 'other'
  payment_channel text,        -- e.g. 'bca_va', 'mandiri_va', 'gopay', 'ovo', 'visa', 'mastercard'
  amount numeric(14,2) not null default 0,
  currency text not null default 'IDR',
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded')),
  payment_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Indexes for fast lookups
create index if not exists payments_order_idx on public.payments(order_id);
create index if not exists payments_provider_idx on public.payments(provider);
create index if not exists payments_provider_payment_id_idx on public.payments(provider, provider_payment_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists payments_created_at_idx on public.payments(created_at desc);

-- 3. Row Level Security on payments table
alter table public.payments enable row level security;

-- Drop existing policies if any to prevent duplicates
drop policy if exists "customer payments read" on public.payments;
drop policy if exists "admin payments all" on public.payments;
drop policy if exists "service role payments manage" on public.payments;

-- Customers can view payments that belong to their own orders, or Admins
create policy "customer payments read" on public.payments
  for select
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.customer_id = auth.uid()
    )
  );

-- Admins have full access to manage payments
create policy "admin payments all" on public.payments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Safe helper function for recording payment updated_at timestamp
create or replace function public.handle_payment_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_payment_updated on public.payments;
create trigger on_payment_updated
  before update on public.payments
  for each row
  execute function public.handle_payment_updated_at();
