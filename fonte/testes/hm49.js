const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__t=()=>({oleoRef,ehOleo,oleoMotor,eqById});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
for(const [k,v] of Object.entries(seed)){if(k.startsWith('estoque/')&&/bardahl/i.test(v.desc)){v.tipo='Aditivo';v.sub='Oleo lubrificante'}
 if(k.startsWith('equipamentos/'))(v.itens||[]).forEach(i=>{if(/bardahl/i.test(i.desc)){i.tipo='Aditivo';i.sub='Oleo lubrificante'}});}
seed['equipamentos/CB-06'].horimetro=4.9;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||450);
const txt=async()=>(await p.evaluate(()=>document.querySelector('#sheet .sh-body')?.innerText||''));
await p.evaluate(()=>window.__al('eq:CB-06'));await W(900);console.log('ficha:',(await txt()).match(/Horimetro[\s\S]{0,40}/)?.[0].replace(/\n/g,' '));
await p.evaluate(()=>window.__al('cr:CB-06'));await W(900);console.log('pend:',(await txt()).replace(/\n/g,' / ').slice(0,200));
console.log('ERR',errs);await b.close()})();
