-- Controle de Frota · DESFAZER o codigo de almoxarifado automatico
-- Cole tudo no Supabase: SQL Editor › New query › Run.
-- Para de dar codigo, apaga os codigos e as categorias gravados nos itens e zera os contadores.
-- O resto do cadastro dos itens nao muda.

drop trigger if exists estoque_codigo_ins on public.docs;
drop trigger if exists estoque_codigo_upd on public.docs;
drop function if exists public.estoque_codigo();
drop function if exists public.estoque_cat_de(jsonb);

update public.docs set data = data - 'alm' - 'almAnt' - 'cat', updated_at = now()
where path ~ '^(teste/)?estoque/[^/]+$' and (data ? 'alm' or data ? 'almAnt' or data ? 'cat');

drop table if exists public.estoque_seq;
