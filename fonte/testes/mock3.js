const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const C='data:image/png;base64,'+fs.readFileSync('logo.png.b64','utf8'),Wt='data:image/png;base64,'+fs.readFileSync('logo-w.png.b64','utf8');
const V={
 I:[`<div class="brand"><img src="${C}" style="height:22px"></div><div class="sync on" style="color:#4f5a70">Sincronizado</div>`,'#fff|none'],
 J:[`<div class="brand"><img src="${C}" style="height:22px"></div><div class="sync on" style="color:#4f5a70">Sincronizado</div>`,'#fff|3px solid #e30613']
};
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark'])for(const [k,[h,st]] of Object.entries(V)){const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:sc})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.evaluate(([h,st])=>{const hd=document.querySelector('header');const [bg,bb]=st.split('|');hd.style.background=bg;hd.style.borderBottom=bb;hd.style.boxShadow='0 1px 0 rgba(0,0,0,.06)';document.body.style.setProperty('--ink-bar',bg);const t=document.querySelector('header .top');t.style.position='relative';t.innerHTML=h},[h,st]);await pg.waitForTimeout(200);
 await pg.screenshot({path:`mk-${sc}-${k}.png`,clip:{x:0,y:0,width:390,height:230}})}
await b.close()})();
