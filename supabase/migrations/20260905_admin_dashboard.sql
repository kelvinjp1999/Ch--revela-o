-- Área administrativa protegida por Supabase Auth.
-- Antes de usar, crie estes dois usuários em Authentication > Users no painel
-- do Supabase, usando os e-mails e senhas definidos pelo casal.

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'kelvinperosa.kp@gmail.com',
      'beatriz.guilherme2302@gmail.com'
    ),
    false
  );
$$;

create or replace function public.admin_list_guest_rsvps()
returns table (id uuid, name text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query select g.id, g.name, g.created_at from guest_rsvps g order by g.created_at desc;
end;
$$;

create or replace function public.admin_update_guest_rsvp(p_guest_id uuid, p_name text)
returns void
language plpgsql
security definer
set search_path = public
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
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  delete from guest_rsvps where id = p_guest_id;
  if not found then raise exception 'Confirmação de presença não encontrada'; end if;
end;
$$;

create or replace function public.admin_list_pending_pix_payment_requests()
returns table (id uuid, product_name text, quota_value numeric, status public.pix_payment_status, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query
    select p.id, p.product_name, p.quota_value, p.status, p.created_at
    from pix_payment_requests p
    where p.status = 'pendente'
    order by p.created_at asc;
end;
$$;

create or replace function public.admin_confirm_pix_payment_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  update pix_payment_requests set status = 'confirmada'
  where id = p_request_id and status = 'pendente';
  if not found then raise exception 'Solicitação pendente não encontrada'; end if;
end;
$$;

create or replace function public.admin_delete_pix_payment_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  delete from pix_payment_requests where id = p_request_id and status = 'pendente';
  if not found then raise exception 'Solicitação pendente não encontrada'; end if;
end;
$$;

create or replace function public.admin_list_gift_quota_summary()
returns table (id bigint, name text, quotas integer, purchased_quotas integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then raise exception 'Acesso não autorizado'; end if;
  return query select g.id, g.name, g.quotas, g.purchased_quotas from gifts g order by g.id;
end;
$$;

revoke all on function public.is_site_admin(), public.admin_list_guest_rsvps(), public.admin_update_guest_rsvp(uuid, text), public.admin_delete_guest_rsvp(uuid), public.admin_list_pending_pix_payment_requests(), public.admin_confirm_pix_payment_request(uuid), public.admin_delete_pix_payment_request(uuid), public.admin_list_gift_quota_summary() from public;
grant execute on function public.is_site_admin(), public.admin_list_guest_rsvps(), public.admin_update_guest_rsvp(uuid, text), public.admin_delete_guest_rsvp(uuid), public.admin_list_pending_pix_payment_requests(), public.admin_confirm_pix_payment_request(uuid), public.admin_delete_pix_payment_request(uuid), public.admin_list_gift_quota_summary() to authenticated;
