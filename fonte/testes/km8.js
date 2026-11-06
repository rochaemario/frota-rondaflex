const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
const MOD={'CONSTELATION 31280':'CONSTELLATION 31.280','AXOR 2831 6X4':'AXOR 2831'};
for(const [k,v] of Object.entries(seed)){if(k.startsWith('equipamentos/')){const m=String(v.modelo||'').toUpperCase();if(MOD[m])v.modelo=MOD[m];if(v.codigo==='RE-05'){v.marca='Caterpillar';v.modelo='416'}}
 if(v.kit&&v.codigo==='KIT-500')Object.assign(v,{kMarca:'Caterpillar',kModelo:'416',kIv:500,desc:'KIT CATERPILLAR 416 - 500H',encaixe:[],qtd:0});
 if(v.kit&&v.codigo==='KIT-1000')Object.assign(v,{kMarca:'Volvo',kModelo:'L60',kIv:1000,desc:'KIT VOLVO L60 - 1000H',encaixe:[],qtd:0});}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||450);
await p.evaluate(()=>window.__al('kits'));await W(800);await p.click('[data-km="CATERPILLAR|416"]');await W(600);await p.click('[data-kk]');await W(600);await p.click('#km-e');await W(700);
await p.evaluate(()=>{const i=[...document.querySelectorAll('#k-mods input')].find(x=>x.value==='CATERPILLAR|320');i.click()});await W(200);
console.log('nome:',await p.evaluate(()=>document.querySelector('#k-nm').textContent));
await p.evaluate(()=>document.querySelector('#k-mods').scrollIntoView({block:'center'}));await p.screenshot({path:'km7.png'});
await p.click('.sh-foot .btn.pri');await W(1200);
const k=await p.evaluate(async()=>{const K=(await window.__db.collection('estoque').get()).docs.map(d=>d.data()).find(v=>v.codigo==='KIT-500');return JSON.stringify({d:K.desc,m:K.kMods,mo:K.kModelo})});console.log(k);
await p.evaluate(()=>window.__al('kmod:CATERPILLAR|320'));await W(800);console.log('320:',await p.evaluate(()=>document.querySelector('#sheet .sh-body').innerText.replace(/\n/g,' / ').slice(0,200)));
await p.evaluate(()=>window.__al('eq:EH-03'));await W(800);console.log('ficha EH-03:',await p.evaluate(()=>document.querySelector('[data-ekits]')?.textContent));
console.log('ERR',errs);await b.close()})();
