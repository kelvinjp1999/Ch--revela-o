-- Execute no SQL Editor do Supabase para aplicar o fluxo de confirmação Pix.
create type public.pix_payment_status as enum ('pendente', 'confirmada', 'cancelada');

create table public.pix_payment_requests (
  id uuid primary key default gen_random_uuid(),
  gift_id bigint not null references public.gifts(id),
  product_name text not null,
  quota_value numeric(10, 2) not null check (quota_value >= 0),
  status public.pix_payment_status not null default 'pendente',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index pix_payment_requests_gift_status_idx on public.pix_payment_requests (gift_id, status);

alter table public.pix_payment_requests enable row level security;

create or replace function public.create_pix_payment_request(p_gift_id bigint)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_product_name text;
  v_quota_value numeric(10, 2);
  v_request_id uuid;
begin
  select name, price into v_product_name, v_quota_value from gifts where id = p_gift_id;
  if not found then raise exception 'Presente não encontrado'; end if;

  insert into pix_payment_requests (gift_id, product_name, quota_value)
  values (p_gift_id, v_product_name, v_quota_value)
  returning id into v_request_id;
  return v_request_id;
end;
$$;

create or replace function public.apply_confirmed_pix_payment()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_quotas integer;
  v_taken integer;
begin
  if old.confirmed_at is null and old.status <> 'confirmada' and new.status = 'confirmada' then
    select quotas, purchased_quotas into v_quotas, v_taken
    from gifts where id = new.gift_id for update;
    if v_taken >= v_quotas then
      raise exception 'Todas as cotas deste presente já foram confirmadas';
    end if;

    update gifts set purchased_quotas = purchased_quotas + 1 where id = new.gift_id;
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists confirm_pix_payment_request on public.pix_payment_requests;
create trigger confirm_pix_payment_request
before update of status on public.pix_payment_requests
for each row execute function public.apply_confirmed_pix_payment();

revoke all on public.pix_payment_requests from anon, authenticated;
grant execute on function public.create_pix_payment_request(bigint) to anon, authenticated;
