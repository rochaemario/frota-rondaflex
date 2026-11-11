-- Controle de Frota · Codigo de almoxarifado dos itens do estoque (FIL-0001, LUB-0001, MEC-0001...)
-- Cole tudo no Supabase: SQL Editor › New query › Run. Pode rodar de novo sem problema.
-- Vale para o app oficial e para a versao de teste (registros com prefixo teste/).
-- Desfazer: estoque_codigo_desfazer.sql

-- 1) Contador de cada categoria. Nunca volta: codigo de item apagado ou que mudou de categoria nao e reaproveitado.
create table if not exists public.estoque_seq (ns text not null, sigla text not null, n integer not null, primary key (ns, sigla));
alter table public.estoque_seq enable row level security;
revoke all on public.estoque_seq from anon, authenticated;

-- 2) Categoria dos itens cadastrados antes das categorias (pelo tipo antigo)
create or replace function public.estoque_cat_de(d jsonb) returns text language sql immutable as $$
  select case
    when lower(coalesce(d->>'desc','')) ~ '^(correia|anel)' then 'MEC'
    when d->>'tipo' = 'filtro' then 'FIL'
    when d->>'tipo' in ('oleo','Aditivo','Graxa','Fluido') then 'LUB'
    when d->>'tipo' = 'Mangueira' then 'MAN'
    when d->>'tipo' = 'Eletrica' then 'ELE'
    when d->>'tipo' in ('Correia','Rolamento / vedacao') then 'MEC'
    else null end $$;

-- 3) O codigo e dado pelo servidor ao salvar o cadastro, em sequencia por categoria.
--    O aparelho nunca muda o codigo. Mudou de categoria: ganha o proximo codigo da nova e o antigo fica em almAnt.
create or replace function public.estoque_codigo() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ns text; v_c text; v_old text := ''; v_n integer;
begin
  if new.path !~ '^(teste/)?estoque/[^/]+$' then return new; end if;
  if tg_op = 'INSERT' and exists (select 1 from public.docs where path = new.path) then return new; end if;
  if coalesce(new.data->>'tipo','') = 'kit' or coalesce(new.data->>'kit','') = 'true' then return new; end if;
  v_ns := case when new.path like 'teste/%' then 'teste' else '' end;
  new.data := new.data - 'alm' - 'almAnt';
  if tg_op = 'UPDATE' then
    if coalesce(old.data->>'alm','') <> '' then v_old := old.data->>'alm'; new.data := new.data || jsonb_build_object('alm', v_old); end if;
    if old.data ? 'almAnt' then new.data := new.data || jsonb_build_object('almAnt', old.data->'almAnt'); end if;
    if coalesce(new.data->>'cat','') = '' and coalesce(old.data->>'cat','') <> '' then new.data := new.data || jsonb_build_object('cat', old.data->'cat'); end if;
  end if;
  v_c := upper(coalesce(nullif(new.data->>'cat',''), nullif(split_part(v_old,'-',1),''), public.estoque_cat_de(new.data)));
  if v_c is null or v_c !~ '^[A-Z]{3}$' then
    if v_old <> '' then new.data := new.data || jsonb_build_object('cat', split_part(v_old,'-',1)); end if;
    return new;
  end if;
  new.data := new.data || jsonb_build_object('cat', v_c);
  if v_old <> '' and split_part(v_old,'-',1) = v_c then return new; end if;
  insert into public.estoque_seq as q (ns, sigla, n) values (v_ns, v_c, 1)
    on conflict (ns, sigla) do update set n = q.n + 1 returning q.n into v_n;
  if v_old <> '' then
    new.data := jsonb_set(new.data, '{almAnt}', coalesce(new.data->'almAnt','[]'::jsonb) || to_jsonb(v_old));
  end if;
  new.data := jsonb_set(new.data, '{alm}', to_jsonb(v_c || '-' || lpad(v_n::text, 4, '0')));
  return new;
end $$;
drop trigger if exists estoque_codigo_ins on public.docs;
create trigger estoque_codigo_ins before insert on public.docs for each row execute function public.estoque_codigo();
drop trigger if exists estoque_codigo_upd on public.docs;
create trigger estoque_codigo_upd before update on public.docs for each row execute function public.estoque_codigo();

-- 4) Itens que ainda nao tem codigo: numera de uma vez, cada categoria em ordem alfabetica da descricao.
--    O item que tinha codigo digitado e estava sem referencia passa a ter esse codigo como referencia.
do $$
declare r record;
begin
  for r in
    select path from public.docs
    where path ~ '^(teste/)?estoque/[^/]+$' and coalesce(data->>'tipo','') <> 'kit' and coalesce(data->>'alm','') = ''
    order by (path like 'teste/%'), coalesce(nullif(data->>'cat',''), public.estoque_cat_de(data)),
             lower(coalesce(data->>'desc','')), lower(coalesce(data->>'ref',''))
  loop
    update public.docs set
      data = case when coalesce(data->>'ref','') = '' and coalesce(data->>'codigo','') <> '' then jsonb_set(data, '{ref}', data->'codigo') else data end,
      updated_at = now()
    where path = r.path;
  end loop;
end $$;

-- 5) Conferencia: quantos itens ficaram em cada categoria (app oficial)
select data->>'cat' as categoria, count(*) as itens, min(data->>'alm') as primeiro, max(data->>'alm') as ultimo
from public.docs where path ~ '^estoque/[^/]+$' and coalesce(data->>'tipo','') <> 'kit'
group by 1 order by 1;
