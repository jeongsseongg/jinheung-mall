begin;

-- Keep administrator-only customer notes outside every Data API exposed schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.customer_admin_notes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  admin_note text not null default '' check (length(admin_note) <= 1000),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.customer_admin_notes enable row level security;
revoke all on private.customer_admin_notes from public, anon, authenticated;

-- Migration 009 stored the administrator note on a user-writable profile row.
-- Copy it once and then remove that column so it cannot be selected or changed
-- through the public profiles relation.
do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'admin_note'
  ) then
    execute $copy$
      insert into private.customer_admin_notes (
        user_id, admin_note, created_at, updated_at
      )
      select
        id,
        trim(admin_note),
        created_at,
        updated_at
      from public.profiles
      where trim(admin_note) <> ''
      on conflict (user_id) do update
      set admin_note = excluded.admin_note,
          updated_at = excluded.updated_at
    $copy$;

    execute 'alter table public.profiles drop column admin_note';
  end if;
end;
$migration$;

-- The profile is readable only through a safe column allow-list. All writes go
-- through save_my_profile(), which ignores identity and administrator fields.
revoke all on public.profiles from public, anon, authenticated;
grant select (
  id,
  email,
  name,
  phone,
  default_shipping_address,
  created_at,
  updated_at
) on public.profiles to authenticated;

-- Direct profile mutation is intentionally unsupported even if a broad table
-- grant is added later. The owner-run auth trigger and save_my_profile() bypass
-- these caller policies, while browser reads still require ownership.
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);

-- The cart is also RPC-only. This makes the advisory-lock discipline in the
-- merge/sync/order functions authoritative and prevents direct writes from
-- racing checkout inventory work.
revoke all on public.carts from public, anon, authenticated;
revoke all on public.cart_items from public, anon, authenticated;
drop policy if exists "users read own cart" on public.carts;
drop policy if exists "users manage own cart" on public.carts;
drop policy if exists "users manage own cart items" on public.cart_items;

-- A singleton row holds checkout and bank-transfer configuration. Direct table
-- access is intentionally disabled; the RPCs below expose only intended fields.
create table if not exists public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default '진흥몰',
  support_phone text not null default '',
  bank_name text not null default '',
  bank_account text not null default '',
  account_holder text not null default '',
  order_notice text not null default '',
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  free_shipping_threshold integer default 0 check (
    free_shipping_threshold is null or free_shipping_threshold >= 0
  ),
  minimum_order_amount integer not null default 0 check (minimum_order_amount >= 0),
  is_ordering_enabled boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;
revoke all on public.store_settings from public, anon, authenticated;

-- Account favorites are RPC-only. Keeping the table behind RLS prevents a
-- future broad Data API grant from exposing another user's selections.
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.user_favorites enable row level security;
revoke all on public.user_favorites from public, anon, authenticated;

create index if not exists user_favorites_product_idx
  on public.user_favorites(product_id);

-- Idempotent checkout, lifecycle timestamps, and a durable status audit trail.
alter table public.orders
  add column if not exists client_request_id uuid,
  add column if not exists cancelled_at timestamptz,
  add column if not exists delivered_at timestamptz;

create unique index if not exists orders_user_client_request_unique
  on public.orders(user_id, client_request_id)
  where user_id is not null and client_request_id is not null;

create index if not exists orders_created_cursor_idx
  on public.orders(created_at desc, id desc);

create index if not exists orders_user_created_cursor_idx
  on public.orders(user_id, created_at desc, id desc);

-- The cursor index above subsumes migration 005's shorter index.
drop index if exists public.orders_user_created_idx;

create index if not exists orders_pending_user_idx
  on public.orders(user_id)
  where user_id is not null and status = 'pending_payment';

-- Preserve useful lifecycle timestamps for rows that predate these columns.
update public.orders
set cancelled_at = updated_at
where status = 'cancelled'
  and cancelled_at is null;

update public.orders
set delivered_at = updated_at
where status = 'delivered'
  and delivered_at is null;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text check (
    from_status is null or from_status in (
      'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'
    )
  ),
  to_status text not null check (
    to_status in (
      'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'
    )
  ),
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.order_status_history enable row level security;
revoke all on public.order_status_history from public, anon, authenticated;

create index if not exists order_status_history_order_created_idx
  on public.order_status_history(order_id, created_at desc);

insert into public.order_status_history (
  order_id, from_status, to_status, note, created_at
)
select
  o.id,
  null,
  o.status,
  'migration_snapshot',
  o.created_at
from public.orders o
where not exists (
  select 1
  from public.order_status_history h
  where h.order_id = o.id
);

alter table public.inventory_movements
  add column if not exists order_item_id uuid
  references public.order_items(id) on delete set null;

create unique index if not exists inventory_movement_item_reason_unique
  on public.inventory_movements(order_item_id, reason)
  where order_item_id is not null;

create index if not exists inventory_movements_order_idx
  on public.inventory_movements(order_id);

create index if not exists inventory_movements_product_created_idx
  on public.inventory_movements(product_id, created_at desc);

create index if not exists order_items_order_created_idx
  on public.order_items(order_id, created_at, id);

create index if not exists payment_events_order_idx
  on public.payment_events(order_id);

-- Migration 004 enforces one cart row per product, so the older expression
-- index that also included color_id only adds write/storage overhead.
drop index if exists public.cart_items_unique_selection;

-- Existing rows came from server-calculated totals. NOT VALID avoids making the
-- deployment depend on historical hand-edits while enforcing new writes.
do $constraints$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_total_amount_consistent'
  ) then
    alter table public.orders
      add constraint orders_total_amount_consistent
      check (
        total_amount::bigint = subtotal::bigint + shipping_fee::bigint
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.order_items'::regclass
      and conname = 'order_items_line_total_consistent'
  ) then
    alter table public.order_items
      add constraint order_items_line_total_consistent
      check (
        line_total::bigint = unit_price::bigint * quantity::bigint
      ) not valid;
  end if;
end;
$constraints$;

create or replace function public.save_my_profile(p_profile jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_name text;
  v_phone text;
  v_address jsonb;
  v_current_address jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_profile) is distinct from 'object' then
    raise exception 'profile must be an object';
  end if;

  select p.default_shipping_address
  into v_current_address
  from public.profiles p
  where p.id = v_user_id;

  v_email := nullif(trim(auth.jwt() ->> 'email'), '');
  v_name := trim(coalesce(
    p_profile ->> 'name',
    (select p.name from public.profiles p where p.id = v_user_id),
    ''
  ));
  v_phone := trim(coalesce(
    p_profile ->> 'phone',
    (select p.phone from public.profiles p where p.id = v_user_id),
    ''
  ));

  if p_profile ? 'default_shipping_address' then
    v_address := p_profile -> 'default_shipping_address';
  elsif p_profile ? 'shipping_address' then
    v_address := p_profile -> 'shipping_address';
  else
    v_address := coalesce(v_current_address, '{}'::jsonb);
  end if;

  if v_name = '' or length(v_name) > 100 then
    raise exception 'invalid name';
  end if;
  if v_phone = '' or length(v_phone) > 30 then
    raise exception 'invalid phone';
  end if;
  if jsonb_typeof(v_address) is distinct from 'object'
     or length(v_address::text) > 4000 then
    raise exception 'invalid shipping address';
  end if;

  insert into public.profiles (
    id, email, name, phone, default_shipping_address
  )
  values (
    v_user_id, v_email, v_name, v_phone, v_address
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email),
      name = excluded.name,
      phone = excluded.phone,
      default_shipping_address = excluded.default_shipping_address,
      updated_at = now();

  return (
    select jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'name', p.name,
      'phone', p.phone,
      'default_shipping_address', p.default_shipping_address,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    )
    from public.profiles p
    where p.id = v_user_id
  );
end;
$$;

-- Replace the permissive migration-004 cart RPCs. The browser contract remains
-- one row per product with one optional color, but hostile or stale payloads are
-- bounded and can no longer write an invalid product/color pairing.
create or replace function public.merge_user_cart(
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_color_id uuid;
  v_sku text;
  v_color_name text;
  v_quantity integer;
  v_item_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'cart items must be an array';
  end if;
  if jsonb_array_length(p_items) > 100
     or length(p_items::text) > 100000 then
    raise exception 'too many cart items';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) is distinct from 'object'
  ) then
    raise exception 'invalid cart item';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value -> 'sku') is distinct from 'string'
       or jsonb_typeof(item.value -> 'quantity') not in ('number', 'string')
       or (
         item.value ? 'color'
         and jsonb_typeof(item.value -> 'color') not in ('string', 'null')
       )
       or nullif(trim(item.value ->> 'sku'), '') is null
       or length(trim(item.value ->> 'sku')) > 100
       or coalesce(item.value ->> 'quantity', '') !~ '^[0-9]{1,3}$'
       or length(coalesce(item.value ->> 'color', '')) > 100
  ) then
    raise exception 'invalid cart item fields';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where (item.value ->> 'quantity')::integer < 1
       or (item.value ->> 'quantity')::integer > 999
  ) then
    raise exception 'invalid cart item quantity';
  end if;
  if (
    select count(*)
    from jsonb_array_elements(p_items)
  ) <> (
    select count(distinct upper(trim(item.value ->> 'sku')))
    from jsonb_array_elements(p_items) as item(value)
  ) then
    raise exception 'duplicate cart SKU';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 1)
  );

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) where user_id is not null
  do update set updated_at = now()
  returning id into v_cart_id;

  delete from public.cart_items ci
  using public.products p
  where ci.cart_id = v_cart_id
    and p.id = ci.product_id
    and not p.is_active;

  update public.cart_items ci
  set color_id = null,
      updated_at = now()
  where ci.cart_id = v_cart_id
    and ci.color_id is not null
    and not exists (
      select 1
      from public.product_colors pc
      where pc.id = ci.color_id
        and pc.product_id = ci.product_id
    );

  delete from public.cart_items ci
  using (
    select existing.id
    from public.cart_items existing
    where existing.cart_id = v_cart_id
    order by existing.created_at, existing.id
    offset 100
  ) excess
  where ci.id = excess.id;

  select count(*)::integer
  into v_item_count
  from public.cart_items ci
  where ci.cart_id = v_cart_id;

  for v_item in
    select item.value
    from jsonb_array_elements(p_items) with ordinality as item(value, ordinality)
    order by item.ordinality
  loop
    v_sku := upper(trim(v_item ->> 'sku'));
    v_quantity := (v_item ->> 'quantity')::integer;
    v_color_name := nullif(trim(coalesce(v_item ->> 'color', '')), '');

    select p.id
    into v_product_id
    from public.products p
    where p.sku = v_sku
      and p.is_active = true;

    if not found then
      continue;
    end if;

    v_color_id := null;
    if v_color_name is not null then
      select pc.id
      into v_color_id
      from public.product_colors pc
      where pc.product_id = v_product_id
        and pc.name = v_color_name;

      if not found then
        continue;
      end if;
    else
      select pc.id
      into v_color_id
      from public.product_colors pc
      where pc.product_id = v_product_id
      order by pc.sort_order, pc.name, pc.id
      limit 1;
    end if;

    update public.cart_items
    set color_id = v_color_id,
        quantity = greatest(quantity, v_quantity),
        updated_at = now()
    where cart_id = v_cart_id
      and product_id = v_product_id;

    if not found and v_item_count < 100 then
      insert into public.cart_items (
        cart_id, product_id, color_id, quantity
      )
      values (
        v_cart_id, v_product_id, v_color_id, v_quantity
      );
      v_item_count := v_item_count + 1;
    end if;
  end loop;

  update public.carts
  set updated_at = now()
  where id = v_cart_id;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'sku', p.sku,
      'quantity', ci.quantity,
      'color', pc.name
    ) order by p.sku), '[]'::jsonb)
    from public.cart_items ci
    join public.products p
      on p.id = ci.product_id
     and p.is_active = true
    left join public.product_colors pc
      on pc.id = ci.color_id
     and pc.product_id = ci.product_id
    where ci.cart_id = v_cart_id
  );
end;
$$;

create or replace function public.sync_user_cart(
  p_items jsonb default '[]'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_color_id uuid;
  v_sku text;
  v_color_name text;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'cart items must be an array';
  end if;
  if jsonb_array_length(p_items) > 100
     or length(p_items::text) > 100000 then
    raise exception 'too many cart items';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) is distinct from 'object'
  ) then
    raise exception 'invalid cart item';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value -> 'sku') is distinct from 'string'
       or jsonb_typeof(item.value -> 'quantity') not in ('number', 'string')
       or (
         item.value ? 'color'
         and jsonb_typeof(item.value -> 'color') not in ('string', 'null')
       )
       or nullif(trim(item.value ->> 'sku'), '') is null
       or length(trim(item.value ->> 'sku')) > 100
       or coalesce(item.value ->> 'quantity', '') !~ '^[0-9]{1,3}$'
       or length(coalesce(item.value ->> 'color', '')) > 100
  ) then
    raise exception 'invalid cart item fields';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where (item.value ->> 'quantity')::integer < 1
       or (item.value ->> 'quantity')::integer > 999
  ) then
    raise exception 'invalid cart item quantity';
  end if;
  if (
    select count(*)
    from jsonb_array_elements(p_items)
  ) <> (
    select count(distinct upper(trim(item.value ->> 'sku')))
    from jsonb_array_elements(p_items) as item(value)
  ) then
    raise exception 'duplicate cart SKU';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 1)
  );

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) where user_id is not null
  do update set updated_at = now()
  returning id into v_cart_id;

  delete from public.cart_items
  where cart_id = v_cart_id;

  for v_item in
    select item.value
    from jsonb_array_elements(p_items) with ordinality as item(value, ordinality)
    order by item.ordinality
  loop
    v_sku := upper(trim(v_item ->> 'sku'));
    v_quantity := (v_item ->> 'quantity')::integer;
    v_color_name := nullif(trim(coalesce(v_item ->> 'color', '')), '');

    select p.id
    into v_product_id
    from public.products p
    where p.sku = v_sku
      and p.is_active = true;

    if not found then
      continue;
    end if;

    v_color_id := null;
    if v_color_name is not null then
      select pc.id
      into v_color_id
      from public.product_colors pc
      where pc.product_id = v_product_id
        and pc.name = v_color_name;

      if not found then
        continue;
      end if;
    else
      select pc.id
      into v_color_id
      from public.product_colors pc
      where pc.product_id = v_product_id
      order by pc.sort_order, pc.name, pc.id
      limit 1;
    end if;

    insert into public.cart_items (
      cart_id, product_id, color_id, quantity
    )
    values (
      v_cart_id, v_product_id, v_color_id, v_quantity
    );
  end loop;

  update public.carts
  set updated_at = now()
  where id = v_cart_id;

  return true;
end;
$$;

create or replace function public.merge_user_favorites(
  p_skus jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_slots integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_skus) is distinct from 'array' then
    raise exception 'favorite SKUs must be an array';
  end if;
  if jsonb_array_length(p_skus) > 200 then
    raise exception 'too many favorite SKUs';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_skus) as item(value)
    where jsonb_typeof(item.value) <> 'string'
       or nullif(trim(item.value #>> '{}'), '') is null
       or length(trim(item.value #>> '{}')) > 100
  ) then
    raise exception 'invalid favorite SKU';
  end if;

  -- Serialize merge/sync for one account so concurrent browser tabs cannot
  -- exceed the durable 200-product cap or overwrite each other mid-operation.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 2)
  );

  delete from public.user_favorites uf
  using public.products p
  where uf.user_id = v_user_id
    and p.id = uf.product_id
    and not p.is_active;

  -- Also repair data written by an older version of this function.
  delete from public.user_favorites uf
  using (
    select existing.product_id
    from public.user_favorites existing
    where existing.user_id = v_user_id
    order by existing.created_at, existing.product_id
    offset 200
  ) excess
  where uf.user_id = v_user_id
    and uf.product_id = excess.product_id;

  select greatest(0, 200 - count(*)::integer)
  into v_slots
  from public.user_favorites uf
  where uf.user_id = v_user_id;

  with requested_products as (
    select distinct p.id as product_id, p.sku
    from jsonb_array_elements_text(p_skus) as requested(sku)
    join public.products p
      on p.sku = upper(trim(requested.sku))
     and p.is_active = true
  ), missing_products as (
    select requested.product_id
    from requested_products requested
    where not exists (
      select 1
      from public.user_favorites existing
      where existing.user_id = v_user_id
        and existing.product_id = requested.product_id
    )
    order by requested.sku, requested.product_id
    limit v_slots
  )
  insert into public.user_favorites (user_id, product_id)
  select v_user_id, missing.product_id
  from missing_products missing
  on conflict (user_id, product_id) do nothing;

  return (
    select coalesce(jsonb_agg(p.sku order by p.sku), '[]'::jsonb)
    from public.user_favorites uf
    join public.products p on p.id = uf.product_id
    where uf.user_id = v_user_id
      and p.is_active = true
  );
end;
$$;

create or replace function public.sync_user_favorites(
  p_skus jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_skus) is distinct from 'array' then
    raise exception 'favorite SKUs must be an array';
  end if;
  if jsonb_array_length(p_skus) > 200 then
    raise exception 'too many favorite SKUs';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_skus) as item(value)
    where jsonb_typeof(item.value) <> 'string'
       or nullif(trim(item.value #>> '{}'), '') is null
       or length(trim(item.value #>> '{}')) > 100
  ) then
    raise exception 'invalid favorite SKU';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 2)
  );

  delete from public.user_favorites
  where user_id = v_user_id;

  insert into public.user_favorites (user_id, product_id)
  select distinct v_user_id, p.id
  from jsonb_array_elements_text(p_skus) as requested(sku)
  join public.products p
    on p.sku = upper(trim(requested.sku))
   and p.is_active = true
  on conflict (user_id, product_id) do nothing;

  return (
    select coalesce(jsonb_agg(p.sku order by p.sku), '[]'::jsonb)
    from public.user_favorites uf
    join public.products p on p.id = uf.product_id
    where uf.user_id = v_user_id
      and p.is_active = true
  );
end;
$$;

create or replace function public.get_checkout_settings()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'store_name', s.store_name,
      'support_phone', s.support_phone,
      'bank_name', s.bank_name,
      'bank_account', s.bank_account,
      'account_holder', s.account_holder,
      'order_notice', s.order_notice,
      'shipping_fee', s.shipping_fee,
      'free_shipping_threshold', coalesce(s.free_shipping_threshold, 0),
      'minimum_order_amount', s.minimum_order_amount,
      'is_ordering_enabled', s.is_ordering_enabled
    )
    from public.store_settings s
    where s.id = 1
  );
end;
$$;

create or replace function public.get_admin_store_settings()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  return (
    select jsonb_build_object(
      'store_name', s.store_name,
      'support_phone', s.support_phone,
      'bank_name', s.bank_name,
      'bank_account', s.bank_account,
      'account_holder', s.account_holder,
      'order_notice', s.order_notice,
      'shipping_fee', s.shipping_fee,
      'free_shipping_threshold', coalesce(s.free_shipping_threshold, 0),
      'minimum_order_amount', s.minimum_order_amount,
      'is_ordering_enabled', s.is_ordering_enabled,
      'updated_at', s.updated_at,
      'updated_by', s.updated_by
    )
    from public.store_settings s
    where s.id = 1
  );
end;
$$;

create or replace function public.save_admin_store_settings(p_settings jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.store_settings%rowtype;
  v_store_name text;
  v_support_phone text;
  v_bank_name text;
  v_bank_account text;
  v_account_holder text;
  v_order_notice text;
  v_shipping_fee integer;
  v_free_shipping_threshold integer;
  v_minimum_order_amount integer;
  v_is_ordering_enabled boolean;
  v_result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_settings) is distinct from 'object' then
    raise exception 'settings must be an object';
  end if;

  select *
  into v_current
  from public.store_settings
  where id = 1
  for update;

  if not found then
    raise exception 'store settings not found';
  end if;

  v_store_name := trim(coalesce(p_settings ->> 'store_name', v_current.store_name));
  v_support_phone := trim(coalesce(p_settings ->> 'support_phone', v_current.support_phone));
  v_bank_name := trim(coalesce(p_settings ->> 'bank_name', v_current.bank_name));
  v_bank_account := trim(coalesce(
    p_settings ->> 'bank_account',
    v_current.bank_account
  ));
  v_account_holder := trim(coalesce(
    p_settings ->> 'account_holder',
    v_current.account_holder
  ));
  v_order_notice := trim(coalesce(p_settings ->> 'order_notice', v_current.order_notice));
  v_shipping_fee := coalesce(
    (p_settings ->> 'shipping_fee')::integer,
    v_current.shipping_fee
  );
  v_minimum_order_amount := coalesce(
    (p_settings ->> 'minimum_order_amount')::integer,
    v_current.minimum_order_amount
  );
  v_is_ordering_enabled := coalesce(
    (p_settings ->> 'is_ordering_enabled')::boolean,
    v_current.is_ordering_enabled
  );

  if p_settings ? 'free_shipping_threshold' then
    if jsonb_typeof(p_settings -> 'free_shipping_threshold') = 'null'
       or nullif(trim(p_settings ->> 'free_shipping_threshold'), '') is null then
      v_free_shipping_threshold := null;
    else
      v_free_shipping_threshold :=
        (p_settings ->> 'free_shipping_threshold')::integer;
    end if;
  else
    v_free_shipping_threshold := v_current.free_shipping_threshold;
  end if;

  if v_store_name = '' or length(v_store_name) > 100 then
    raise exception 'invalid store name';
  end if;
  if length(v_support_phone) > 30
     or length(v_bank_name) > 100
     or length(v_bank_account) > 100
     or length(v_account_holder) > 100
     or length(v_order_notice) > 2000 then
    raise exception 'settings text is too long';
  end if;
  if v_shipping_fee < 0
     or v_minimum_order_amount < 0
     or (
       v_free_shipping_threshold is not null
       and v_free_shipping_threshold < 0
     ) then
    raise exception 'settings amounts must be non-negative';
  end if;

  update public.store_settings
  set store_name = v_store_name,
      support_phone = v_support_phone,
      bank_name = v_bank_name,
      bank_account = v_bank_account,
      account_holder = v_account_holder,
      order_notice = v_order_notice,
      shipping_fee = v_shipping_fee,
      free_shipping_threshold = v_free_shipping_threshold,
      minimum_order_amount = v_minimum_order_amount,
      is_ordering_enabled = v_is_ordering_enabled,
      updated_by = auth.uid(),
      updated_at = now()
  where id = 1
  returning jsonb_build_object(
    'store_name', store_name,
    'support_phone', support_phone,
    'bank_name', bank_name,
    'bank_account', bank_account,
    'account_holder', account_holder,
    'order_notice', order_notice,
    'shipping_fee', shipping_fee,
    'free_shipping_threshold', coalesce(free_shipping_threshold, 0),
    'minimum_order_amount', minimum_order_amount,
    'is_ordering_enabled', is_ordering_enabled,
    'updated_at', updated_at,
    'updated_by', updated_by
  ) into v_result;

  return v_result;
end;
$$;

-- The old two-argument overload would bypass idempotency if it remained exposed.
drop function if exists public.create_bank_transfer_order(jsonb, jsonb);

create or replace function public.create_bank_transfer_order(
  p_customer jsonb,
  p_items jsonb,
  p_client_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_created_at timestamptz;
  v_existing jsonb;
  v_item jsonb;
  v_product public.products%rowtype;
  v_order_item_id uuid;
  v_color_id uuid;
  v_color_name text;
  v_quantity integer;
  v_subtotal bigint := 0;
  v_shipping_fee integer := 0;
  v_total_amount bigint := 0;
  v_item_count integer := 0;
  v_pending_count integer := 0;
  v_cart_id uuid;
  v_customer_name text;
  v_customer_phone text;
  v_customer_email text;
  v_depositor_name text;
  v_shipping_address jsonb;
  v_stock_unconfirmed boolean;
  v_settings public.store_settings%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_client_request_id is null then
    raise exception 'client request id is required';
  end if;

  -- A per-account transaction lock makes the idempotency lookup and pending
  -- order limit atomic across concurrent tabs and retried HTTP requests.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 3)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 1)
  );

  select jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'subtotal', o.subtotal,
    'shipping_fee', o.shipping_fee,
    'total_amount', o.total_amount,
    'item_count', (
      select count(*)::integer
      from public.order_items oi
      where oi.order_id = o.id
    ),
    'created_at', o.created_at,
    'duplicate', true
  )
  into v_existing
  from public.orders o
  where o.user_id = v_user_id
    and o.client_request_id = p_client_request_id;

  -- A retry returns the committed result even if checkout has since been
  -- disabled or the caller no longer has the original request payload.
  if v_existing is not null then
    return v_existing;
  end if;

  if jsonb_typeof(p_customer) is distinct from 'object' then
    raise exception 'customer must be an object';
  end if;
  if length(p_customer::text) > 10000 then
    raise exception 'customer payload is too large';
  end if;
  if jsonb_typeof(p_customer -> 'name') is distinct from 'string'
     or jsonb_typeof(p_customer -> 'phone') is distinct from 'string'
     or jsonb_typeof(p_customer -> 'depositor_name') is distinct from 'string'
     or jsonb_typeof(p_customer -> 'shipping_address') is distinct from 'object'
     or jsonb_typeof(p_customer #> '{shipping_address,receiver}')
          is distinct from 'string'
     or jsonb_typeof(p_customer #> '{shipping_address,phone}')
          is distinct from 'string'
     or jsonb_typeof(p_customer #> '{shipping_address,address1}')
          is distinct from 'string'
     or (
       p_customer #> '{shipping_address,postalCode}' is not null
       and jsonb_typeof(p_customer #> '{shipping_address,postalCode}')
            not in ('string', 'null')
     )
     or (
       p_customer #> '{shipping_address,address2}' is not null
       and jsonb_typeof(p_customer #> '{shipping_address,address2}')
            not in ('string', 'null')
     )
     or (
       p_customer #> '{shipping_address,memo}' is not null
       and jsonb_typeof(p_customer #> '{shipping_address,memo}')
            not in ('string', 'null')
     ) then
    raise exception 'invalid customer fields';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'items must be an array';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'cart is empty';
  end if;
  if jsonb_array_length(p_items) > 100
     or length(p_items::text) > 100000 then
    raise exception 'too many cart items';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) is distinct from 'object'
  ) then
    raise exception 'invalid cart item';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value -> 'sku') is distinct from 'string'
       or jsonb_typeof(item.value -> 'quantity') not in ('number', 'string')
       or (
         item.value ? 'color'
         and jsonb_typeof(item.value -> 'color') not in ('string', 'null')
       )
       or nullif(trim(item.value ->> 'sku'), '') is null
       or length(trim(item.value ->> 'sku')) > 100
       or coalesce(item.value ->> 'quantity', '') !~ '^[0-9]{1,3}$'
       or length(coalesce(item.value ->> 'color', '')) > 100
  ) then
    raise exception 'invalid cart item fields';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where (item.value ->> 'quantity')::integer < 1
       or (item.value ->> 'quantity')::integer > 999
  ) then
    raise exception 'invalid item quantity';
  end if;

  v_customer_name := trim(coalesce(p_customer ->> 'name', ''));
  v_customer_phone := trim(coalesce(p_customer ->> 'phone', ''));
  v_depositor_name := trim(coalesce(p_customer ->> 'depositor_name', ''));
  v_shipping_address := p_customer -> 'shipping_address';
  v_customer_email := nullif(trim(auth.jwt() ->> 'email'), '');

  if v_customer_email is null then
    select nullif(trim(p.email), '')
    into v_customer_email
    from public.profiles p
    where p.id = v_user_id;
  end if;

  if v_customer_name = '' or length(v_customer_name) > 100 then
    raise exception 'invalid customer name';
  end if;
  if v_customer_phone = '' or length(v_customer_phone) > 30 then
    raise exception 'invalid customer phone';
  end if;
  if v_depositor_name = '' or length(v_depositor_name) > 100 then
    raise exception 'invalid depositor name';
  end if;
  if jsonb_typeof(v_shipping_address) is distinct from 'object'
     or length(v_shipping_address::text) > 4000
     or nullif(trim(v_shipping_address ->> 'receiver'), '') is null
     or nullif(trim(v_shipping_address ->> 'phone'), '') is null
     or nullif(trim(v_shipping_address ->> 'address1'), '') is null then
    raise exception 'invalid shipping address';
  end if;
  if length(v_shipping_address ->> 'receiver') > 100
     or length(v_shipping_address ->> 'phone') > 30
     or length(coalesce(v_shipping_address ->> 'postalCode', '')) > 20
     or length(v_shipping_address ->> 'address1') > 300
     or length(coalesce(v_shipping_address ->> 'address2', '')) > 300
     or length(coalesce(v_shipping_address ->> 'memo', '')) > 500 then
    raise exception 'shipping address field is too long';
  end if;

  select *
  into v_settings
  from public.store_settings
  where id = 1
  for share;

  if not found then
    raise exception 'checkout settings not found';
  end if;
  if not v_settings.is_ordering_enabled then
    raise exception 'ordering is currently disabled';
  end if;

  select count(*)::integer
  into v_pending_count
  from public.orders o
  where o.user_id = v_user_id
    and o.status = 'pending_payment';

  if v_pending_count >= 20 then
    raise exception 'too many pending orders';
  end if;

  v_order_number := 'JH-' || to_char(clock_timestamp(), 'YYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    order_number,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    status,
    payment_method,
    payment_status,
    bank_depositor_name,
    subtotal,
    shipping_fee,
    total_amount,
    shipping_address,
    client_request_id
  )
  values (
    v_order_number,
    v_user_id,
    v_customer_name,
    v_customer_phone,
    v_customer_email,
    'pending_payment',
    'bank_transfer',
    'pending',
    v_depositor_name,
    0,
    0,
    0,
    v_shipping_address,
    p_client_request_id
  )
  on conflict (user_id, client_request_id)
    where user_id is not null and client_request_id is not null
  do nothing
  returning id, created_at
  into v_order_id, v_created_at;

  if not found then
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'subtotal', o.subtotal,
      'shipping_fee', o.shipping_fee,
      'total_amount', o.total_amount,
      'item_count', (
        select count(*)::integer
        from public.order_items oi
        where oi.order_id = o.id
      ),
      'created_at', o.created_at,
      'duplicate', true
    )
    into v_existing
    from public.orders o
    where o.user_id = v_user_id
      and o.client_request_id = p_client_request_id;

    if v_existing is null then
      raise exception 'could not resolve idempotent order';
    end if;
    return v_existing;
  end if;

  insert into public.order_status_history (
    order_id, from_status, to_status, changed_by, note
  )
  values (
    v_order_id, null, 'pending_payment', v_user_id, 'order_created'
  );

  for v_item in
    select jsonb_build_object(
      'sku', parsed.sku,
      'color', parsed.color_name,
      'quantity', sum(parsed.quantity)
    )
    from (
      select
        upper(trim(item.value ->> 'sku')) as sku,
        nullif(trim(coalesce(item.value ->> 'color', '')), '') as color_name,
        (item.value ->> 'quantity')::integer as quantity
      from jsonb_array_elements(p_items) as item(value)
    ) parsed
    group by parsed.sku, parsed.color_name
    order by parsed.sku, parsed.color_name nulls first
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 999 then
      raise exception 'combined item quantity is invalid';
    end if;

    select p.*
    into v_product
    from public.products p
    where p.sku = v_item ->> 'sku'
      and p.is_active = true
    for update;

    if not found then
      raise exception 'unavailable product: %', v_item ->> 'sku';
    end if;

    v_color_name := nullif(trim(v_item ->> 'color'), '');
    v_color_id := null;

    if v_color_name is not null then
      select pc.id
      into v_color_id
      from public.product_colors pc
      where pc.product_id = v_product.id
        and pc.name = v_color_name;

      if not found then
        raise exception 'unavailable color: %', v_color_name;
      end if;
    elsif exists (
      select 1
      from public.product_colors pc
      where pc.product_id = v_product.id
    ) then
      raise exception 'color is required for product: %', v_product.sku;
    end if;

    if v_product.price::bigint * v_quantity::bigint > 2147483647 then
      raise exception 'order amount is too large';
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      sku,
      color_name,
      sales_unit,
      bush_count,
      quantity,
      unit_price,
      line_total
    )
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.sku,
      v_color_name,
      v_product.sales_unit,
      v_product.bush_count,
      v_quantity,
      v_product.price,
      (v_product.price::bigint * v_quantity)::integer
    )
    returning id into v_order_item_id;

    v_stock_unconfirmed := coalesce(
      (v_product.metadata ->> 'stock_unconfirmed')::boolean,
      false
    );

    if not v_stock_unconfirmed then
      update public.products
      set stock_quantity = stock_quantity - v_quantity
      where id = v_product.id
        and stock_quantity >= v_quantity;

      if not found then
        raise exception 'insufficient stock: %', v_product.sku;
      end if;

      insert into public.inventory_movements (
        product_id,
        color_id,
        order_id,
        order_item_id,
        quantity_delta,
        reason
      )
      values (
        v_product.id,
        v_color_id,
        v_order_id,
        v_order_item_id,
        -v_quantity,
        'order_created'
      );
    end if;

    v_subtotal :=
      v_subtotal + (v_product.price::bigint * v_quantity::bigint);
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'cart is empty';
  end if;
  if v_subtotal < v_settings.minimum_order_amount then
    raise exception 'minimum order amount is %', v_settings.minimum_order_amount;
  end if;

  v_shipping_fee := case
    when v_settings.free_shipping_threshold is not null
      and v_settings.free_shipping_threshold > 0
      and v_subtotal >= v_settings.free_shipping_threshold
      then 0
    else v_settings.shipping_fee
  end;
  v_total_amount := v_subtotal + v_shipping_fee::bigint;

  if v_subtotal > 2147483647 or v_total_amount > 2147483647 then
    raise exception 'order amount is too large';
  end if;

  update public.orders
  set subtotal = v_subtotal::integer,
      shipping_fee = v_shipping_fee,
      total_amount = v_total_amount::integer,
      updated_at = now()
  where id = v_order_id;

  -- Update only customer-owned profile fields, using the authenticated email.
  insert into public.profiles (
    id, email, name, phone, default_shipping_address
  )
  values (
    v_user_id,
    v_customer_email,
    v_customer_name,
    v_customer_phone,
    v_shipping_address
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email),
      name = excluded.name,
      phone = excluded.phone,
      default_shipping_address = excluded.default_shipping_address,
      updated_at = now();

  select c.id
  into v_cart_id
  from public.carts c
  where c.user_id = v_user_id;

  if v_cart_id is not null then
    delete from public.cart_items where cart_id = v_cart_id;
    update public.carts set updated_at = now() where id = v_cart_id;
  end if;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'pending_payment',
    'payment_status', 'pending',
    'subtotal', v_subtotal::integer,
    'shipping_fee', v_shipping_fee,
    'total_amount', v_total_amount::integer,
    'item_count', v_item_count,
    'created_at', v_created_at,
    'duplicate', false
  );
end;
$$;

-- Restore only stock that was actually deducted. The unique item/reason index
-- makes this safe across retries and concurrent administrator actions.
create or replace function private.restore_order_inventory(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_movement record;
  v_restore_id uuid;
  v_restored integer := 0;
begin
  for v_movement in
    select
      im.id,
      im.order_item_id,
      im.product_id,
      im.color_id,
      im.order_id,
      im.quantity_delta
    from public.inventory_movements im
    join public.products p on p.id = im.product_id
    where im.order_id = p_order_id
      and im.order_item_id is not null
      and im.reason = 'order_created'
      and im.quantity_delta < 0
    order by p.sku, im.id
    for update of im
  loop
    v_restore_id := null;

    insert into public.inventory_movements (
      product_id,
      color_id,
      order_id,
      order_item_id,
      quantity_delta,
      reason
    )
    values (
      v_movement.product_id,
      v_movement.color_id,
      v_movement.order_id,
      v_movement.order_item_id,
      -v_movement.quantity_delta,
      'order_cancelled'
    )
    on conflict do nothing
    returning id into v_restore_id;

    if v_restore_id is not null then
      update public.products
      set stock_quantity = stock_quantity - v_movement.quantity_delta
      where id = v_movement.product_id;
      v_restored := v_restored + 1;
    end if;
  end loop;

  return v_restored;
end;
$$;

create or replace function public.cancel_my_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select o.*
  into v_order
  from public.orders o
  where o.id = p_order_id
    and o.user_id = v_user_id
  for update;

  if not found then
    raise exception 'order not found';
  end if;

  if v_order.status = 'cancelled' then
    return jsonb_build_object(
      'id', v_order.id,
      'order_number', v_order.order_number,
      'status', v_order.status,
      'cancelled_at', v_order.cancelled_at,
      'already_cancelled', true
    );
  end if;

  if v_order.status <> 'pending_payment' then
    raise exception 'only pending-payment orders can be cancelled';
  end if;

  perform private.restore_order_inventory(v_order.id);

  update public.orders
  set status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  where id = v_order.id;

  insert into public.order_status_history (
    order_id, from_status, to_status, changed_by, note
  )
  values (
    v_order.id,
    v_order.status,
    'cancelled',
    v_user_id,
    'cancelled_by_customer'
  );

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', 'cancelled',
    'cancelled_at', now(),
    'already_cancelled', false
  );
end;
$$;

create or replace function public.update_admin_order(
  p_order_id uuid,
  p_status text,
  p_courier_code text default null,
  p_tracking_number text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_courier_code text;
  v_tracking_number text;
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if p_status is null or p_status not in (
    'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'
  ) then
    raise exception 'invalid order status';
  end if;

  select o.*
  into v_order
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'order not found';
  end if;

  if p_status <> v_order.status
     and not (
       (v_order.status = 'pending_payment' and p_status in ('paid', 'cancelled'))
       or (v_order.status = 'paid' and p_status in ('preparing', 'cancelled'))
       or (v_order.status = 'preparing' and p_status in ('shipped', 'cancelled'))
       or (v_order.status = 'shipped' and p_status = 'delivered')
     ) then
    raise exception 'invalid status transition: % -> %', v_order.status, p_status;
  end if;

  v_courier_code := coalesce(
    nullif(trim(p_courier_code), ''),
    v_order.courier_code
  );
  v_tracking_number := coalesce(
    nullif(trim(p_tracking_number), ''),
    v_order.tracking_number
  );

  if length(coalesce(v_courier_code, '')) > 100
     or length(coalesce(v_tracking_number, '')) > 100 then
    raise exception 'shipping information is too long';
  end if;

  if p_status in ('shipped', 'delivered')
     and (
       nullif(trim(coalesce(v_courier_code, '')), '') is null
       or nullif(trim(coalesce(v_tracking_number, '')), '') is null
     ) then
    raise exception 'courier and tracking number are required';
  end if;

  if p_status = 'cancelled' and v_order.status <> 'cancelled' then
    perform private.restore_order_inventory(v_order.id);
  end if;

  update public.orders
  set status = p_status,
      payment_status = case
        when p_status in ('paid', 'preparing', 'shipped', 'delivered')
          then 'confirmed'
        when p_status = 'cancelled' and v_order.payment_status = 'confirmed'
          then 'refunded'
        else v_order.payment_status
      end,
      courier_code = v_courier_code,
      tracking_number = v_tracking_number,
      paid_at = case
        when p_status in ('paid', 'preparing', 'shipped', 'delivered')
          then coalesce(v_order.paid_at, now())
        else v_order.paid_at
      end,
      shipped_at = case
        when p_status in ('shipped', 'delivered')
          then coalesce(v_order.shipped_at, now())
        else v_order.shipped_at
      end,
      delivered_at = case
        when p_status = 'delivered'
          then coalesce(v_order.delivered_at, now())
        else v_order.delivered_at
      end,
      cancelled_at = case
        when p_status = 'cancelled'
          then coalesce(v_order.cancelled_at, now())
        else v_order.cancelled_at
      end,
      updated_at = now()
  where id = v_order.id;

  if p_status <> v_order.status then
    insert into public.order_status_history (
      order_id, from_status, to_status, changed_by, note
    )
    values (
      v_order.id,
      v_order.status,
      p_status,
      auth.uid(),
      case
        when p_status = 'cancelled' then 'cancelled_by_admin'
        else 'updated_by_admin'
      end
    );
  end if;

  return true;
end;
$$;

create or replace function public.list_my_orders()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'status', o.status,
      'payment_status', o.payment_status,
      'subtotal', o.subtotal,
      'shipping_fee', o.shipping_fee,
      'total_amount', o.total_amount,
      'tracking_number', o.tracking_number,
      'courier_code', o.courier_code,
      'paid_at', o.paid_at,
      'shipped_at', o.shipped_at,
      'delivered_at', o.delivered_at,
      'cancelled_at', o.cancelled_at,
      'created_at', o.created_at,
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'sku', oi.sku,
          'product_name', oi.product_name,
          'color_name', oi.color_name,
          'quantity', oi.quantity,
          'sales_unit', oi.sales_unit,
          'unit_price', oi.unit_price,
          'line_total', oi.line_total
        ) order by oi.created_at, oi.id)
        from public.order_items oi
        where oi.order_id = o.id
      ), '[]'::jsonb)
    ) order by o.created_at desc, o.id desc), '[]'::jsonb)
    from (
      select recent.*
      from public.orders recent
      where recent.user_id = v_user_id
      order by recent.created_at desc, recent.id desc
      limit 100
    ) o
  );
end;
$$;

create or replace function public.list_admin_orders()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_last_seen timestamptz;
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  select a.last_seen_order_at
  into v_last_seen
  from public.admins a
  where a.user_id = auth.uid();

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'customer_name', o.customer_name,
      'customer_phone', o.customer_phone,
      'customer_email', o.customer_email,
      'depositor_name', o.bank_depositor_name,
      'shipping_address', o.shipping_address,
      'status', o.status,
      'payment_status', o.payment_status,
      'payment_method', o.payment_method,
      'subtotal', o.subtotal,
      'shipping_fee', o.shipping_fee,
      'total_amount', o.total_amount,
      'tracking_number', o.tracking_number,
      'courier_code', o.courier_code,
      'paid_at', o.paid_at,
      'shipped_at', o.shipped_at,
      'delivered_at', o.delivered_at,
      'cancelled_at', o.cancelled_at,
      'created_at', o.created_at,
      'updated_at', o.updated_at,
      'item_count', (
        select count(*)::integer
        from public.order_items oi
        where oi.order_id = o.id
      ),
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'sku', oi.sku,
          'product_name', oi.product_name,
          'color_name', oi.color_name,
          'sales_unit', oi.sales_unit,
          'bush_count', oi.bush_count,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'line_total', oi.line_total,
          'created_at', oi.created_at
        ) order by oi.created_at, oi.id)
        from public.order_items oi
        where oi.order_id = o.id
      ), '[]'::jsonb),
      'is_new', o.created_at > coalesce(
        v_last_seen,
        '1970-01-01 00:00:00+00'::timestamptz
      )
    ) order by o.created_at desc, o.id desc), '[]'::jsonb)
    from (
      select recent.*
      from public.orders recent
      order by recent.created_at desc, recent.id desc
      limit 100
    ) o
  );
end;
$$;

create or replace function public.list_admin_customers()
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  return (
    with selected_profiles as (
      select
        p.id,
        p.email,
        p.name,
        p.phone,
        p.default_shipping_address,
        p.created_at,
        p.updated_at
      from public.profiles p
      order by p.created_at desc, p.id desc
      limit 500
    )
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', customer.id,
      'email', customer.email,
      'name', customer.name,
      'phone', customer.phone,
      'default_shipping_address', customer.default_shipping_address,
      'admin_note', coalesce(notes.admin_note, ''),
      'created_at', customer.created_at,
      'updated_at', customer.updated_at,
      'order_count', stats.order_count,
      'total_spent', stats.total_spent,
      'last_order_at', stats.last_order_at
    ) order by customer.created_at desc, customer.id desc), '[]'::jsonb)
    from selected_profiles customer
    left join private.customer_admin_notes notes
      on notes.user_id = customer.id
    left join lateral (
      select
        count(o.id)::integer as order_count,
        coalesce(sum(o.total_amount), 0)::bigint as total_spent,
        max(o.created_at) as last_order_at
      from public.orders o
      where o.user_id = customer.id
        and o.status <> 'cancelled'
    ) stats on true
  );
end;
$$;

create or replace function public.update_admin_customer_note(
  p_user_id uuid,
  p_admin_note text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text := trim(coalesce(p_admin_note, ''));
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if length(v_note) > 1000 then
    raise exception 'admin note is too long';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_user_id
  ) then
    raise exception 'customer not found';
  end if;

  if v_note = '' then
    delete from private.customer_admin_notes
    where user_id = p_user_id;
  else
    insert into private.customer_admin_notes (
      user_id, admin_note, updated_by
    )
    values (
      p_user_id, v_note, auth.uid()
    )
    on conflict (user_id) do update
    set admin_note = excluded.admin_note,
        updated_by = excluded.updated_by,
        updated_at = now();
  end if;

  return true;
end;
$$;

-- Harden every pre-existing SECURITY DEFINER function that remains callable.
alter function public.handle_new_user() set search_path = '';
alter function public.merge_user_cart(jsonb) set search_path = '';
alter function public.sync_user_cart(jsonb) set search_path = '';
alter function public.is_current_user_admin() set search_path = '';
alter function public.mark_admin_orders_seen() set search_path = '';
alter function public.list_admin_products() set search_path = '';
alter function public.save_admin_product(jsonb) set search_path = '';

revoke all on function public.handle_new_user()
  from public, anon, authenticated;

revoke all on function public.save_my_profile(jsonb)
  from public, anon, authenticated;
revoke all on function public.merge_user_favorites(jsonb)
  from public, anon, authenticated;
revoke all on function public.sync_user_favorites(jsonb)
  from public, anon, authenticated;
revoke all on function public.get_checkout_settings()
  from public, anon, authenticated;
revoke all on function public.get_admin_store_settings()
  from public, anon, authenticated;
revoke all on function public.save_admin_store_settings(jsonb)
  from public, anon, authenticated;
revoke all on function public.create_bank_transfer_order(jsonb, jsonb, uuid)
  from public, anon, authenticated;
revoke all on function public.cancel_my_order(uuid)
  from public, anon, authenticated;
revoke all on function public.list_my_orders()
  from public, anon, authenticated;
revoke all on function public.list_admin_orders()
  from public, anon, authenticated;
revoke all on function public.update_admin_order(uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.list_admin_customers()
  from public, anon, authenticated;
revoke all on function public.update_admin_customer_note(uuid, text)
  from public, anon, authenticated;
revoke all on function private.restore_order_inventory(uuid)
  from public, anon, authenticated;

grant execute on function public.save_my_profile(jsonb) to authenticated;
grant execute on function public.merge_user_favorites(jsonb) to authenticated;
grant execute on function public.sync_user_favorites(jsonb) to authenticated;
grant execute on function public.get_checkout_settings() to authenticated;
grant execute on function public.get_admin_store_settings() to authenticated;
grant execute on function public.save_admin_store_settings(jsonb) to authenticated;
grant execute on function public.create_bank_transfer_order(jsonb, jsonb, uuid)
  to authenticated;
grant execute on function public.cancel_my_order(uuid) to authenticated;
grant execute on function public.list_my_orders() to authenticated;
grant execute on function public.list_admin_orders() to authenticated;
grant execute on function public.update_admin_order(uuid, text, text, text)
  to authenticated;
grant execute on function public.list_admin_customers() to authenticated;
grant execute on function public.update_admin_customer_note(uuid, text)
  to authenticated;

-- Preserve the explicit grants for pre-existing browser RPCs after hardening.
revoke all on function public.merge_user_cart(jsonb)
  from public, anon, authenticated;
revoke all on function public.sync_user_cart(jsonb)
  from public, anon, authenticated;
revoke all on function public.is_current_user_admin()
  from public, anon, authenticated;
revoke all on function public.mark_admin_orders_seen()
  from public, anon, authenticated;
revoke all on function public.list_admin_products()
  from public, anon, authenticated;
revoke all on function public.save_admin_product(jsonb)
  from public, anon, authenticated;

grant execute on function public.merge_user_cart(jsonb) to authenticated;
grant execute on function public.sync_user_cart(jsonb) to authenticated;
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.mark_admin_orders_seen() to authenticated;
grant execute on function public.list_admin_products() to authenticated;
grant execute on function public.save_admin_product(jsonb) to authenticated;

commit;
