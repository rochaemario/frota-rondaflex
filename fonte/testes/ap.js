const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const d=n=>new Date(Date.now()-n*864e5-4*36e5).toISOString().slice(0,10);
Object.assign(seed['equipamentos/CB-01'],{horimetro:1000,horimetroData:d(2),combBase:{h:1000,data:d(2),pend:0}});
Object.assign(seed['equipamentos/CB-03'],{horimetro:500,horimetroData:d(10)});
const m=d(0).slice(0,7);seed['comb/'+m]={eq:{'CB-01':{lt:300,n:3,l:300,h:30}},dia:{}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:n==="downloads"?{save:async o=>{window.__saved={fn:o.filename,txt:await o.data.text()}}}:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||250);
const toast=()=>p.evaluate(()=>document.querySelector('#toast')?.textContent||'');
// A: Horímetros
await p.evaluate(()=>document.getElementById('sidehm').click());await W(400);
console.log('old tag CB-03:',await p.evaluate(()=>document.querySelector('.lr[data-id="CB-03"] .lr-p').textContent));
await p.fill('.lr[data-id="CB-01"] .lr-in','1100');await W();
console.log('aviso:',await p.evaluate(()=>document.querySelector('.lr[data-id="CB-01"] .lr-w').textContent));
await p.click('#lr-save');await W();console.log('conf:',await p.evaluate(()=>document.querySelector('#lr-conf').textContent.slice(0,120)));
await p.screenshot({path:'ap-a.png'});
await p.click('#lr-conf [data-go]');await W(500);
console.log('salvo hm:',await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-01').get()).data().horimetro),await toast());
// reset CB-01 to 1000 for abastecimento test
await p.evaluate(async d2=>{await window.__db.doc('equipamentos/CB-01').update({horimetro:1000,horimetroData:d2})},d(2));await W(300);
// C: abastecimento salto
await p.evaluate(()=>document.getElementById('fab').click());await W(300);await p.click('[data-m="abast"]');await W(400);
await p.selectOption('#ab-eq','CB-01');await p.fill('#ab-hm','1200');await p.fill('#ab-l','100');
await p.evaluate(()=>document.querySelector('#fab-f').requestSubmit());await W(400);
console.log('abast salto:',await p.evaluate(()=>document.querySelector('#ab-g').textContent.slice(0,60)));
await p.fill('#ab-hm','1002');await p.evaluate(()=>document.querySelector('#fab-f').requestSubmit());await W(500);
console.log('abast consumo:',await p.evaluate(()=>document.querySelector('#ab-g').textContent.slice(0,140)));
await p.screenshot({path:'ap-c.png'});
await p.click('#ab-g [data-go]');await W(600);console.log('lançado:',await toast());
// D: backup
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W(300);await p.evaluate(()=>{const b=document.querySelector('#sheet [data-back]');b&&b.click()});await W(300);await p.evaluate(()=>document.getElementById('fab').click());await W(400);await p.screenshot({path:'ap-d.png'});
await p.click('[data-m="backup"]');await W(1200);
console.log('backup:',await p.evaluate(()=>window.__saved&&[window.__saved.fn,window.__saved.txt.length,Object.keys(JSON.parse(window.__saved.txt).dados).join(','),Object.keys(JSON.parse(window.__saved.txt).dados.combustivel).join(',')]),await toast());
console.log('ERR',errs);await b.close()})();
