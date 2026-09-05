-- Execute uma única vez no Supabase: SQL Editor > New query > Run.
create extension if not exists pgcrypto;

create type public.contribution_status as enum ('awaiting_verification', 'paid', 'cancelled');
create type public.pix_payment_status as enum ('pendente', 'confirmada', 'cancelada');

create table public.gifts (
  id bigint primary key,
  name text not null,
  category text not null check (category in ('cozinha', 'eletros', 'casa')),
  price numeric(10, 2) not null check (price >= 0),
  quotas integer not null check (quotas > 0),
  purchased_quotas integer not null default 0 check (purchased_quotas >= 0 and purchased_quotas <= quotas),
  image text not null,
  created_at timestamptz not null default now()
);

create table public.guest_rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  created_at timestamptz not null default now()
);

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  gift_id bigint references public.gifts(id),
  kind text not null check (kind in ('quota', 'free')),
  status public.contribution_status not null default 'awaiting_verification',
  created_at timestamptz not null default now(),
  constraint contribution_kind_matches_gift check (
    (kind = 'quota' and gift_id is not null) or (kind = 'free' and gift_id is null)
  )
);

-- Solicitações criadas pelos convidados. A cota só é contabilizada quando o
-- status for alterado para "confirmada" no painel do Supabase.
create table public.pix_payment_requests (
  id uuid primary key default gen_random_uuid(),
  gift_id bigint not null references public.gifts(id),
  product_name text not null,
  quota_value numeric(10, 2) not null check (quota_value >= 0),
  status public.pix_payment_status not null default 'pendente',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index contributions_gift_status_idx on public.contributions (gift_id, status);
create index pix_payment_requests_gift_status_idx on public.pix_payment_requests (gift_id, status);

insert into public.gifts (id, name, category, price, quotas, purchased_quotas, image) values
  (1, 'Air Fryer', 'eletros', 450, 5, 0, 'https://picsum.photos/600/400?1'),
  (2, 'Batedeira Planetária', 'eletros', 890, 6, 2, 'https://picsum.photos/600/400?2'),
  (3, 'Jogo de Panelas', 'cozinha', 650, 5, 1, 'https://picsum.photos/600/400?3'),
  (4, 'Liquidificador', 'cozinha', 320, 4, 3, 'https://picsum.photos/600/400?4'),
  (5, 'Aparelho de Jantar', 'casa', 580, 5, 1, 'https://picsum.photos/600/400?5'),
  (6, 'Robô Aspirador', 'casa', 1450, 10, 5, 'https://picsum.photos/600/400?6')
on conflict (id) do nothing;

alter table public.gifts enable row level security;
alter table public.guest_rsvps enable row level security;
alter table public.contributions enable row level security;
alter table public.pix_payment_requests enable row level security;

create policy "Public can read gifts" on public.gifts for select using (true);

create or replace function public.list_gifts()
returns table (
  id bigint,
  name text,
  category text,
  price numeric,
  quotas integer,
  purchased_quotas integer,
  image text
)
language sql
security definer
set search_path = public
as $$
  select
    g.id,
    g.name,
    g.category,
    g.price,
    g.quotas,
    g.purchased_quotas,
    g.image
  from gifts g
  order by g.id;
$$;

-- A função usa lock na linha do presente para impedir duas reservas da última cota ao mesmo tempo.
create or replace function public.reserve_gift_quota(p_gift_id bigint)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quotas integer;
  v_taken integer;
  v_contribution_id uuid;
begin
  select quotas, purchased_quotas into v_quotas, v_taken
  from gifts where id = p_gift_id for update;

  if not found then raise exception 'Presente não encontrado'; end if;

  if v_taken >= v_quotas then raise exception 'Todas as cotas deste presente já foram escolhidas'; end if;

  insert into contributions (gift_id, kind) values (p_gift_id, 'quota') returning id into v_contribution_id;
  update gifts set purchased_quotas = purchased_quotas + 1 where id = p_gift_id;
  return v_contribution_id;
end;
$$;

create or replace function public.create_pix_payment_request(p_gift_id bigint)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_name text;
  v_quota_value numeric(10, 2);
  v_request_id uuid;
begin
  select name, price into v_product_name, v_quota_value
  from gifts
  where id = p_gift_id;

  if not found then raise exception 'Presente não encontrado'; end if;

  insert into pix_payment_requests (gift_id, product_name, quota_value)
  values (p_gift_id, v_product_name, v_quota_value)
  returning id into v_request_id;

  return v_request_id;
end;
$$;

-- Esta função é executada ao editar uma solicitação no painel. O lock impede
-- que duas confirmações ocupem a última cota ao mesmo tempo.
create or replace function public.apply_confirmed_pix_payment()
returns trigger
language plpgsql
security definer
set search_path = public
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

create trigger confirm_pix_payment_request
before update of status on public.pix_payment_requests
for each row execute function public.apply_confirmed_pix_payment();

create or replace function public.create_free_contribution()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_contribution_id uuid;
begin
  insert into contributions (kind) values ('free') returning id into v_contribution_id;
  return v_contribution_id;
end;
$$;

create or replace function public.register_guest(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_guest_id uuid;
begin
  insert into guest_rsvps (name) values (trim(p_name)) returning id into v_guest_id;
  return v_guest_id;
end;
$$;

-- O e-mail autenticado precisa estar na lista abaixo para acessar as funções
-- administrativas. As senhas ficam exclusivamente no Supabase Auth.
create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in ('kelvinperosa.kp@gmail.com', 'beatriz.guilherme2302@gmail.com'),
    false
  );
$$;

create or replace function public.admin_list_guest_rsvps()
returns table (id uuid, name text, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query select g.id, g.name, g.created_at from guest_rsvps g order by g.created_at desc;
end;
$$;

create or replace function public.admin_update_guest_rsvp(p_guest_id uuid, p_name text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  if char_length(trim(p_name)) not between 2 and 100 then raise exception 'Nome inválido'; end if;
  update guest_rsvps set name = trim(p_name) where id = p_guest_id;
  if not found then raise exception 'Confirmação de presença não encontrada'; end if;
end;
$$;

create or replace function public.admin_delete_guest_rsvp(p_guest_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  delete from guest_rsvps where id = p_guest_id;
  if not found then raise exception 'Confirmação de presença não encontrada'; end if;
end;
$$;

create or replace function public.admin_list_pending_pix_payment_requests()
returns table (id uuid, product_name text, quota_value numeric, status public.pix_payment_status, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query select p.id, p.product_name, p.quota_value, p.status, p.created_at from pix_payment_requests p where p.status = 'pendente' order by p.created_at asc;
end;
$$;

create or replace function public.admin_confirm_pix_payment_request(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  update pix_payment_requests set status = 'confirmada' where id = p_request_id and status = 'pendente';
  if not found then raise exception 'Solicitação pendente não encontrada'; end if;
end;
$$;

create or replace function public.admin_delete_pix_payment_request(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  delete from pix_payment_requests where id = p_request_id and status = 'pendente';
  if not found then raise exception 'Solicitação pendente não encontrada'; end if;
end;
$$;

create or replace function public.admin_list_gift_quota_summary()
returns table (id bigint, name text, quotas integer, purchased_quotas integer)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query select g.id, g.name, g.quotas, g.purchased_quotas from gifts g order by g.id;
end;
$$;

revoke all on public.guest_rsvps, public.contributions, public.pix_payment_requests from anon, authenticated;
revoke all on function public.is_site_admin(), public.admin_list_guest_rsvps(), public.admin_update_guest_rsvp(uuid, text), public.admin_delete_guest_rsvp(uuid), public.admin_list_pending_pix_payment_requests(), public.admin_confirm_pix_payment_request(uuid), public.admin_delete_pix_payment_request(uuid), public.admin_list_gift_quota_summary() from public;
grant select on public.gifts to anon, authenticated;
grant execute on function public.list_gifts(), public.reserve_gift_quota(bigint), public.create_pix_payment_request(bigint), public.create_free_contribution(), public.register_guest(text) to anon, authenticated;
grant execute on function public.is_site_admin(), public.admin_list_guest_rsvps(), public.admin_update_guest_rsvp(uuid, text), public.admin_delete_guest_rsvp(uuid), public.admin_list_pending_pix_payment_requests(), public.admin_confirm_pix_payment_request(uuid), public.admin_delete_pix_payment_request(uuid), public.admin_list_gift_quota_summary() to authenticated;

-- Permite que o site receba atualizações de cotas sem recarregar a página.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_rel pr
       join pg_class c on c.oid = pr.prrelid
       where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
         and c.oid = 'public.gifts'::regclass
     ) then
    alter publication supabase_realtime add table public.gifts;
  end if;
end $$;
