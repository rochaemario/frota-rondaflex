const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
await p.evaluate(async()=>{await window.__db.doc('equipamentos/CB-05').update({intervaloPrev:300,horimetro:680,horimetroData:'2026-10-20',combBase:{h:600,data:'2026-10-01',pend:0},novo0:false})});await W(800);
const ed=async()=>{await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="x:eq"]');await W();await p.click('#sheet [data-m="ed-eq"]');await W();
await p.fill('#sheet input[type=search]','cb-05');await W();await p.click('#sheet [data-pe="CB-05"]');await W(700)};
await ed();
await p.evaluate(()=>document.querySelector('#sheet .ivp-seg').scrollIntoView({block:'start'}));await p.screenshot({path:'fe1.png'});
await p.click('#sheet [data-ivb="350"]');
await p.click('#plan .pe2 .tr-h .main');await W(300);await p.evaluate(()=>document.querySelector('#plan .pe2.op').scrollIntoView({block:'center'}));await p.screenshot({path:'fe2.png'});
await p.fill('#plan .pe2.op [data-p="qtd"]','2');
await p.fill('#p-q','360-8960');await W();const pk=await p.$('#p-qh [data-pk]');console.log('sugestao',!!pk);if(pk){await pk.click();await W()}
// remove o segundo
await p.click('#plan .pe2 >> nth=1 >> .tr-h .main');await W(200);await p.click('#plan .pe2.op >> nth=1 >> [data-rm]').catch(async()=>{await p.click('#plan .pe2.op [data-rm]')});await W();
// horimetro menor
await p.fill('#e-horimetro','600');
await p.click('#sheet button.pri[form]');await W(800);
const cf=await p.$('#delbox button:has-text("Excluir e salvar")');if(cf){console.log('confirma remocao');await cf.click();await W(800)}
await p.screenshot({path:'fe3b.png'});console.log('delbox',await p.evaluate(()=>document.querySelector('#delbox')?.innerText));console.log('aviso hm',await p.evaluate(()=>document.querySelector('#e-hmg')?.innerText));
await p.evaluate(()=>document.querySelector('#e-hmg').scrollIntoView({block:'center'}));await p.screenshot({path:'fe3.png'});
await p.click('#e-hmg [data-cor]');await W(300);console.log('confirma',await p.evaluate(()=>document.querySelector('#e-hmg')?.innerText));await p.click('#e-hmg [data-go]');await W(1500);
const e=await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-05').get()).data());
console.log('salvo',e.horimetro,e.intervaloPrev,JSON.stringify(e.combBase),e.novo0,JSON.stringify(e.hmCorr),JSON.stringify(e.itens.map(i=>[i.desc,i.qtd,i.ultimaH,i.estoqueId])));
console.log('tela',await p.evaluate(()=>document.querySelector('#sheet .sh-tt')?.textContent));
console.log('ERR',errs);await b.close()})();
