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
`/home/claude/publicar.sh vNNN "mensagem"` — confere mudancas de fora, gera, guarda a fonte e marca a etiqueta vNNN.

## Desfazer ("voltar vNNN")
Cada versao publicada tem uma etiqueta (tag) vNNN no repositorio, com a fonte junto.
Para voltar: pegar `fonte/` da etiqueta desejada, restaurar e publicar como nova versao.
