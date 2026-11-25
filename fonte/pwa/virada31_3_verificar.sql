-- Controle de Frota · Item 31 parte B · PASSO 3: verificar (depois do Levar e da Conferencia da virada). SO LE: nao muda nada.
-- Cole no Supabase: SQL Editor › New query › Run. Mande o print do resultado ao Claude.
with
t_os as (select substr(path,7) as dst, data from public.docs where path ~ '^teste/os/[^/]+$'),
t_ose as (select substr(path,7) as dst from public.docs where path ~ '^teste/ose/[^/]+$'),
ev as (select data from public.docs where path ~ '^ose/[^/]+$')
select 1 as ordem, 'OS no teste / no oficial' as o_que,
  (select count(*) from t_os)::text||' / '||(select count(*) from public.docs where path ~ '^os/[^/]+$')::text as quantos, null as quais
union all
select 2, 'OS do teste que NAO estao no oficial', count(*)::text, string_agg(coalesce('OS '||lpad(t.data->>'num',4,'0'),'sem numero'), ', ')
  from t_os t where not exists (select 1 from public.docs d where d.path = t.dst)
union all
select 3, 'Adendos/eventos do teste que NAO estao no oficial', count(*)::text, null
  from t_ose t where not exists (select 1 from public.docs d where d.path = t.dst)
union all
select 4, 'Maior OS no oficial', lpad(coalesce(max((data->>'num')::bigint),0)::text,4,'0'), null from public.docs where path ~ '^os/[^/]+$'
union all
select 5, 'Virada: ligadas a registro do oficial', count(*)::text, null from ev where data->>'tipo'='vir31' and data->>'d'='lig'
union all
select 6, 'Virada: ficam a registrar', count(*)::text, null from ev where data->>'tipo'='vir31' and data->>'d'='reg'
union all
select 7, 'Virada: pecas com baixa ja dada', count(*)::text, null from ev where data->>'tipo'='conf' and data->>'acao'='ja'
union all
select 8, 'Virada: OS com pecas a conferir depois', count(*)::text, null from ev where data->>'tipo'='vir31' and data->>'d'='conf'
union all
select 9, 'Virada: escolhas desfeitas', count(*)::text, null from ev where data->>'tipo' in ('vir31','confx') and coalesce(data->>'d','x')='x'
order by 1;
