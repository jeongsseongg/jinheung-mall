begin;

alter table public.admins
  add column if not exists last_seen_order_at timestamptz not null
  default '1970-01-01 00:00:00+00';

create or replace function public.list_admin_orders()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_last_seen timestamptz;
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  select last_seen_order_at into v_last_seen
  from public.admins
  where user_id = auth.uid();

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
      'item_count', (select count(*) from public.order_items oi where oi.order_id = o.id),
      'is_new', o.created_at > coalesce(v_last_seen, '1970-01-01 00:00:00+00'::timestamptz)
    ) order by o.created_at desc), '[]'::jsonb)
    from (select * from public.orders order by created_at desc limit 100) o
  );
end;
$$;

create or replace function public.mark_admin_orders_seen()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seen_at timestamptz := now();
begin
  if not public.is_current_user_admin() then
    raise exception 'admin permission required' using errcode = '42501';
  end if;

  update public.admins
  set last_seen_order_at = v_seen_at
  where user_id = auth.uid();

  return v_seen_at;
end;
$$;

revoke all on function public.list_admin_orders() from public, anon;
revoke all on function public.mark_admin_orders_seen() from public, anon;
grant execute on function public.list_admin_orders() to authenticated;
grant execute on function public.mark_admin_orders_seen() to authenticated;

commit;
