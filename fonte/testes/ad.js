const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__t=()=>({oleoRef,ehOleo,oleoMotor,eqById});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
for(const [k,v] of Object.entries(seed)){if(k.startsWith('estoque/')&&/bardahl/i.test(v.desc)){v.tipo='Aditivo';v.sub='Oleo lubrificante'}
 if(k.startsWith('equipamentos/'))(v.itens||[]).forEach(i=>{if(/bardahl/i.test(i.desc)){i.tipo='Aditivo';i.sub='Oleo lubrificante'}});}
const c8=seed['equipamentos/CB-08'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||450);
const txt=async()=>(await p.evaluate(()=>document.querySelector('#sheet .sh-body')?.innerText||''));
await p.evaluate(()=>window.__al('cr:CB-08'));await W(900);console.log('CB-08 pend:',(await txt()).replace(/\n/g,' / ').slice(0,420));
await p.evaluate(()=>window.__al('cr:CB-05'));await W(900);console.log('CB-05 pend:',(await txt()).replace(/\n/g,' / ').slice(0,300));
// registrar preventiva CB-08 com Ursa -> remove Troca de oleo do motor (simula pela API de dados? usa formulario)
await p.evaluate(()=>window.__al('fs:QrF967kZMx1lmNbMh6Sm'));await W(900);console.log('estoque sub visivel:',await p.evaluate(()=>!document.querySelector('#s-subw').hidden),await p.evaluate(()=>document.querySelector('#s-sub').value));
await p.selectOption('#s-tipo','Aditivo');await p.selectOption('#s-sub','');await p.click('.sh-foot .btn.pri');await W(600);console.log('toast:',await p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).pop()));
await p.screenshot({path:'ad1.png'});
await p.evaluate(()=>window.__al('fe:CB-05'));await W(900);
console.log('db:',await p.evaluate(async()=>JSON.stringify((await window.__db.doc('equipamentos/CB-05').get()).data().itens.find(i=>/ardahl/.test(i.desc)))));console.log('rows:',await p.evaluate(()=>[...document.querySelectorAll('#plan .pe2')].map(r=>r.querySelector('[data-pn]').textContent+'='+r.querySelector('[data-p=tipo]').value).join(' | ')));console.log('plan sub:',await p.evaluate(()=>{const r=[...document.querySelectorAll('#plan .pe2')].find(x=>/Bardahl/.test(x.textContent));r.querySelector('[data-trh]').click();return r.querySelector('.pe-sub').outerHTML.slice(0,300)+' TIPO='+r.querySelector('[data-p=tipo]').value}));
console.log('refs:',await p.evaluate(()=>{const T=window.__t(),e=T.eqById('CB-08');return e.itens.map(i=>i.desc+':'+T.ehOleo(i)+':'+T.oleoRef(i)+':'+T.oleoMotor(i)).join(' | ')}));console.log('ERR',errs);await b.close()})();
