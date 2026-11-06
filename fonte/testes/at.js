const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// excluir equipamento com registros: bloqueia
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="x:eq"]');await W();await p.click('#sheet [data-m="dl-eq"]');await W();
await p.fill('#pd-q','cb-05');await W();await p.click('#sheet [data-pd="CB-05"]');await W();await p.click('#dl-go');await W(700);
console.log('bloqueio:',await p.evaluate(()=>document.querySelector('#delbox')?.innerText));await p.screenshot({path:'at1.png'});
await p.click('#delbox [data-go]');await W(900);
console.log('CB-05 status',(await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-05').get()).data().status)));
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();
console.log('secoes',await p.evaluate(()=>[...document.querySelectorAll('[data-eqt]')].map(h=>h.textContent).slice(-2)));
await p.click('[data-eqt="__ina"]');await W();await p.click('[data-eq="CB-05"]');await W(700);console.log('ficha',await p.evaluate(()=>document.querySelector('#sheet .nv-b')?.innerText));
// cronograma sem CB-05
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
// reativar pelo editar
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="x:eq"]');await W();await p.click('#sheet [data-m="ed-eq"]');await W();
await p.fill('#sheet input[type=search]','cb-05');await W();await p.click('#sheet [data-pe="CB-05"]');await W(700);
await p.evaluate(()=>document.querySelector('[data-at]').scrollIntoView({block:'center'}));console.log('botao',await p.evaluate(()=>document.querySelector('[data-at]').textContent));
await p.click('[data-at]');await W(300);await p.screenshot({path:'at2.png'});await p.click('.at-ask [data-go]');await W(900);
console.log('CB-05 status',(await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-05').get()).data().status)));
// equipamento sem registros: exclui
await p.evaluate(async()=>{await window.__db.doc('equipamentos/ZZ-99').set({codigo:'ZZ-99',tipo:'Teste',status:'ativo',itens:[]})});await W(500);
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="x:eq"]');await W();await p.click('#sheet [data-m="dl-eq"]');await W();
await p.fill('#pd-q','zz');await W();await p.click('#sheet [data-pd="ZZ-99"]');await W();await p.click('#dl-go');await W(700);console.log('sem vinculo:',await p.evaluate(()=>document.querySelector('#delbox')?.innerText.slice(0,80)));
// item do estoque com registros
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="est"]');await W();await p.click('#sheet [data-m="x:st"]');await W();await p.click('#sheet [data-m="dl-st"]');await W();
await p.fill('#pd-q','273-5711');await W();await p.click('#sheet [data-pd]');await W();await p.click('#dl-go');await W(700);console.log('item:',await p.evaluate(()=>document.querySelector('#delbox')?.innerText));
console.log('ERR',errs);await b.close()})();
