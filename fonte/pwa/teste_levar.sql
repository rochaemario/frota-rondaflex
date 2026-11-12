-- Controle de Frota · Levar itens do estoque do TESTE para o app OFICIAL mantendo o codigo almoxarifado (MAN-0002...)
-- Cole tudo no Supabase: SQL Editor › New query › Run. Pode rodar de novo sem problema.
-- Usado pelo botao "Atualizar copia" do app teste › "Levar para o oficial". So o admin pode usar.
-- Desfazer: teste_levar_desfazer.sql

-- 1) Regra do codigo almoxarifado: igual a de antes, so com a excecao da transferencia (linha frota.levar)
create or replace function public.estoque_codigo() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ns text; v_c text; v_old text := ''; v_n integer;
begin
  -- transferencia do teste para o oficial (teste_levar_oficial): mantem o codigo que veio do teste
  if current_setting('frota.levar', true) = '1' then return new; end if;
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

-- 2) Levar: copia cada item teste/estoque/X para estoque/X com o mesmo codigo, leva o intervalo do encaixe
--    e avanca o contador do oficial. Item cujo codigo ja existe no oficial nao e levado (volta em "pulados").
create or replace function public.teste_levar_oficial(p_paths text[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; v_dst text; v_id text; v_alm text; v_c text; v_n integer; e text; v_iv jsonb;
        lev text[] := '{}'; pul jsonb := '[]'::jsonb;
begin
  if coalesce(public.meu_papel(), '') <> 'admin' then raise exception 'so o administrador pode levar itens para o oficial'; end if;
  for r in select path, data from public.docs where path = any(p_paths) and path ~ '^teste/estoque/[^/]+$' order by path loop
    v_dst := substr(r.path, 7); v_id := split_part(r.path, '/', 3); v_alm := coalesce(r.data->>'alm', '');
    if exists (select 1 from public.docs where path = v_dst)
       or (v_alm <> '' and exists (select 1 from public.docs where path ~ '^estoque/[^/]+$' and data->>'alm' = v_alm)) then
      pul := pul || jsonb_build_object('path', r.path, 'alm', v_alm, 'desc', r.data->>'desc'); continue;
    end if;
    perform set_config('frota.levar', '1', true);
    insert into public.docs (path, parent, data, updated_at) values (v_dst, 'estoque', r.data, now());
    perform set_config('frota.levar', '0', true);
    if v_alm ~ '^[A-Z]{3}-[0-9]+$' then
      v_c := split_part(v_alm, '-', 1); v_n := split_part(v_alm, '-', 2)::integer;
      insert into public.estoque_seq as q (ns, sigla, n) values ('', v_c, v_n)
        on conflict (ns, sigla) do update set n = greatest(q.n, excluded.n);
    end if;
    -- intervalo de troca do item em cada equipamento do encaixe (fica no cadastro do equipamento)
    for e in select jsonb_array_elements_text(coalesce(r.data->'encaixe', '[]'::jsonb)) loop
      select d.data->'ivEnc'->v_id into v_iv from public.docs d where d.path = 'teste/equipamentos/' || e;
      if v_iv is not null then
        update public.docs set data = jsonb_set(data, '{ivEnc}', coalesce(data->'ivEnc', '{}'::jsonb) || jsonb_build_object(v_id, v_iv)), updated_at = now()
        where path = 'equipamentos/' || e;
      end if;
    end loop;
    lev := lev || v_dst;
  end loop;
  return jsonb_build_object('levados', to_jsonb(lev), 'pulados', pul);
end $$;
revoke all on function public.teste_levar_oficial(text[]) from public, anon;
grant execute on function public.teste_levar_oficial(text[]) to authenticated;
