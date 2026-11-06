const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
const e0=await eq('PC-02');const H=Number(e0.horimetro)+10;console.log('PC-02 itens',e0.itens.length,'hm',e0.horimetro,'ivPrev',e0.intervaloPrev);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="ed"]');await W();
await p.fill('#pt-q','cb03');await W();const pts=await p.$$eval('[data-pt]',x=>x.map(b=>b.textContent));console.log(pts);const all=await p.$$('[data-pt]');await p.evaluate(()=>document.querySelector('[data-pt]').click());await W(700);
const t0=await p.evaluate(()=>document.querySelector('#sheet .sh-sub,#sheet .sub')?.textContent);console.log('troca',t0);
await p.click('.et-h[data-k="0"]');await W();await p.click('[data-md="sb"]');await W();
const iv=await p.$('#et-iv');console.log('select substituir',!!iv);if(iv)await iv.selectOption('500');
await p.fill('#et-sq','360');await W();await p.screenshot({path:'iv5.png'});await p.click('#et-sh [data-pk]');await W();
await p.click('button[form="fet"]');await W(900);
for(let i=0;i<3;i++){const b=await p.$('#sheet [data-ok],#et-conf .btn.pri,.ask .btn.pri');if(!b)break;const tx=await b.textContent();console.log('conf',tx);await b.click();await W(900)}
const e=await eq('CB-03');console.log(JSON.stringify(e.itens.filter(i=>i.ivSel!=null).map(i=>[i.desc.slice(0,20),i.ivSel,i.ultimaH,i.proxH])));
console.log('troca itens',JSON.stringify(await p.evaluate(async()=>(await window.__db.doc('trocas/inf-CB-03-2026-09-30').get()).data().itens.map(i=>i.espec))));console.log('ERR',errs);await b.close()})();
