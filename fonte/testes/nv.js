const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
await p.evaluate(async()=>{await window.__db.doc('equipamentos/RE-04').update({intervaloPrev:500,horimetro:550,itens:[]});await window.__db.doc('equipamentos/RE-05').update({intervaloPrev:500,horimetro:400,itens:[{pid:'x',desc:'Filtro X',tipo:'filtro',ultimaH:400,proxH:900}]})});
await W(3500);
const re4=await p.evaluate(async()=>(await window.__db.doc('equipamentos/RE-04').get()).data().novo0);console.log('RE-04 novo0',re4);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="manut"]');await W();
console.log('cron',await p.evaluate(()=>[...document.querySelectorAll('[data-cron]')].slice(0,4).map(b=>b.textContent)));
console.log('painel tem RE-04?',await p.evaluate(()=>{return 0}));
// ficha RE-05: botao equipamento novo
await p.click('[data-fr]').catch(()=>{});
await p.evaluate(()=>{document.querySelector('[data-a="up"]')?.click()});await W();await p.click('[data-fr="equip"]');await W();
await p.evaluate(q=>{const b=document.querySelector(q);const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()},'[data-eq="RE-05"]');await W();await p.click('[data-eq="RE-05"]');await W(800);
const nb=await p.$('#sheet [data-nv="1"]');console.log('botao novo RE-05',!!nb);await p.evaluate(()=>document.querySelector('#sheet .nv-b').scrollIntoView({block:'center'}));await p.screenshot({path:'nv1.png'});
await nb.click();await W(900);const e5=await p.evaluate(async()=>(await window.__db.doc('equipamentos/RE-05').get()).data());console.log('RE-05',e5.novo0,JSON.stringify(e5.itens));
console.log('sheet',await p.evaluate(()=>document.querySelector('#sheet .nv-b')?.innerText));await p.evaluate(()=>document.querySelector('#sheet .nv-b').scrollIntoView({block:'center'}));await p.screenshot({path:'nv2.png'});
console.log('RE-05 itens status',await p.evaluate(()=>[...document.querySelectorAll('#sheet .ia-h')].map(h=>h.textContent.trim())));
// ficha RE-04
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.evaluate(q=>{const b=document.querySelector(q);const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()},'[data-eq="RE-04"]');await W();await p.click('[data-eq="RE-04"]');await W(800);
console.log('RE-04 ficha',await p.evaluate(()=>[document.querySelector('#sheet .nv-b')?.innerText,[...document.querySelectorAll('#sheet .ia-h')].map(h=>h.textContent.trim())]));
console.log('ERR',errs);await b.close()})();
