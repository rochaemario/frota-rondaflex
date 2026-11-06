const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const has=async()=>p.evaluate(()=>document.querySelector('#app').innerHTML.includes('VL-01'));
await p.click('[data-acc="frota"]');await W();
for(const k of ['comb','manut','equip','aloc']){await p.click(`[data-fr="${k}"]`);await W(600);
  if(k==='manut'){await p.fill('#pq','vl');await W();}if(k==='aloc'){await p.click('[data-site="PQ"]');await W();}
  console.log(k,'VL visivel:',await has());await p.click('[data-a="up"]');await W()}
await p.evaluate(()=>document.getElementById('sidehm').click());await W(600);console.log('horimetro VL:',await p.evaluate(()=>!!document.querySelector('.lr[data-id="VL-01"]')));
for(let i=0;i<3;i++){await p.keyboard.press('Escape');await W(250)}
await p.click('#fab');await W();await p.click('.mi:has-text("Frota")');await W();await p.click('.mi:has-text("Equipamentos")');await W();await p.click('.mi:has-text("Editar")');await W(600);
await p.fill('#pe-q','vl-01');await W();await p.click('[data-pe]');await W(800);
console.log('botao:',await p.textContent('#sc-b'));await p.evaluate(()=>document.querySelector('#sc-b').scrollIntoView({block:'center'}));await p.screenshot({path:'vl1.png'});
await p.click('#sc-b');await W(800);console.log('botao:',await p.textContent('#sc-b'),await p.evaluate(async()=>(await window.__db.doc('equipamentos/VL-01').get()).data().soCad));
for(let i=0;i<5;i++){await p.keyboard.press('Escape');await W(250)}
await p.evaluate(()=>document.getElementById('sidehm').click());await W(600);console.log('horimetro VL-01 apos desligar:',await p.evaluate(()=>!!document.querySelector('.lr[data-id="VL-01"]')),'VL-02:',await p.evaluate(()=>!!document.querySelector('.lr[data-id="VL-02"]')));
for(let i=0;i<3;i++){await p.keyboard.press('Escape');await W(250)}
// botao fora do +: ficha nao tem
await p.click('[data-acc="frota"]').catch(()=>{});
console.log('ERR',errs);await b.close()})();
