-- Controle de Frota · Item 7 · PASSO 2: conferencia (rodar ANTES de levar)
-- Cole tudo no Supabase: SQL Editor › New query › Run. SO LE: nao muda nada.
-- Mostra o que existe so no teste e o que seria pulado. Mande o resultado (print) para o Claude.

with
t_os as (select substr(path,7) as dst, path, data from public.docs where path ~ '^teste/os/[^/]+$'),
o_os as (select path, (data->>'num') as num from public.docs where path ~ '^os/[^/]+$'),
t_ose as (select substr(path,7) as dst, data from public.docs where path ~ '^teste/ose/[^/]+$'),
t_est as (select substr(path,7) as dst, data from public.docs where path ~ '^teste/estoque/[^/]+$'),
o_est as (select path, coalesce(data->>'alm','') as alm from public.docs where path ~ '^estoque/[^/]+$')
select 'OS so no teste' as o_que, count(*)::text as quantos, string_agg('OS '||lpad(coalesce(t.data->>'num','?'),4,'0'), ', ' order by t.path) as quais
  from t_os t where not exists (select 1 from o_os o where o.path = t.dst)
union all
select 'OS que seriam PULADAS (numero ja usado no oficial)', count(*)::text, string_agg('OS '||lpad(t.data->>'num',4,'0'), ', ')
  from t_os t where not exists (select 1 from o_os o where o.path = t.dst) and exists (select 1 from o_os o where o.num = t.data->>'num')
union all
select 'OS que ja existem no oficial', count(*)::text, null from public.docs where path ~ '^os/[^/]+$'
union all
select 'Maior numero de OS no oficial', coalesce(max((data->>'num')::bigint),0)::text, null from public.docs where path ~ '^os/[^/]+$'
union all
select 'Adendos/eventos de OS so no teste', count(*)::text, null
  from t_ose t where not exists (select 1 from public.docs d where d.path = t.dst)
union all
select 'Itens do estoque so no teste', count(*)::text, string_agg(coalesce(nullif(t.data->>'alm',''),'sem codigo')||' '||coalesce(t.data->>'desc',''), ', ')
  from t_est t where not (coalesce(t.data->>'kit','') not in ('','false','0','null') or coalesce(t.data->>'tipo','')='kit') and not exists (select 1 from o_est o where o.path = t.dst)
union all
select 'Kits so no teste', count(*)::text, string_agg(coalesce(t.data->>'desc',''), ', ')
  from t_est t where (coalesce(t.data->>'kit','') not in ('','false','0','null') or coalesce(t.data->>'tipo','')='kit') and not exists (select 1 from o_est o where o.path = t.dst)
union all
select 'Itens que seriam PULADOS (codigo ja usado no oficial)', count(*)::text, string_agg(t.data->>'alm'||' '||coalesce(t.data->>'desc',''), ', ')
  from t_est t where not exists (select 1 from o_est o where o.path = t.dst)
   and coalesce(t.data->>'alm','') <> '' and exists (select 1 from o_est o where o.alm = t.data->>'alm');
