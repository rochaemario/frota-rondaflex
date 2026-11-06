const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const chk=async n=>{const h=await p.$$eval('.tsec-h.tg span',a=>a.map(x=>x.textContent));const s=[...h].sort((a,b)=>(a==='Sem tipo')-(b==='Sem tipo')||a.localeCompare(b,'pt-BR'));console.log(n,h.length,JSON.stringify(h)===JSON.stringify(s)?'OK':'FORA',h.join(' | '))};
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="aloc"]');await W();
for(const s of await p.$$eval('[data-site]',a=>a.map(x=>x.dataset.site))){await p.click(`[data-site="${s}"]`);await W();await chk('site '+s);
  for(const ar of await p.$$eval('[data-area]',a=>a.map(x=>x.dataset.area))){await p.click(`[data-area="${ar}"]`);await W();await chk(' area '+ar);await p.click('[data-a="up"]');await W()}
  const dv=await p.$('[data-dmv="all"]');if(dv){await dv.click();await W();await chk(' todos');}
  await p.click('[data-a="up"]');await W()}
console.log('ERR',errs);await b.close()})();
