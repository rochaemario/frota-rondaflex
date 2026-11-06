const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const C='data:image/png;base64,'+fs.readFileSync('logo.png.b64','utf8'),Wt='data:image/png;base64,'+fs.readFileSync('logo-w.png.b64','utf8');
const O1='data:image/png;base64,'+fs.readFileSync('logo-o1.b64','utf8'),O2='data:image/png;base64,'+fs.readFileSync('logo-o2.b64','utf8');
const V={
 K:[`<div class="brand"><img src="${O1}" style="height:24px"></div><div class="sync on">Sincronizado</div>`,''],
 L:[`<div class="brand"><img src="${O2}" style="height:26px"></div><div class="sync on">Sincronizado</div>`,''],
 M:[`<div class="brand" style="gap:10px;font-size:17px;white-space:nowrap"><img src="${O1}" style="height:20px">Controle de Frota</div><span class="sync on"></span>`,''],
 N:[`<span style="width:10px;height:28px"></span><div class="brand" style="position:absolute;left:50%;transform:translateX(-50%)"><img src="${O1}" style="height:26px"></div><span class="sync on"></span>`,'']
};
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark'])for(const [k,[h]] of Object.entries(V)){const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:sc})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.evaluate(h=>{const t=document.querySelector('header .top');t.style.position='relative';t.innerHTML=h},h);await pg.waitForTimeout(200);
 await pg.screenshot({path:`mk-${sc}-${k}.png`,clip:{x:0,y:0,width:390,height:230}})}
await b.close()})();
