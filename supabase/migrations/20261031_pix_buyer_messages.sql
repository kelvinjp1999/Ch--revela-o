-- Armazena, de forma opcional, o nome e o recado associado a cada cota.
alter table public.pix_payment_requests
  add column if not exists buyer_name text,
  add column if not exists buyer_message text;

drop function if exists public.create_pix_payment_request(bigint);
create or replace function public.create_pix_payment_request(
  p_gift_id bigint,
  p_buyer_name text default null,
  p_buyer_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_name text;
  v_quota_value numeric(10, 2);
  v_request_id uuid;
  v_buyer_name text := nullif(trim(p_buyer_name), '');
  v_buyer_message text := nullif(trim(p_buyer_message), '');
begin
  if v_buyer_name is not null and char_length(v_buyer_name) > 100 then
    raise exception 'O nome deve ter no máximo 100 caracteres';
  end if;
  if v_buyer_message is not null and char_length(v_buyer_message) > 500 then
    raise exception 'A mensagem deve ter no máximo 500 caracteres';
  end if;

  select name, price into v_product_name, v_quota_value
  from gifts where id = p_gift_id;
  if not found then raise exception 'Presente não encontrado'; end if;

  insert into pix_payment_requests (gift_id, product_name, quota_value, buyer_name, buyer_message)
  values (p_gift_id, v_product_name, v_quota_value, v_buyer_name, v_buyer_message)
  returning id into v_request_id;
  return v_request_id;
end;
$$;

drop function if exists public.admin_list_pending_pix_payment_requests();
create function public.admin_list_pending_pix_payment_requests()
returns table (
  id uuid,
  product_name text,
  quota_value numeric,
  status public.pix_payment_status,
  created_at timestamptz,
  buyer_name text,
  buyer_message text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query
    select p.id, p.product_name, p.quota_value, p.status, p.created_at, p.buyer_name, p.buyer_message
    from pix_payment_requests p
    where p.status = 'pendente'
    order by p.created_at asc;
end;
$$;

create or replace function public.admin_list_pix_buyer_messages()
returns table (
  id uuid,
  product_name text,
  buyer_name text,
  buyer_message text,
  created_at timestamptz,
  status public.pix_payment_status
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query
    select p.id, p.product_name, p.buyer_name, p.buyer_message, p.created_at, p.status
    from pix_payment_requests p
    where nullif(trim(coalesce(p.buyer_name, '')), '') is not null
       or nullif(trim(coalesce(p.buyer_message, '')), '') is not null
    order by p.created_at desc;
end;
$$;

revoke all on function public.create_pix_payment_request(bigint, text, text) from public;
grant execute on function public.create_pix_payment_request(bigint, text, text) to anon, authenticated;
revoke all on function public.admin_list_pending_pix_payment_requests(), public.admin_list_pix_buyer_messages() from public;
grant execute on function public.admin_list_pending_pix_payment_requests(), public.admin_list_pix_buyer_messages() to authenticated;
