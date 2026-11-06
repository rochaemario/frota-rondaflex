const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__T=()=>({osLista,osById,S});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
seed['config/mecanicos']={lista:[{uid:'mec-1',nome:'Joao',ativo:true},{uid:'mec-2',nome:'Pedro',ativo:true},{uid:'mec-3',nome:'Carlos',ativo:true}]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__frotaNS="teste/";window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
const W=ms=>p.waitForTimeout(ms||450);await W(1600);
const como=async u=>{await p.evaluate(()=>{const b=document.querySelector('[data-tb="adm"]');b&&b.click()});await W(400);await p.click('[data-tb="mecs"]');await W(400);await p.click(`[data-como="${u}"]`);await W(500)};
const btns=()=>p.evaluate(()=>[...document.querySelectorAll('.os-acts button')].map(b=>b.textContent).join(','));
await como('mec-1');
await p.click('[data-osnova]');await W(400);await p.click('[data-eqp="CB-08"]');await W(500);
await p.fill('#of-aco','Suporte do escapamento trincado');await p.click('[data-cc="0"]');await W(250);
await p.click('[data-radd]');await W(300);await p.check('.os-sht input[value="mec-2"]');await p.click('#rr-ok');await W(300);
await p.screenshot({path:'v4-form.png'});await p.click('.hd-pri');await W(800);
await p.click('[data-os]');await W(500);console.log('Joao aberta:',await btns());
await p.click('[data-a="editar"]');await W(500);await p.fill('#ed-hor','2550');await p.click('[data-pest]');await W(300);await p.fill('#pe-q','filtro');await W(200);await p.click('#pe-l [data-st]');await W(200);await p.click('.hd-pri');await W(800);
console.log('apos editar:',await p.evaluate(()=>{const v=window.__T().osLista()[0];return v.hor+' pecas '+v.pecas.length+' marc '+Object.keys(v.marc)}));
// Carlos soldador cria OS vinculada
await como('mec-3');console.log('Carlos aberta (nao resp):',await (async()=>{await p.click('[data-os]');await W(400);return btns()})());
await p.evaluate(()=>{for(let i=0;i<3;i++)document.querySelector('#sheet [data-back]')?.click()});await W(300);
await p.click('[data-osnova]');await W(400);await p.click('[data-eqp="CB-08"]');await W(400);await p.fill('#of-aco','Solda no suporte do escapamento');await p.fill('#of-fei','Soldado');await p.click('[data-es="operando"]');
await p.click('[data-vadd]');await W(300);await p.click('[data-vk]');await W(300);await p.screenshot({path:'v4-vinc.png'});await p.click('.hd-pri');await W(800);
// Pedro (resp) conclui
await como('mec-2');await p.click('[data-ost="abertas"]');await W(200);await p.click('#osl [data-os]');await W(500);console.log('Pedro resp aberta:',await btns());
await p.click('[data-a="concluir"]');await W(400);await p.fill('#of-fei','Trocado suporte');await p.click('[data-es="operando"]');await p.click('.hd-pri');await W(800);console.log('Pedro resp fechada:',await btns());
await p.screenshot({path:'v4-det.png',fullPage:false});
// Carlos na fechada: adendo
await como('mec-3');await p.click('[data-ost="fechadas"]');await W(200);
await p.evaluate(()=>{const c=[...document.querySelectorAll('#osl [data-os]')].find(b=>/escapamento trincado/.test(b.textContent));c.click()});await W(500);console.log('Carlos fechada:',await btns());
await p.click('[data-a="adendo"]');await W(400);await p.fill('#oa-obs','Reforcei a solda');await p.click('.hd-pri');await W(800);
const r=await p.evaluate(()=>{const v=window.__T().osLista().find(v=>/trincado/.test(v.aconteceu));return {sit:v.sit,resp:v.resp,ad:v.ad.length,filhas:v.filhas.map(f=>f.aconteceu)}});console.log(JSON.stringify(r));
await p.screenshot({path:'v4-det2.png'});
console.log('ERR',errs);await b.close()})();
