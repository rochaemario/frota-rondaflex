const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const C='data:image/png;base64,'+fs.readFileSync('logo.png.b64','utf8'),Wt='data:image/png;base64,'+fs.readFileSync('logo-w.png.b64','utf8');
const V={
 A:[`<div class="brand" style="gap:9px;font-size:18px;white-space:nowrap"><img src="${Wt}" style="height:16px"><span style="width:1px;height:18px;background:rgba(255,255,255,.3)"></span>Controle de Frota</div><span class="sync on"></span>`,''],
 B:[`<div class="brand" style="gap:9px;font-size:18px;white-space:nowrap"><span style="background:#fff;border-radius:6px;padding:4px 6px;line-height:0"><img src="${C}" style="height:14px"></span>Controle de Frota</div><span class="sync on"></span>`,''],
 C:[`<div class="brand" style="flex-direction:column;align-items:flex-start;gap:4px"><img src="${Wt}" style="height:20px"><span style="font-size:12.5px;letter-spacing:.14em;color:var(--ink-muted)">Controle de Frota</span></div><div class="sync on">Sincronizado</div>`,''],
 D:[`<div class="brand" style="white-space:nowrap;font-size:17px"><i></i>Controle de Frota</div><div style="display:flex;align-items:center;gap:10px"><span class="sync on"></span><img src="${Wt}" style="height:13px"></div>`,'']
};
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark'])for(const [k,[h]] of Object.entries(V)){const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:sc})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.evaluate(h=>{document.querySelector('header .top').innerHTML=h},h);await pg.waitForTimeout(200);
 await pg.screenshot({path:`mk-${sc}-${k}.png`,clip:{x:0,y:0,width:390,height:230}})}
await b.close()})();
