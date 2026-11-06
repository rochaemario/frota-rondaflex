const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
for(const [k,v] of Object.entries(seed)){if(k.startsWith('trocas/')&&v.equipId==='CB-01')delete seed[k];if(k==='equipamentos/CB-01'){v.intervaloPrev=500;v.horimetro=9000;v.itens=[]}}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);

await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();
await p.evaluate(()=>{const b=document.querySelector('[data-eq="CB-01"]');const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()});await W();await p.click('[data-eq="CB-01"]');await W(800);
console.log('botao:',!!(await p.$('[data-ultp]')));await p.evaluate(()=>document.querySelector('[data-ultp]').scrollIntoView({block:'center'}));await p.screenshot({path:'up1.png'});
await p.click('[data-ultp]');await W(600);
await p.fill('#up-dt','2026-09-01');await p.fill('#up-hm','9500');await p.click('.sh-foot .btn.pri');await W(500);console.log('maior:',await p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).pop()));
await p.fill('#up-hm','8700');await p.click('.sh-foot .btn.pri');await W(900);
console.log('apos salvar, botao:',!!(await p.$('[data-ultp]')),'| sheet:',await p.textContent('#sheet h2'));
const tr=await p.evaluate(async()=>{const q=await window.__db.collection('trocas').get();return q.docs.map(d=>d.data()).filter(t=>t.equipId==='CB-01')});console.log('troca:',JSON.stringify(tr));
await p.evaluate(()=>{const b=document.querySelector('#sheet .sh-body');b.scrollTop=b.scrollHeight});await W(4500);await p.screenshot({path:'up2.png'});await p.click('#sheet .ia-h.hh');await W(700);console.log('abriu:',await p.textContent('#sheet h2'),'|',await p.evaluate(()=>document.querySelector('#sheet .nv-b')?.innerText));await p.screenshot({path:'up3.png'});await p.click('#sheet [data-back]');await W(500);for(let i=0;i<4;i++){await p.keyboard.press('Escape');await W(200)}
await p.click('[data-a="up"]').catch(()=>{});await W();await p.click('[data-fr="manut"]').catch(()=>{});await W(800);
console.log('cronograma CB-01:',await p.evaluate(()=>{const b=document.querySelector('[data-cron="CB-01"]');return b?b.textContent:'-'}));
console.log('ERR',errs);await b.close()})();
