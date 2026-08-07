begin;

create unique index if not exists cart_items_one_product_per_cart
  on public.cart_items(cart_id, product_id);

create or replace function public.merge_user_cart(p_items jsonb default '[]'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_color_id uuid;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) where user_id is not null
  do update set updated_at = now()
  returning id into v_cart_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_quantity := greatest(1, least(999, coalesce((v_item ->> 'quantity')::integer, 1)));
    select id into v_product_id from public.products where sku = v_item ->> 'sku' and is_active = true;
    if v_product_id is null then continue; end if;

    v_color_id := null;
    if nullif(v_item ->> 'color', '') is not null then
      select id into v_color_id
      from public.product_colors
      where product_id = v_product_id and name = v_item ->> 'color'
      limit 1;
    end if;

    insert into public.cart_items (cart_id, product_id, color_id, quantity)
    values (v_cart_id, v_product_id, v_color_id, v_quantity)
    on conflict (cart_id, product_id)
    do update set
      color_id = coalesce(excluded.color_id, public.cart_items.color_id),
      quantity = greatest(public.cart_items.quantity, excluded.quantity),
      updated_at = now();
  end loop;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'sku', p.sku,
      'quantity', ci.quantity,
      'color', pc.name
    ) order by p.sku), '[]'::jsonb)
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    left join public.product_colors pc on pc.id = ci.color_id
    where ci.cart_id = v_cart_id
  );
end;
$$;

create or replace function public.sync_user_cart(p_items jsonb default '[]'::jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_color_id uuid;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) where user_id is not null
  do update set updated_at = now()
  returning id into v_cart_id;

  delete from public.cart_items where cart_id = v_cart_id;

  for v_item in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_quantity := greatest(1, least(999, coalesce((v_item ->> 'quantity')::integer, 1)));
    select id into v_product_id from public.products where sku = v_item ->> 'sku' and is_active = true;
    if v_product_id is null then continue; end if;

    v_color_id := null;
    if nullif(v_item ->> 'color', '') is not null then
      select id into v_color_id
      from public.product_colors
      where product_id = v_product_id and name = v_item ->> 'color'
      limit 1;
    end if;

    insert into public.cart_items (cart_id, product_id, color_id, quantity)
    values (v_cart_id, v_product_id, v_color_id, v_quantity)
    on conflict (cart_id, product_id)
    do update set color_id = excluded.color_id, quantity = excluded.quantity, updated_at = now();
  end loop;

  update public.carts set updated_at = now() where id = v_cart_id;
  return true;
end;
$$;

revoke all on function public.merge_user_cart(jsonb) from public, anon;
revoke all on function public.sync_user_cart(jsonb) from public, anon;
grant execute on function public.merge_user_cart(jsonb) to authenticated;
grant execute on function public.sync_user_cart(jsonb) to authenticated;

commit;
