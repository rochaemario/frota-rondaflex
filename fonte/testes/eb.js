const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// CB-05 como no print: ultima preventiva em 346 (25/08), itens com vencimentos gravados diferentes
const r=await p.evaluate(async()=>{const S0=await window.__db.doc('equipamentos/CB-05').get();const e=S0.data();
  return {hm:e.horimetro,iv:e.intervaloPrev,it:(e.itens||[]).map(i=>[i.desc,i.ultimaH,i.proxH,i.ivSel??null,!!i.reprog])}});
console.log(JSON.stringify(r));
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="manut"]');await W();
await p.click('[data-cron="CB-05"]').catch(()=>console.log('CB-05 fora do cronograma'));await W(700);
console.log(await p.evaluate(()=>[...document.querySelectorAll('#sheet .ia-h')].map(h=>h.textContent.trim())));
// excecao: muda um item para ivSel 250
await p.evaluate(async()=>{const d=(await window.__db.doc('equipamentos/CB-05').get()).data();d.itens[0].ivSel=250;d.itens[0].proxH='';await window.__db.doc('equipamentos/CB-05').update({itens:d.itens})});await W(700);
console.log('com excecao',await p.evaluate(()=>[...document.querySelectorAll('#sheet .ia-h')].map(h=>h.textContent.trim())));
console.log('cron top',await p.evaluate(()=>[...document.querySelectorAll('[data-cron]')].slice(0,6).map(b=>b.textContent)));
console.log('ERR',errs);await b.close()})();
