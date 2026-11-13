-- Controle de Frota · Item 7 · PASSO 3: instala o "Levar para o oficial" completo (itens, kits, OS e adendos)
-- Cole tudo no Supabase: SQL Editor › New query › Run. Pode rodar de novo sem problema.
-- Rode DEPOIS do passo 1 (copia de seguranca). Este script so instala; quem leva e o botao do app teste
-- (Atualizar copia › Levar para o oficial). So o admin pode usar.
-- Regras (decisoes do Mario, 13/11):
--  * Nada e apagado nem escrito por cima, nem no teste nem no oficial.
--  * Itens e kits que so existem no teste vao com o mesmo codigo almoxarifado e SALDO ZERO.
--  * Cada OS vai com o mesmo numero; OS com numero ja usado no oficial nao vai (volta na lista de pulados).
--  * Adendos/eventos das OS levadas vao junto (e, se a OS ja foi levada antes, os eventos novos vao depois).
--  * Mecanicos do teste que faltam na lista do oficial sao acrescentados (so acrescenta; nao muda os que ja existem).
--  * O teste NAO e atualizado com a copia do oficial depois de levar.
-- Desfazer: teste_os_3_levar_desfazer.sql (tira do oficial so o que foi levado por este botao).

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

  -- 4) mecanicos do teste que faltam na lista do oficial (so acrescenta)
  select data->'lista' into v_lt from public.docs where path = 'teste/config/mecanicos';
  select data->'lista' into v_lo from public.docs where path = 'config/mecanicos';
  if jsonb_typeof(v_lt) = 'array' then
    v_lo := case when jsonb_typeof(v_lo) = 'array' then v_lo else '[]'::jsonb end;
    for m in select x from jsonb_array_elements(v_lt) x loop
      if coalesce(m->>'uid', '') <> '' and not exists (select 1 from jsonb_array_elements(v_lo) y where y->>'uid' = m->>'uid') then
        v_lo := v_lo || jsonb_build_array(m); n_mc := n_mc + 1;
      end if;
    end loop;
    if n_mc > 0 then
      if exists (select 1 from public.docs where path = 'config/mecanicos') then
        update public.docs set data = jsonb_set(coalesce(data, '{}'::jsonb), '{lista}', v_lo), updated_at = now() where path = 'config/mecanicos';
      else
        insert into public.docs (path, parent, data, updated_at) values ('config/mecanicos', 'config', jsonb_build_object('lista', v_lo), now());
      end if;
    end if;
  end if;

  return jsonb_build_object('itens', n_it, 'kits', n_kt, 'os', n_os, 'eventos', n_ev, 'mecanicos', n_mc, 'pulados', pul);
end $$;
revoke all on function public.teste_levar_tudo() from public, anon;
grant execute on function public.teste_levar_tudo() to authenticated;

select 'instalado' as resultado;
