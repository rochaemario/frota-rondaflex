-- Controle de Frota · Ordens de Servico (OS) e papel Mecanico
-- Cole tudo no Supabase: SQL Editor › New query › Run. Pode rodar de novo sem problema.
-- Vale para o app oficial e para a versao de teste (registros com prefixo teste/).

-- 1) Novo papel: mecanico
alter table public.perfis drop constraint if exists perfis_papel_check;
alter table public.perfis add constraint perfis_papel_check check (papel in ('admin','editor','consulta','mecanico'));

-- 2) Numero da OS: dado pelo servidor ao chegar, em ordem crescente, e nunca muda
create sequence if not exists public.os_num_seq;
create sequence if not exists public.os_num_teste_seq;

create or replace function public.os_regras() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.path ~ '^(teste/)?os/[^/]+$' and not exists (select 1 from public.docs where path = new.path) then
      new.data := jsonb_set(new.data, '{num}',
        to_jsonb(case when new.path like 'teste/%' then nextval('public.os_num_teste_seq') else nextval('public.os_num_seq') end));
    end if;
    return new;
  end if;
  if tg_op = 'UPDATE' then
    -- OS e eventos da OS nunca mudam depois de gravados (reenvio sem internet nao estraga nada)
    if old.path ~ '^(teste/)?(os|ose)/' then new.data := old.data; end if;
    return new;
  end if;
  return new;
end $$;
drop trigger if exists os_regras_ins on public.docs;
create trigger os_regras_ins before insert on public.docs for each row execute function public.os_regras();
drop trigger if exists os_regras_upd on public.docs;
create trigger os_regras_upd before update on public.docs for each row execute function public.os_regras();

-- 3) Quem le e grava o que
--    admin/editor: como antes. consulta: so le.
--    mecanico: le OS, equipamentos, estoque e configuracoes; so cria OS e eventos de OS em nome dele.
--    Ninguem apaga OS nem eventos de OS.
drop policy if exists docs_ler on public.docs;
create policy docs_ler on public.docs for select to authenticated
  using (public.meu_papel() in ('admin','editor','consulta')
      or (public.meu_papel() = 'mecanico' and path ~ '^(teste/)?(os|ose|equipamentos|estoque|config)/'));

drop policy if exists docs_criar on public.docs;
create policy docs_criar on public.docs for insert to authenticated
  with check (
    (public.meu_papel() in ('admin','editor') and (path !~ '^(teste/)?ose/' or public.meu_papel() = 'admin' or not (data ? 'adm')))
    or (public.meu_papel() = 'mecanico' and (
         (path ~ '^(teste/)?os/[^/]+$' and data->'o'->>'por' = auth.uid()::text)
      or (path ~ '^(teste/)?ose/[^/]+$' and data->>'por' = auth.uid()::text and not (data ? 'adm')
          and coalesce(data->>'tipo','') in ('concluir','reabrir','resp','adendo','edit','pcadd','pcrm','ftadd','ftrm','cancelar'))
      -- aviso de falta de peca para o administrador
      or (path ~ '^(teste/)?avisos/[^/]+$' and data->>'de' = auth.uid()::text))));

drop policy if exists docs_alterar on public.docs;
create policy docs_alterar on public.docs for update to authenticated
  using (public.meu_papel() in ('admin','editor') or (public.meu_papel() = 'mecanico' and path ~ '^(teste/)?(os|ose)/'))
  with check (public.meu_papel() in ('admin','editor') or (public.meu_papel() = 'mecanico' and path ~ '^(teste/)?(os|ose)/'));

drop policy if exists docs_apagar on public.docs;
create policy docs_apagar on public.docs for delete to authenticated
  using (public.meu_papel() in ('admin','editor') and path !~ '^(teste/)?(os|ose)/');

-- 4) Fotos: o mecanico tambem envia (fotos da OS e das pecas)
drop policy if exists arquivos_enviar on storage.objects;
create policy arquivos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'arquivos' and public.meu_papel() in ('admin','editor','mecanico'));
