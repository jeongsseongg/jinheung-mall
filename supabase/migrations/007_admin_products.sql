begin;

create or replace function public.list_admin_products()
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
      'id', p.id,
      'sku', p.sku,
      'slug', p.slug,
      'name', p.name,
      'description', p.description,
      'price', p.price,
      'bush_count', p.bush_count,
      'sales_unit', p.sales_unit,
      'stock_quantity', p.stock_quantity,
      'image_url', p.image_url,
      'is_active', p.is_active,
      'metadata', p.metadata,
      'colors', coalesce((
        select jsonb_agg(jsonb_build_object(
          'name', pc.name,
          'stock_quantity', pc.stock_quantity,
          'sort_order', pc.sort_order
        ) order by pc.sort_order, pc.name)
        from public.product_colors pc
        where pc.product_id = p.id
      ), '[]'::jsonb)
    ) order by p.sku), '[]'::jsonb)
    from public.products p
  );
end;
$$;

create or replace function public.save_admin_product(p_product jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_sku text := upper(trim(coalesce(p_product ->> 'sku', '')));
  v_name text := trim(coalesce(p_product ->> 'name', ''));
  v_description text := trim(coalesce(p_product ->> 'description', ''));
  v_price integer := coalesce((p_product ->> 'price')::integer, 0);
  v_bush_count integer := nullif(p_product ->> 'bush_count', '')::integer;
  v_sales_unit text := coalesce(nullif(trim(p_product ->> 'sales_unit'), ''), '단');
  v_stock_quantity integer := coalesce((p_product ->> 'stock_quantity')::integer, 0);
  v_image_url text := nullif(trim(p_product ->> 'image_url'), '');
  v_is_active boolean := coalesce((p_product ->> 'is_active')::boolean, true);
  v_stock_unconfirmed boolean := coalesce((p_product ->> 'stock_unconfirmed')::boolean, false);
  v_note text := nullif(trim(p_product ->> 'note'), '');
  v_specification text := nullif(trim(p_product ->> 'specification'), '');
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;
  if v_name = '' then raise exception 'product name required'; end if;
  if v_price < 0 then raise exception 'invalid price'; end if;
  if v_stock_quantity < 0 then raise exception 'invalid stock quantity'; end if;
  if v_bush_count is not null and v_bush_count <= 0 then raise exception 'invalid bush count'; end if;
  if v_sales_unit not in ('단', '박스', '카톤') then raise exception 'invalid sales unit'; end if;

  if v_sku = '' then
    select 'JH-FL-' || lpad((coalesce(max(nullif(regexp_replace(sku, '[^0-9]', '', 'g'), '')::integer), 0) + 1)::text, 3, '0')
    into v_sku from public.products;
  end if;

  if nullif(p_product ->> 'id', '') is null then
    insert into public.products (
      sku, slug, name, description, price, bush_count, sales_unit,
      stock_quantity, image_url, is_active, metadata
    ) values (
      v_sku, lower(replace(v_sku, '_', '-')), v_name, v_description, v_price,
      v_bush_count, v_sales_unit, v_stock_quantity, v_image_url, v_is_active,
      jsonb_strip_nulls(jsonb_build_object(
        'specification', v_specification,
        'note', v_note,
        'stock_unconfirmed', v_stock_unconfirmed
      ))
    ) returning id into v_id;
  else
    v_id := (p_product ->> 'id')::uuid;
    update public.products set
      sku = v_sku,
      slug = lower(replace(v_sku, '_', '-')),
      name = v_name,
      description = v_description,
      price = v_price,
      bush_count = v_bush_count,
      sales_unit = v_sales_unit,
      stock_quantity = v_stock_quantity,
      image_url = v_image_url,
      is_active = v_is_active,
      metadata = jsonb_strip_nulls(jsonb_build_object(
        'specification', v_specification,
        'note', v_note,
        'stock_unconfirmed', v_stock_unconfirmed
      ))
    where id = v_id;
    if not found then raise exception 'product not found'; end if;
  end if;

  delete from public.product_colors where product_id = v_id;
  insert into public.product_colors (product_id, name, stock_quantity, sort_order)
  select v_id, trim(color.value), 0, color.ordinality - 1
  from jsonb_array_elements_text(coalesce(p_product -> 'colors', '[]'::jsonb)) with ordinality as color(value, ordinality)
  where trim(color.value) <> '';

  return v_id;
end;
$$;

revoke all on function public.list_admin_products() from public, anon;
revoke all on function public.save_admin_product(jsonb) from public, anon;
grant execute on function public.list_admin_products() to authenticated;
grant execute on function public.save_admin_product(jsonb) to authenticated;

commit;
