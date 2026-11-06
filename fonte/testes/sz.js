const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);await p.evaluate(()=>window.__al('fp'));await p.waitForTimeout(800);
for(const [n,c,f,ic] of [[46,46,11,22],[40,40,10.5,19],[36,36,10,17],[32,32,0,16]]){
 await p.evaluate(([c,f,ic])=>{let st=document.getElementById('xs');if(!st){st=document.createElement('style');st.id='xs';document.head.appendChild(st)}
  st.textContent=`.sh-head .hd-pri::before{width:${c}px!important;height:${c}px!important;background-size:${ic}px!important}.sh-head .hd-pri{font-size:${f||11}px!important;${f?'':'font-size:0!important;gap:0!important'}}`},[c,f,ic]);
 await p.waitForTimeout(150);await (await p.$('#sheet .sh-top')).screenshot({path:`sz-${n}.png`})}
await b.close()})();
