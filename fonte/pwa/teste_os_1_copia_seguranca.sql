-- Controle de Frota · Item 7 · PASSO 1: copia de seguranca (rodar ANTES de levar)
-- Cole tudo no Supabase: SQL Editor › New query › Run. So COPIA; nao muda nada no app.
-- Congela, numa tabela separada, TUDO do teste (teste/...) e todas as OS, adendos, estoque e mecanicos do oficial.
-- Pode rodar de novo: cada vez guarda uma nova copia, com a data e hora (coluna copiado_em).
-- Para ver: select copiado_em, count(*) from public.docs_copia_item7 group by 1 order by 1;

create table if not exists public.docs_copia_item7 (
  copiado_em timestamptz not null,
  path text not null,
  parent text,
  data jsonb,
  updated_at timestamptz,
  primary key (copiado_em, path)
);
alter table public.docs_copia_item7 enable row level security; -- ninguem do app le ou mexe nesta tabela

insert into public.docs_copia_item7 (copiado_em, path, parent, data, updated_at)
select now(), path, parent, data, updated_at from public.docs
where path like 'teste/%'
   or path ~ '^(os|ose|estoque)/'
   or path in ('config/mecanicos', 'config/osnum', 'config/equivalencias');

select copiado_em, count(*) as registros_guardados from public.docs_copia_item7 group by 1 order by 1 desc limit 1;
