create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer','admin');
create type public.order_status as enum ('pending','paid','processing','completed','cancelled','refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  country text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text,
  price numeric(14,2) not null default 0,
  demo_url text,
  preview_image text,
  storage_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  tld text not null,
  display_name text not null,
  registration_price numeric(14,2) not null default 0,
  renewal_price numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_number text unique not null,
  status public.order_status not null default 'pending',
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  currency text not null default 'IDR',
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('template','domain','service')),
  item_id uuid,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  company_name text,
  country text,
  subject text,
  message text not null,
  source text default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  canonical_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders(customer_id);
create index order_items_order_idx on public.order_items(order_id);
create index inquiries_status_idx on public.inquiries(status);
create index blog_posts_published_idx on public.blog_posts(is_published, published_at);

alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.domains enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create policy "profiles self read" on public.profiles for select using (id=auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id=auth.uid() or public.is_admin());

create policy "published templates read" on public.templates for select using (is_published=true or public.is_admin());
create policy "admin templates write" on public.templates for all using (public.is_admin()) with check (public.is_admin());

create policy "active domains read" on public.domains for select using (is_active=true or public.is_admin());
create policy "admin domains write" on public.domains for all using (public.is_admin()) with check (public.is_admin());

create policy "customer orders read" on public.orders for select using (customer_id=auth.uid() or public.is_admin());
create policy "customer order items read" on public.order_items for select using (
  public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid())
);
create policy "admin orders write" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admin order items write" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "public inquiry insert" on public.inquiries for insert with check (true);
create policy "own/admin inquiry read" on public.inquiries for select using (customer_id=auth.uid() or public.is_admin());
create policy "admin inquiry update" on public.inquiries for update using (public.is_admin()) with check (public.is_admin());

create policy "published blog read" on public.blog_posts for select using (is_published=true or public.is_admin());
create policy "admin blog write" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "public settings read" on public.site_settings for select using (true);
create policy "admin settings write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.site_settings(key,value) values
('brand','{"name":"Nasla Export","tagline":"Digital Platform for Global Business"}'),
('contact','{"email":"","whatsapp":"","country":"Indonesia"}')
on conflict (key) do nothing;

insert into public.templates(name,slug,description,category,price,is_published)
values
('Export Company','export-company','Professional export company website foundation.','Export',1500000,true),
('UMKM Business','umkm-business','Professional website for UMKM.','Business',900000,true),
('Corporate Profile','corporate-profile','Corporate profile website foundation.','Corporate',1250000,true)
on conflict (slug) do nothing;

-- After creating your own Auth user, promote ONLY the intended admin:
-- update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';
