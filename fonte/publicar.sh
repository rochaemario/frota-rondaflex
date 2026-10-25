#!/bin/bash
# Publica o app. Uso: publicar.sh vNNN "mensagem"
# 1) confere se o app foi mudado fora desta conversa (outro chat): se foi, PARA sem publicar
# 2) gera o app a partir da fonte, guarda a fonte em fonte/ e guarda a versao no ramo versao-vNNN (ponto de desfazer)
set -e
V="$1"; MSG="$2"; [ -n "$V" ] && [ -n "$MSG" ] || { echo "uso: publicar.sh vNNN \"mensagem\""; exit 2; }
R=/home/claude/frota-rondaflex; P=/home/claude/pwa
cd "$R"
git fetch -q origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse FETCH_HEAD)" ]; then
  echo "PARE: o app foi alterado fora desta conversa. Incorpore essas mudancas na fonte antes de publicar:"
  git log --oneline HEAD..FETCH_HEAD; exit 3
fi
cd "$P" && python3 build.py
cp -r "$P/dist/." "$R/"
mkdir -p "$R/fonte/pwa"
cp /home/claude/frota.html "$R/fonte/frota.html.txt"
rm -rf "$R/fonte/pwa/src" && cp -r "$P/src" "$R/fonte/pwa/src" && cp "$P/build.py" "$R/fonte/pwa/build.py"
cp /home/claude/publicar.sh "$R/fonte/publicar.sh"
cd "$R"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -q -m "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QbG75wh77UffNvP6h7Xaws"
git push -q origin main && git push -q -f origin "HEAD:refs/heads/versao-$V"
git fetch -q origin main:refs/remotes/origin/main --force
git log --oneline -1; echo "publicado; ponto de desfazer: ramo versao-$V"
