begin;

create index if not exists orders_user_created_idx
  on public.orders(user_id, created_at desc);

create index if not exists orders_status_created_idx
  on public.orders(status, created_at desc);

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null
    and exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.create_bank_transfer_order(
  p_customer jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_color_name text;
  v_quantity integer;
  v_subtotal integer := 0;
  v_item_count integer := 0;
  v_cart_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'cart is empty';
  end if;

  if nullif(trim(p_customer ->> 'name'), '') is null
     or nullif(trim(p_customer ->> 'phone'), '') is null
     or nullif(trim(p_customer ->> 'depositor_name'), '') is null
     or nullif(trim(p_customer #>> '{shipping_address,address1}'), '') is null then
    raise exception 'required customer fields are missing';
  end if;

  v_order_number := 'JH-' || to_char(clock_timestamp(), 'YYMMDD') || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    status, payment_method, payment_status, bank_depositor_name,
    subtotal, shipping_fee, total_amount, shipping_address
  ) values (
    v_order_number,
    v_user_id,
    trim(p_customer ->> 'name'),
    trim(p_customer ->> 'phone'),
    nullif(trim(p_customer ->> 'email'), ''),
    'pending_payment',
    'bank_transfer',
    'pending',
    trim(p_customer ->> 'depositor_name'),
    0,
    0,
    0,
    coalesce(p_customer -> 'shipping_address', '{}'::jsonb)
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from public.products
    where sku = v_item ->> 'sku' and is_active = true;

    if not found then
      raise exception 'unavailable product: %', v_item ->> 'sku';
    end if;

    v_quantity := greatest(1, least(999, coalesce((v_item ->> 'quantity')::integer, 1)));
    v_color_name := nullif(trim(v_item ->> 'color'), '');

    if v_color_name is not null and not exists (
      select 1 from public.product_colors
      where product_id = v_product.id and name = v_color_name
    ) then
      raise exception 'unavailable color: %', v_color_name;
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, sku, color_name,
      sales_unit, bush_count, quantity, unit_price, line_total
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.sku, v_color_name,
      v_product.sales_unit, v_product.bush_count, v_quantity,
      v_product.price, v_product.price * v_quantity
    );

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'cart is empty';
  end if;

  update public.orders
  set subtotal = v_subtotal,
      total_amount = v_subtotal,
      updated_at = now()
  where id = v_order_id;

  select id into v_cart_id from public.carts where user_id = v_user_id;
  if v_cart_id is not null then
    delete from public.cart_items where cart_id = v_cart_id;
    update public.carts set updated_at = now() where id = v_cart_id;
  end if;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'pending_payment',
    'total_amount', v_subtotal,
    'item_count', v_item_count,
    'created_at', now()
  );
end;
$$;

create or replace function public.list_my_orders()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'total_amount', o.total_amount,
    'tracking_number', o.tracking_number,
    'courier_code', o.courier_code,
    'created_at', o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'color_name', oi.color_name,
        'quantity', oi.quantity,
        'sales_unit', oi.sales_unit,
        'line_total', oi.line_total
      ) order by oi.created_at)
      from public.order_items oi where oi.order_id = o.id
    ), '[]'::jsonb)
  ) order by o.created_at desc), '[]'::jsonb)
  from public.orders o
  where o.user_id = auth.uid();
$$;

create or replace function public.list_admin_orders()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'customer_name', o.customer_name,
      'customer_phone', o.customer_phone,
      'depositor_name', o.bank_depositor_name,
      'status', o.status,
      'payment_status', o.payment_status,
      'total_amount', o.total_amount,
      'tracking_number', o.tracking_number,
      'courier_code', o.courier_code,
      'created_at', o.created_at,
      'item_count', (select count(*) from public.order_items oi where oi.order_id = o.id)
    ) order by o.created_at desc), '[]'::jsonb)
    from (select * from public.orders order by created_at desc limit 100) o
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
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if p_status not in ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'invalid order status';
  end if;

  update public.orders
  set status = p_status,
      payment_status = case
        when p_status in ('paid', 'preparing', 'shipped', 'delivered') then 'confirmed'
        when p_status = 'cancelled' and payment_status = 'confirmed' then 'refunded'
        else payment_status
      end,
      courier_code = coalesce(nullif(trim(p_courier_code), ''), courier_code),
      tracking_number = coalesce(nullif(trim(p_tracking_number), ''), tracking_number),
      paid_at = case
        when p_status in ('paid', 'preparing', 'shipped', 'delivered') then coalesce(paid_at, now())
        else paid_at
      end,
      shipped_at = case
        when p_status in ('shipped', 'delivered') then coalesce(shipped_at, now())
        else shipped_at
      end,
      updated_at = now()
  where id = p_order_id;

  if not found then raise exception 'order not found'; end if;
  return true;
end;
$$;

revoke all on function public.is_current_user_admin() from public, anon;
revoke all on function public.create_bank_transfer_order(jsonb, jsonb) from public, anon;
revoke all on function public.list_my_orders() from public, anon;
revoke all on function public.list_admin_orders() from public, anon;
revoke all on function public.update_admin_order(uuid, text, text, text) from public, anon;

grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.create_bank_transfer_order(jsonb, jsonb) to authenticated;
grant execute on function public.list_my_orders() to authenticated;
grant execute on function public.list_admin_orders() to authenticated;
grant execute on function public.update_admin_order(uuid, text, text, text) to authenticated;

commit;
