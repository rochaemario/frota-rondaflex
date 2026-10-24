#!/usr/bin/env python3
"""Gera o app baixável (pasta dist/) a partir do mesmo frota.html do Claude.
Assim, toda mudança feita no app do Claude passa para o app baixável com um novo build."""
import json, os, re, shutil, hashlib, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(ROOT), 'frota.html')
DIST = os.path.join(ROOT, 'dist')
SB_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'

def main():
    app = open(SRC, encoding='utf-8').read()
    cut = app.index('</style>') + len('</style>')
    head, body = app[:cut], app[cut:]
    head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
    n = body.count("const blobUrl=id=>'/_blob/'+id;")
    assert n == 1, 'blobUrl não encontrado'
    body = body.replace("const blobUrl=id=>'/_blob/'+id;", "const blobUrl=id=>window.__blobUrl(id);")
    h = hashlib.sha1((app + open(os.path.join(ROOT, 'src', 'shim.js'), encoding='utf-8').read()).encode())
    for f in ('sw.js', 'leitor.html', 'manifest.webmanifest'):
        fp = os.path.join(ROOT, 'src', f)
        if os.path.exists(fp):
            h.update(open(fp, 'rb').read())
    for f in sorted(os.listdir(os.path.join(ROOT, 'src', 'icons'))):
        h.update(open(os.path.join(ROOT, 'src', 'icons', f), 'rb').read())
    ver = h.hexdigest()[:10]
    page = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Frota">
<style>:root{{color-scheme:light}}body{{margin:0}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
{head}
<script src="{SB_JS}"></script>
<script src="config.js?v={ver}"></script>
<script src="shim.js?v={ver}"></script>
</head>
<body>{body}
</body>
</html>
'''
    if os.path.isdir(DIST):
        for f in os.listdir(DIST):
            p = os.path.join(DIST, f)
            if f in ('config.js', '.git', 'CNAME'):
                continue
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    os.makedirs(DIST, exist_ok=True)
    open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(page)
    shutil.copy(os.path.join(ROOT, 'src', 'shim.js'), DIST)
    shutil.copytree(os.path.join(ROOT, 'src', 'icons'), os.path.join(DIST, 'icons'))
    if not os.path.exists(os.path.join(DIST, 'config.js')):
        shutil.copy(os.path.join(ROOT, 'src', 'config.js'), DIST)
    man = json.load(open(os.path.join(ROOT, 'src', 'manifest.webmanifest'), encoding='utf-8'))
    json.dump(man, open(os.path.join(DIST, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sw = open(os.path.join(ROOT, 'src', 'sw.js'), encoding='utf-8').read().replace('__VER__', ver)
    open(os.path.join(DIST, 'sw.js'), 'w', encoding='utf-8').write(sw)
    open(os.path.join(DIST, '.nojekyll'), 'w').close()
    if os.path.exists(os.path.join(ROOT, 'src', 'leitor.html')):
        shutil.copy(os.path.join(ROOT, 'src', 'leitor.html'), DIST)
    print('ok', ver, len(page))

if __name__ == '__main__':
    main()
