-- Execute uma única vez no Supabase: SQL Editor > New query > Run.
create extension if not exists pgcrypto;

create type public.contribution_status as enum ('awaiting_verification', 'paid', 'cancelled');

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

create index contributions_gift_status_idx on public.contributions (gift_id, status);

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

revoke all on public.guest_rsvps, public.contributions from anon, authenticated;
grant select on public.gifts to anon, authenticated;
grant execute on function public.list_gifts(), public.reserve_gift_quota(bigint), public.create_free_contribution(), public.register_guest(text) to anon, authenticated;

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
