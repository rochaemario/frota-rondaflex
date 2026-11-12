-- Controle de Frota · Desfaz teste_levar.sql
-- Cole tudo no Supabase: SQL Editor › New query › Run.
-- Tira a funcao de levar e volta a regra do codigo almoxarifado como era (estoque_codigo.sql).
-- Itens que ja foram levados para o oficial continuam la; para tira-los, apague pelo app (+ › Estoque).

drop function if exists public.teste_levar_oficial(text[]);

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
