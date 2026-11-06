const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
for(const [k,v] of Object.entries(seed)){if(k==='equipamentos/CB-05'){v.horimetro=29237;v.intervaloPrev=250}if(k==='equipamentos/PC-02')v.horimetro=123456;if(k==='estoque/cat-360-8960')v.qtd=99999}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);

const W2=ms=>p.waitForTimeout(ms||500);
const chk=async n=>{const r=await p.evaluate(()=>{const o=[];document.querySelectorAll('.es-b,.dday,.lt-c,.ef-sum>div,.ct-b').forEach(el=>{if(!el.offsetParent)return;const c=el.getBoundingClientRect();[el,...el.querySelectorAll('*')].forEach(x=>{const r=x.getBoundingClientRect();if(r.width&&(r.right>c.right+1||r.left<c.left-1||r.bottom>c.bottom+1))o.push(el.className+': '+el.textContent.trim().slice(0,20))});if(el.scrollWidth>el.clientWidth+1)o.push('scroll '+el.className+': '+el.textContent.trim().slice(0,20))});return [...new Set(o)]});console.log(n,r.length?r:'OK')};
await chk('inicio');
for(const t of await p.$$eval('[data-pntab]',a=>a.map(x=>x.dataset.pntab))){await p.click('[data-pntab="'+t+'"]');await W2();await chk('painel '+t)}await p.screenshot({path:'fit0.png'});
await p.click('[data-acc="frota"]');await W2();await p.click('[data-fr="manut"]');await W2(800);await chk('manut');
await p.screenshot({path:'fit1.png'});
await p.click('[data-a="up"]');await W2();await p.click('[data-a="up"]').catch(()=>{});await W2();
await p.click('[data-acc="estoque"]');await W2();await p.click('[data-estab="rel"]');await W2();await chk('estoque');
await p.screenshot({path:'fit2.png'});
await p.click('[data-a="up"]').catch(()=>{});await W2();await p.click('[data-pntab="eq"]').catch(()=>{});await W2();
const h1=await p.$('.pn-r .ia-h');if(h1){await h1.click();await W2(700)}await chk('painel expandido');await p.screenshot({path:'fit3.png'});
console.log('ajustadas:',await p.evaluate(()=>[...document.querySelectorAll('[data-fit]')].map(x=>x.textContent.trim().slice(0,12))));
console.log('ERR',errs);await b.close()})();
