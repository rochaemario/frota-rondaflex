-- Controle de Frota · Item 7 · Desfaz o "Levar para o oficial" completo
-- Cole tudo no Supabase: SQL Editor › New query › Run.
-- PARTE A (sempre): tira a funcao e o gatilho do levar. Nada mais muda.
drop function if exists public.teste_levar_tudo();
drop trigger if exists zz_teste_levar_dados on public.docs;
drop function if exists public.teste_levar_dados();
drop function if exists public.teste_levar_put(text, text, jsonb, text);

-- PARTE B (so se quiser tirar do oficial o que ja foi levado): apague os dois tracos "--" das 2 linhas abaixo e rode de novo.
-- As OS, adendos, itens e kits continuam no teste (la nada foi apagado). O historico docs_hist guarda o que for tirado.
-- Nao mexe na lista de mecanicos do oficial (se precisar, restaure config/mecanicos pela copia de seguranca docs_copia_item7).
-- delete from public.docs d using public.teste_levar_log l where d.path = l.path and l.path ~ '^(os|ose|estoque)/';
-- delete from public.teste_levar_log;
