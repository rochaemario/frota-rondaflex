const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||450);
await p.evaluate(()=>window.__al('fe:CB-08'));await W(900);
const r=await p.evaluate(()=>{const row=[...document.querySelectorAll('#plan .pe2')].find(x=>/Filtro do combustivel/.test(x.textContent));row.querySelector('[data-trh]').click();row.id='rx';return row.querySelector('[data-piv]')?.value});
console.log('iv atual:',r);await W();await p.evaluate(()=>document.querySelector('#rx').scrollIntoView({block:'center'}));await p.screenshot({path:'iv2.png'});
await p.selectOption('#rx [data-piv]','250');await p.click('.sh-foot .btn.pri');await W(1200);
const d=await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-08').get()).data().itens.map(i=>[i.desc,i.ivSel,i.proxH].join('/')));console.log(d.join(' | '));
await p.evaluate(()=>window.__al('pend:CB-08'));await W(900);console.log((await p.evaluate(()=>document.querySelector('#sheet .sh-body')?.innerText||document.querySelector('#sheet h2')?.textContent)||'').slice(0,400));
console.log('ERR',errs);await b.close()})();
