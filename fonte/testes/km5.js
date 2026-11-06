const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
const MOD={'CONSTELATION 31280':'CONSTELLATION 31.280','AXOR 2831 6X4':'AXOR 2831'};
for(const [k,v] of Object.entries(seed)){if(k.startsWith('equipamentos/')){const m=String(v.modelo||'').toUpperCase();if(MOD[m])v.modelo=MOD[m];if(v.codigo==='RE-05'){v.marca='Caterpillar';v.modelo='416'}}
 if(v.kit&&v.codigo==='KIT-500')Object.assign(v,{kMarca:'Caterpillar',kModelo:'416',kIv:500,desc:'KIT CATERPILLAR 416 - 500H',encaixe:[],qtd:0});
 if(v.kit&&v.codigo==='KIT-1000')Object.assign(v,{kMarca:'Volvo',kModelo:'L60',kIv:1000,desc:'KIT VOLVO L60 - 1000H',encaixe:[],qtd:0});}
const K5=Object.values(seed).find(v=>v.kit&&v.codigo==='KIT-500');K5.comps.forEach(c=>{const x=seed['estoque/'+c.id];if(x)x.qtd=30});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||450);
await p.evaluate(()=>window.__al('kits'));await W(900);await p.screenshot({path:'km1.png'});
await p.click('[data-km="CATERPILLAR|416"]');await W(700);await p.screenshot({path:'km2.png'});
await p.click('[data-kk]');await W(700);await p.screenshot({path:'km3.png'});
const k=await p.evaluate(()=>document.querySelector('.kb3').innerText.replace(/\n/g,' '));console.log('kit:',k);
// montar 1 se possivel
const pode=await p.evaluate(()=>document.querySelector('.kb3 div:nth-child(2) b').textContent);
if(pode!=='0'){await p.click('#km-m');await W();await p.click('#km-cf [data-yes]');await W(1500);console.log('apos montar:',await p.evaluate(()=>document.querySelector('.kb3').innerText.replace(/\n/g,' ')))}
console.log('saldo comp:',await p.evaluate(async()=>{const K=(await window.__db.collection('estoque').get()).docs.map(d=>d.data()).find(v=>v.codigo==='KIT-500');return K.qtd}));
await p.click('#km-d');await W();await p.click('#km-cf [data-yes]');await W(1500);console.log('apos desmontar:',await p.evaluate(()=>document.querySelector('.kb3').innerText.replace(/\n/g,' ')));
await p.click('#km-e');await W(700);await p.screenshot({path:'km4.png'});console.log('nome:',await p.evaluate(()=>document.querySelector('#k-nm').textContent));
await p.evaluate(()=>window.__al('eq:CB-06'));await W(800);console.log('ficha kits:',await p.evaluate(()=>document.querySelector('[data-ekits]')?.textContent));
await p.evaluate(()=>window.__al('eq:RE-04'));await W(800);console.log('ficha RE-04:',await p.evaluate(()=>document.querySelector('[data-ekits]')?.textContent));
await p.evaluate(()=>window.__al('fp'));await W(800);
console.log('ERR',errs);await b.close()})();
