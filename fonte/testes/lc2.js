const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
for(const [k,v] of Object.entries(seed)){if(k==='equipamentos/CB-05')v.horimetro=29237}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);

await p.click('[data-pntab="eq"]').catch(()=>{});await W();
for(const r of await p.$$eval('.pn-r',a=>a.map(x=>x.querySelector('.ia-h').textContent.trim().slice(0,6)))){
  await p.evaluate(c=>{const r=[...document.querySelectorAll('.pn-r')].find(x=>x.querySelector('.ia-h').textContent.trim().startsWith(c));r.querySelector('.ia-h').click()},r);await W(500);
  const has=await p.evaluate(c=>{const r=[...document.querySelectorAll('.pn-r')].find(x=>x.querySelector('.ia-h').textContent.trim().startsWith(c));return r?r.querySelector('.pn-bt')&&r.querySelector('.pn-bt').textContent:''},r);console.log(r,'|',has)}
for(let i=0;i<2;i++){const b2=await p.$('[data-cartadd^="eq:"]');console.log('botao',!!b2,await p.evaluate(()=>[...document.querySelectorAll('.pn-bt')].map(x=>x.textContent).join(' / ')));if(b2){await b2.click();await W(900);console.log('toast',await p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).join(' | ')))}}
console.log('ERR',errs);await b.close()})();
