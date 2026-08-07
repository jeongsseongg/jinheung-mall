begin;

alter table public.profiles
  add column if not exists admin_note text not null default '';

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
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', customer.id,
      'email', customer.email,
      'name', customer.name,
      'phone', customer.phone,
      'default_shipping_address', customer.default_shipping_address,
      'admin_note', customer.admin_note,
      'created_at', customer.created_at,
      'updated_at', customer.updated_at,
      'order_count', customer.order_count,
      'total_spent', customer.total_spent,
      'last_order_at', customer.last_order_at
    ) order by customer.created_at desc), '[]'::jsonb)
    from (
      select
        p.id,
        p.email,
        p.name,
        p.phone,
        p.default_shipping_address,
        p.admin_note,
        p.created_at,
        p.updated_at,
        count(o.id) filter (where o.status <> 'cancelled')::integer as order_count,
        coalesce(sum(o.total_amount) filter (where o.status <> 'cancelled'), 0)::integer as total_spent,
        max(o.created_at) filter (where o.status <> 'cancelled') as last_order_at
      from public.profiles p
      left join public.orders o on o.user_id = p.id
      group by p.id
      order by p.created_at desc
      limit 500
    ) customer
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
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  if length(coalesce(p_admin_note, '')) > 1000 then
    raise exception 'admin note is too long';
  end if;

  update public.profiles
  set admin_note = trim(coalesce(p_admin_note, '')),
      updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'customer not found';
  end if;

  return true;
end;
$$;

revoke all on function public.list_admin_customers() from public, anon;
revoke all on function public.update_admin_customer_note(uuid, text) from public, anon;
grant execute on function public.list_admin_customers() to authenticated;
grant execute on function public.update_admin_customer_note(uuid, text) to authenticated;

commit;
