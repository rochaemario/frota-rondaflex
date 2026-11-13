# Fonte do app Controle de Frota — regras para qualquer conversa com o Claude

Esta pasta guarda a fonte de onde o app publicado (index.html, shim.js, sw.js...) e gerado.
O app publicado na raiz do repositorio e SEMPRE gerado a partir daqui; nunca edite index.html direto.

## Antes de mudar ou publicar
1. Busque o repositorio e confira se a ultima versao publicada e a mesma que voce tem.
   Se alguem publicou por fora (outro chat), incorpore a mudanca na fonte ANTES de publicar.
   Publicar sem isso apaga o trabalho do outro chat.
2. Mexa no app por UM chat de cada vez.
3. Nada e aplicado sem o usuario dizer "Execute" ou "xx". Sempre manter a opcao de desfazer.

## Como restaurar a fonte numa conversa nova
- `fonte/frota.html.txt` -> `/home/claude/frota.html`
- `fonte/pwa/` -> `/home/claude/pwa/` (build.py e src/)
- `fonte/publicar.sh` -> `/home/claude/publicar.sh`
- Clonar o repositorio em `/home/claude/frota-rondaflex`

## Publicar
`/home/claude/publicar.sh vNNN "mensagem"` — confere mudancas de fora, gera, guarda a fonte e cria o ramo versao-vNNN.

## Desfazer ("voltar vNNN")
Cada versao publicada tem um ramo `versao-vNNN` no repositorio, com a fonte junto.
Para voltar: pegar `fonte/` desse ramo, restaurar e publicar como nova versao.

## Teste x oficial
- O app teste (/teste) usa os mesmos dados com prefixo teste/. Tudo que existe so no teste fica so no teste.
- "Atualizar copia" (teste) nunca apaga o que so existe no teste: mostra esses registros e deixa escolher Manter ou Levar para o oficial.
- "Levar para o oficial" precisa do script fonte/pwa/teste_levar.sql rodado no Supabase (desfazer: teste_levar_desfazer.sql).
- Etiquetas do almoxarifado e mangueiras sem referencia: no app oficial desde a v402 (antes so no teste, ramo etiquetas-fonte).
- Item 7 (13/11): "Levar para o oficial" do teste leva itens e kits (saldo zero), OS com o mesmo numero, adendos e mecanicos
  (funcao teste_levar_tudo, script fonte/pwa/teste_os_3_levar.sql; antes rodar teste_os_1_copia_seguranca.sql e teste_os_2_conferir.sql;
  desfazer: teste_os_3_levar_desfazer.sql). Depois de levar, o teste NAO e atualizado. Feito direto em teste/ (o teste nao tem fonte propria).
- CUIDADO: publicar.sh sobrescreve teste/ com o oficial. Enquanto o teste tiver trabalho proprio, restaurar teste/ antes de enviar.
