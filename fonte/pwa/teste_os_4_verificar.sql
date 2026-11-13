-- Controle de Frota · Item 7 · PASSO 4: verificar (depois de levar). SO LE: nao muda nada.
-- Cole no Supabase: SQL Editor › New query › Run. Mande o print do resultado para o Claude.

select '1. levado ao oficial: ' || tipo as o_que, count(*)::text as quantos, null as quais
  from public.teste_levar_log group by tipo
union all
select '2. OS no oficial agora', count(*)::text, 'maior: OS ' || lpad(coalesce(max((data->>'num')::bigint),0)::text,4,'0')
  from public.docs where path ~ '^os/[^/]+$'
union all
select '3. outros registros so no teste: ' || split_part(substr(t.path,7),'/',1), count(*)::text,
       string_agg(substr(t.path,7) || coalesce(' (' || coalesce(t.data->>'desc', t.data->>'titulo', t.data->>'txt', t.data->>'tipo') || ')',''), ', ' order by t.path)
  from public.docs t
 where t.path like 'teste/%'
   and not exists (select 1 from public.docs o where o.path = substr(t.path,7))
   and substr(t.path,7) !~ '^(push/|config/push$|config/notif$|os/|ose/|config/mecanicos$|config/osnum$|estoque/)'
 group by split_part(substr(t.path,7),'/',1)
order by 1;
