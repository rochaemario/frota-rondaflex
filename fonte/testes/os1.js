const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__T=()=>({osLista,osById,S});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
seed['config/mecanicos']={lista:[{uid:'mec-1',nome:'Joao',ativo:true},{uid:'mec-2',nome:'Pedro',ativo:true}]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__frotaNS="teste/";window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
const W=ms=>p.waitForTimeout(ms||500);await W(1600);
await p.screenshot({path:'os-home.png'});
// ver como Joao

await p.click('[data-tb="mecs"]');await W();await p.click('[data-como="mec-1"]');await W(700);await p.screenshot({path:'os-mec.png'});
await p.click('[data-osnova]');await W(600);await p.fill('#osn-q','cb-0');await W(300);await p.screenshot({path:'os-eq.png'});
await p.click('[data-eqp="CB-08"]');await W(600);
await p.fill('#of-hor','2540.5');await p.fill('#of-aco','Vazamento na mangueira do braco');await p.fill('#of-fei','Troca da mangueira');
await p.click('[data-es="parado"]');await W(300);
await p.click('[data-pest]');await W(400);await p.fill('#pe-q','filtro');await W(300);await p.click('#pe-l [data-st]');await W(300);
await p.screenshot({path:'os-form.png',fullPage:false});
await p.click('.hd-pri');await W(900);console.log('apos salvar toast:',await p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).pop()));
await p.screenshot({path:'os-mec2.png'});
const id=await p.evaluate(()=>window.__T().osLista()[0]?.id);console.log('os',id,await p.evaluate(()=>JSON.stringify(window.__T().osLista()[0]).slice(0,300)));
// abre e faz adendo
await p.click('[data-os]');await W(700);await p.screenshot({path:'os-det.png'});
await p.click('[data-a="adendo"]');await W(600);await p.fill('#oa-obs','Mangueira veio de outro modelo');await p.click('[data-cadd]');await W(300);await p.fill('[data-cv="0"]','2541');await p.click('.hd-pri');await W(1000);
await p.screenshot({path:'os-det2.png'});
// volta admin, confere peca
await p.evaluate(()=>{for(const b of document.querySelectorAll('[data-back]'))b.click()});await W(300);
await p.evaluate(()=>window.__al&&0);
await p.goBack().catch(()=>{});
console.log('ERR',errs);await b.close()})();
