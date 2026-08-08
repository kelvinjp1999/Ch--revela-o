-- Execute apenas se você já executou a versão anterior do schema.sql.
alter table public.gifts
  add column if not exists purchased_quotas integer;

update public.gifts g
set purchased_quotas = g.initial_purchased_quotas + (
  select count(*)::integer
  from public.contributions c
  where c.gift_id = g.id
    and c.status in ('awaiting_verification', 'paid')
)
where purchased_quotas is null;

alter table public.gifts
  alter column purchased_quotas set default 0,
  alter column purchased_quotas set not null;

alter table public.gifts
  drop constraint if exists gifts_purchased_quotas_check,
  add constraint gifts_purchased_quotas_check check (purchased_quotas >= 0 and purchased_quotas <= quotas);

create or replace function public.list_gifts()
returns table (id bigint, name text, category text, price numeric, quotas integer, purchased_quotas integer, image text)
language sql security definer set search_path = public
as $$
  select id, name, category, price, quotas, purchased_quotas, image from gifts order by id;
$$;

create or replace function public.reserve_gift_quota(p_gift_id bigint)
returns uuid
language plpgsql security definer set search_path = public
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
