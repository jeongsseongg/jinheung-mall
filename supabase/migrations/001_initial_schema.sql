create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  default_shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  bush_count integer check (bush_count is null or bush_count > 0),
  sales_unit text not null default '단' check (sales_unit in ('단', '박스', '카톤')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_token uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_token is not null)
);

create unique index if not exists carts_user_id_unique on public.carts(user_id) where user_id is not null;

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid references public.product_colors(id) on delete set null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cart_items_unique_selection
  on public.cart_items(cart_id, product_id, coalesce(color_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null default 'bank_transfer' check (payment_method in ('bank_transfer', 'card', 'naver_pay')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'confirmed', 'failed', 'refunded')),
  bank_depositor_name text,
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  shipping_address jsonb not null,
  courier_code text,
  tracking_number text,
  paid_at timestamptz,
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text not null,
  color_name text,
  sales_unit text not null check (sales_unit in ('단', '박스', '카톤')),
  bush_count integer,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid references public.product_colors(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  quantity_delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at before update on public.carts for each row execute function public.set_updated_at();
drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "active products are public" on public.products;
create policy "active products are public" on public.products for select to anon, authenticated using (is_active = true);

drop policy if exists "active product colors are public" on public.product_colors;
create policy "active product colors are public" on public.product_colors for select to anon, authenticated using (
  exists (select 1 from public.products where products.id = product_colors.product_id and products.is_active = true)
);

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users read own cart" on public.carts;
create policy "users read own cart" on public.carts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users manage own cart" on public.carts;
create policy "users manage own cart" on public.carts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage own cart items" on public.cart_items;
create policy "users manage own cart items" on public.cart_items for all to authenticated
using (exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()))
with check (exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users read own order items" on public.order_items;
create policy "users read own order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
