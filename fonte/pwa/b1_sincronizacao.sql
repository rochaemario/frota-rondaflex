-- Controle de Frota · Item 43 (B1) · Sincronizacao inteligente · rodar UMA vez (pode rodar de novo sem problema)
-- Cole tudo no Supabase: SQL Editor › New query › Run.
-- Nao muda nenhum dado do app. Cria:
--  1) hora de alteracao sempre pela hora do servidor (coluna updated_at, que ja existe) + indice para buscar rapido;
--  2) registro de exclusoes (tabela docs_del): quando algo e apagado, o caminho fica anotado para os outros celulares apagarem tambem.
-- O app v432 usa isso para baixar so o que mudou. Sem este script o app continua funcionando (baixa tudo, como antes).
-- Desfazer: b1_sincronizacao_desfazer.sql

-- 1) hora de alteracao pelo servidor
create or replace function public.docs_touch() returns trigger language plpgsql as $$
begin new.updated_at := clock_timestamp(); return new; end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs for each row execute function public.docs_touch();
create index if not exists docs_updated_at_idx on public.docs (updated_at);

-- 2) registro de exclusoes
create table if not exists public.docs_del (
  path text primary key,
  apagado_em timestamptz not null default clock_timestamp()
);
create index if not exists docs_del_apagado_idx on public.docs_del (apagado_em);
alter table public.docs_del enable row level security;
drop policy if exists docs_del_ler on public.docs_del;
create policy docs_del_ler on public.docs_del for select to authenticated
  using (public.meu_papel() in ('admin','editor','consulta')
      or (public.meu_papel() = 'mecanico' and path ~ '^(teste/)?(os|ose|equipamentos|estoque|config)/'));
grant select on public.docs_del to authenticated;

create or replace function public.docs_del_reg() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.docs_del (path, apagado_em) values (old.path, clock_timestamp())
    on conflict (path) do update set apagado_em = excluded.apagado_em;
  return old;
end $$;
drop trigger if exists docs_del_reg on public.docs;
create trigger docs_del_reg after delete on public.docs for each row execute function public.docs_del_reg();

select 'instalado' as resultado,
  (select count(*) from public.docs) as registros,
  (select count(*) from public.docs where updated_at is null) as sem_hora;
