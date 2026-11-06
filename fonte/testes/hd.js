const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
const st=Object.entries(seed).find(([k,v])=>k.startsWith('estoque/')&&!v.kit)[0].split('/')[1];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const shots=[];
for(const k of ['fe:CB-08','fp','leit','mve:entrada']){await p.evaluate(k=>window.__al(k),k);await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{const h=document.querySelector('#sheet .sh-top');const b=h&&h.querySelector('.hd-pri');return {pri:b?b.textContent+'|'+b.title:null,foot:!!document.querySelector('#sheet .sh-foot'),tt:(document.querySelector('#sheet h2')||{}).textContent}});console.log(k,JSON.stringify(r));
 const h=await p.$('#sheet .sh-top');if(h){await h.screenshot({path:'hd-'+shots.length+'.png'});shots.push(1)}}
// salvar funciona? editar equipamento e salvar
await p.evaluate(()=>window.__al('fe:CB-08'));await p.waitForTimeout(800);await p.fill('#e-ano','2021/2022x');await p.click('.hd-pri');await p.waitForTimeout(1200);
console.log('salvo:',await p.evaluate(async()=>(await window.__db.doc('equipamentos/CB-08').get()).data().ano));
console.log('ERR',errs);await b.close()})();
