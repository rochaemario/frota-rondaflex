-- Controle de Frota · Item 43 (B1) · DESFAZER o b1_sincronizacao.sql. Nao muda nenhum dado do app.
-- Antes de rodar, volte o app para a v431 (ou o app baixa tudo sozinho quando nao acha a tabela docs_del).
drop trigger if exists docs_del_reg on public.docs;
drop function if exists public.docs_del_reg();
drop table if exists public.docs_del;
drop trigger if exists docs_touch on public.docs;
drop function if exists public.docs_touch();
drop index if exists public.docs_updated_at_idx;
select 'desfeito' as resultado;
