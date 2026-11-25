-- Controle de Frota · Item 31 parte B · PASSO 1 (rodar ANTES do ultimo Levar)
-- Cole tudo no Supabase: SQL Editor › New query › Run. Pode rodar de novo sem problema.
-- Faz 3 coisas:
--  A) Copia de seguranca da tabela docs INTEIRA em docs_copia_item31 (cada vez que rodar guarda outra copia, com data e hora).
--  B) Ajusta o botao "Levar para o oficial" do app teste: continua levando OS, adendos, itens e kits (so acrescenta),
--     mas NAO acrescenta mais mecanicos sozinho (um mecanico excluido no oficial nao pode voltar).
--  C) Mostra a lista (so le) do que o Levar vai trazer e a comparacao dos mecanicos teste x oficial. Mande o print ao Claude.
-- Desfazer: A) e so uma copia (nao muda nada). B) rode de novo o teste_os_3_levar.sql (volta o Levar como era).

-- A) copia de seguranca
create table if not exists public.docs_copia_item31 (
  copiado_em timestamptz not null,
  path text not null,
  parent text,
  data jsonb,
  updated_at timestamptz,
  primary key (copiado_em, path)
);
alter table public.docs_copia_item31 enable row level security; -- ninguem do app le ou mexe nesta tabela
insert into public.docs_copia_item31 (copiado_em, path, parent, data, updated_at)
select now(), path, parent, data, updated_at from public.docs;

-- B) Levar sem mecanicos
-- registro do que foi levado (usado pelo desfazer)
create table if not exists public.teste_levar_log (
  path text primary key,
  tipo text not null,
  em timestamptz not null default now()
);
alter table public.teste_levar_log enable row level security;

-- durante o levar, devolve o registro exatamente como veio do teste (mesmo numero de OS e mesmo codigo almoxarifado).
-- Fica por ultimo na ordem dos gatilhos (nome comeca com zz) e so age dentro do levar.
create or replace function public.teste_levar_dados() returns trigger
language plpgsql security definer set search_path = public as $$
declare v text := current_setting('frota.levar_dados', true);
begin
  if current_setting('frota.levar', true) = '1' and coalesce(v, '') <> '' then new.data := v::jsonb; end if;
  return new;
end $$;
drop trigger if exists zz_teste_levar_dados on public.docs;
create trigger zz_teste_levar_dados before insert on public.docs for each row execute function public.teste_levar_dados();

create or replace function public.teste_levar_put(p_path text, p_parent text, p_data jsonb, p_tipo text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('frota.levar', '1', true);
  perform set_config('frota.levar_dados', p_data::text, true);
  insert into public.docs (path, parent, data, updated_at) values (p_path, p_parent, p_data, now());
  perform set_config('frota.levar', '0', true);
  perform set_config('frota.levar_dados', '', true);
  insert into public.teste_levar_log (path, tipo) values (p_path, p_tipo) on conflict (path) do nothing;
end $$;
revoke all on function public.teste_levar_put(text, text, jsonb, text) from public, anon, authenticated;

create or replace function public.teste_levar_tudo() returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; v_dst text; v_id text; v_alm text; v_kit boolean; v_n bigint; e text; v_iv jsonb; v_d jsonb;
        v_max bigint := 0; n_it int := 0; n_kt int := 0; n_os int := 0; n_ev int := 0; n_mc int := 0;
        pul jsonb := '[]'::jsonb; v_lt jsonb; v_lo jsonb; m jsonb;
begin
  if coalesce(public.meu_papel(), '') <> 'admin' then raise exception 'so o administrador pode levar para o oficial'; end if;

  -- 1) itens primeiro, depois kits (o kit usa os itens). Saldo zero.
  for r in select path, data from public.docs where path ~ '^teste/estoque/[^/]+$'
           order by (coalesce(data->>'kit','') not in ('','false','0','null') or coalesce(data->>'tipo','') = 'kit'), path loop
    v_dst := substr(r.path, 7); v_id := split_part(r.path, '/', 3); v_alm := coalesce(r.data->>'alm', '');
    v_kit := coalesce(r.data->>'kit','') not in ('','false','0','null') or coalesce(r.data->>'tipo','') = 'kit';
    if exists (select 1 from public.docs where path = v_dst) then continue; end if;
    if v_alm <> '' and exists (select 1 from public.docs where path ~ '^estoque/[^/]+$' and data->>'alm' = v_alm) then
      pul := pul || jsonb_build_object('tipo', case when v_kit then 'kit' else 'item' end, 'ref', v_alm, 'desc', r.data->>'desc', 'motivo', 'Codigo ja usado no oficial');
      continue;
    end if;
    v_d := r.data || jsonb_build_object('qtd', 0);
    perform public.teste_levar_put(v_dst, 'estoque', v_d, case when v_kit then 'kit' else 'item' end);
    if v_kit then n_kt := n_kt + 1; else n_it := n_it + 1; end if;
    if v_alm ~ '^[A-Z]{3}-[0-9]+$' then
      insert into public.estoque_seq as q (ns, sigla, n) values ('', split_part(v_alm, '-', 1), split_part(v_alm, '-', 2)::integer)
        on conflict (ns, sigla) do update set n = greatest(q.n, excluded.n);
    end if;
    -- intervalo de troca do item em cada equipamento do encaixe (fica no cadastro do equipamento; so acrescenta)
    for e in select jsonb_array_elements_text(case when jsonb_typeof(r.data->'encaixe') = 'array' then r.data->'encaixe' else '[]'::jsonb end) loop
      select d.data->'ivEnc'->v_id into v_iv from public.docs d where d.path = 'teste/equipamentos/' || e;
      if v_iv is not null then
        update public.docs set data = jsonb_set(data, '{ivEnc}', coalesce(data->'ivEnc', '{}'::jsonb) || jsonb_build_object(v_id, v_iv)), updated_at = now()
        where path = 'equipamentos/' || e and not coalesce(data->'ivEnc', '{}'::jsonb) ? v_id;
      end if;
    end loop;
  end loop;

  -- 2) OS, na ordem do numero, mantendo o numero
  for r in select path, data from public.docs where path ~ '^teste/os/[^/]+$' order by (case when data->>'num' ~ '^[0-9]+$' then (data->>'num')::bigint end) nulls last, path loop
    v_dst := substr(r.path, 7);
    if exists (select 1 from public.docs where path = v_dst) then continue; end if;
    if coalesce(r.data->>'num', '') !~ '^[0-9]+$' then
      pul := pul || jsonb_build_object('tipo', 'os', 'ref', 'sem numero', 'desc', r.data->'o'->>'aconteceu', 'motivo', 'OS ainda sem numero'); continue;
    end if;
    if exists (select 1 from public.docs where path ~ '^os/[^/]+$' and data->>'num' = r.data->>'num') then
      pul := pul || jsonb_build_object('tipo', 'os', 'ref', 'OS ' || lpad(r.data->>'num', 4, '0'), 'desc', r.data->'o'->>'aconteceu', 'motivo', 'Numero ja usado no oficial'); continue;
    end if;
    perform public.teste_levar_put(v_dst, 'os', r.data, 'os');
    n_os := n_os + 1; v_max := greatest(v_max, (r.data->>'num')::bigint);
  end loop;
  if v_max > 0 then
    perform setval('public.os_num_seq', greatest(v_max, (select case when is_called then last_value else 0 end from public.os_num_seq)), true);
  end if;

  -- 3) adendos/eventos das OS que estao no oficial por terem sido levadas do teste
  for r in select d.path, d.data from public.docs d where d.path ~ '^teste/ose/[^/]+$' order by d.path loop
    v_dst := substr(r.path, 7);
    if exists (select 1 from public.docs where path = v_dst) then continue; end if;
    if not exists (select 1 from public.teste_levar_log l where l.path = 'os/' || (r.data->>'os')) then continue; end if;
    perform public.teste_levar_put(v_dst, 'ose', r.data, 'ose');
    n_ev := n_ev + 1;
  end loop;

  -- 4) mecanicos: NAO sao mais acrescentados aqui (item 31). O Mario confirma um a um (virada31_2_mecanicos.sql).

  return jsonb_build_object('itens', n_it, 'kits', n_kt, 'os', n_os, 'eventos', n_ev, 'mecanicos', n_mc, 'pulados', pul);
end $$;
revoke all on function public.teste_levar_tudo() from public, anon;
grant execute on function public.teste_levar_tudo() to authenticated;


-- C) lista (so le)
with
t_os as (select substr(path,7) as dst, path, data from public.docs where path ~ '^teste/os/[^/]+$'),
o_os as (select path, (data->>'num') as num from public.docs where path ~ '^os/[^/]+$'),
t_ose as (select substr(path,7) as dst, data from public.docs where path ~ '^teste/ose/[^/]+$'),
mt as (select x from public.docs d, jsonb_array_elements(case when jsonb_typeof(d.data->'lista')='array' then d.data->'lista' else '[]'::jsonb end) x where d.path='teste/config/mecanicos'),
mo as (select x from public.docs d, jsonb_array_elements(case when jsonb_typeof(d.data->'lista')='array' then d.data->'lista' else '[]'::jsonb end) x where d.path='config/mecanicos'),
mec as (
  select coalesce(t.x->>'nome', o.x->>'nome') as nome,
    case when o.x is null then 'SO NO TESTE (nao vai sozinho)'
         when t.x is null then 'so no oficial'
         when coalesce(t.x->>'mat','')=coalesce(o.x->>'mat','') and coalesce(t.x->>'funcao','')=coalesce(o.x->>'funcao','')
              and coalesce(t.x->>'ativo','true')=coalesce(o.x->>'ativo','true') then 'igual nos dois'
         else 'DIFERENTE' end as sit,
    'teste: mat '||coalesce(t.x->>'mat','-')||' · '||coalesce(t.x->>'funcao','-')||' · '||case when t.x is null then '-' when t.x->>'ativo'='false' then 'inativo' else 'ativo' end
    ||' | oficial: mat '||coalesce(o.x->>'mat','-')||' · '||coalesce(o.x->>'funcao','-')||' · '||case when o.x is null then '-' when o.x->>'ativo'='false' then 'inativo' else 'ativo' end as det
  from mt t full join mo o on o.x->>'uid' = t.x->>'uid')
select 1 as ordem, 'Copia de seguranca (registros)' as o_que, (select count(*) from public.docs_copia_item31 where copiado_em=(select max(copiado_em) from public.docs_copia_item31))::text as quantos, null as quais
union all
select 2, 'OS que o Levar vai trazer', count(*)::text, string_agg('OS '||lpad(coalesce(t.data->>'num','?'),4,'0'), ', ' order by (t.data->>'num'))
  from t_os t where not exists (select 1 from o_os o where o.path = t.dst) and coalesce(t.data->>'num','') ~ '^[0-9]+$'
   and not exists (select 1 from o_os o where o.num = t.data->>'num')
union all
select 3, 'OS que seriam PULADAS', count(*)::text, string_agg(coalesce('OS '||lpad(t.data->>'num',4,'0'),'sem numero'), ', ')
  from t_os t where not exists (select 1 from o_os o where o.path = t.dst)
   and (coalesce(t.data->>'num','') !~ '^[0-9]+$' or exists (select 1 from o_os o where o.num = t.data->>'num'))
union all
select 4, 'OS no oficial agora', count(*)::text, 'maior: OS '||lpad(coalesce(max((data->>'num')::bigint),0)::text,4,'0') from public.docs where path ~ '^os/[^/]+$'
union all
select 5, 'OS no teste', count(*)::text, 'maior: OS '||lpad(coalesce(max(case when data->>'num' ~ '^[0-9]+$' then (data->>'num')::bigint end),0)::text,4,'0') from public.docs where path ~ '^teste/os/[^/]+$'
union all
select 6, 'Adendos/eventos so no teste', count(*)::text, null from t_ose t where not exists (select 1 from public.docs d where d.path = t.dst)
union all
select 7, 'Mecanico: '||nome, sit, det from mec
order by 1, 2;
