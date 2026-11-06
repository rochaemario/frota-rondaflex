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

// OS aberta pelo Joao, sem concluir
await p.click('[data-osnova]');await W(500);await p.click('[data-eqp="CB-05"]');await W(500);await p.fill('#of-aco','Ruido na transmissao');await p.click('[data-cc="0"]');await W(300);await p.click('.hd-pri');await W(800);
// Pedro: nao e responsavel
await p.evaluate(()=>{document.querySelector('[data-tb="adm"]').click()});await W(500);await p.click('[data-tb="mecs"]');await W(400);await p.click('[data-como="mec-2"]');await W(500);
await p.click('[data-ost="abertas"]');await W(300);await p.click('[data-os]');await W(600);console.log('Pedro botoes:',await p.evaluate(()=>[...document.querySelectorAll('.os-acts button')].map(b=>b.textContent).join(',')));
await p.click('[data-a="adendo"]');await W(400);await p.fill('#oa-obs','Verifiquei, e o rolamento');await p.click('[data-pest]');await W(300);await p.fill('#pe-q','rolamento');await W(300);const has=await p.$('#pe-l [data-st]');if(has){await has.click()}else{await p.click('.os-sht [data-x]')}await W(300);await p.click('.hd-pri');await W(900);
// Joao conclui a aberta
await p.evaluate(()=>{document.querySelector('#sheet [data-back]')&&0});await p.evaluate(()=>{const b=document.querySelector('[data-tb="adm"]');b&&b.click()});await W(300);
await p.evaluate(()=>{});await p.click('[data-tb="mecs"]').catch(()=>{});await W(400);await p.click('[data-como="mec-1"]');await W(500);await p.click('[data-ost="abertas"]');await W(300);await p.click('[data-os]');await W(600);
console.log('Joao botoes:',await p.evaluate(()=>[...document.querySelectorAll('.os-acts button')].map(b=>b.textContent).join(',')));
await p.click('[data-a="concluir"]');await W(600);await p.screenshot({path:'os-conc.png'});await p.fill('#of-fei','Troca do rolamento');await p.click('[data-es="operando"]');await W(300);await p.click('.hd-pri');await W(900);
console.log('apos concluir:',await p.evaluate(()=>{const L=window.__T().osLista();return L.map(v=>v.eq+':'+v.sit+':'+v.estado+':ad'+v.nAd+':pc'+v.pecas.length).join(' | ')}));
// admin: home e conferencia
await p.evaluate(()=>{const b=document.querySelector('[data-tb="adm"]');if(b)b.click()});await W(600);await p.evaluate(()=>{const s=document.querySelector('#sheet [data-back]');});
await p.keyboard.press('Escape');await W(300);await p.screenshot({path:'os-adm.png'});
await p.evaluate(()=>document.querySelector('[data-osh="cf"]').click());await W(600);await p.screenshot({path:'os-cfl.png'});
await p.click('#osl [data-os]');await W(600);await p.click('.os-pc.cfp');await W(500);await p.screenshot({path:'os-cf.png'});
const st0=await p.evaluate(()=>{const v=window.__T().osLista().find(v=>v.pecas.some(p=>p.k==='est'));const p0=v.pecas.find(p=>p.k==='est');return JSON.stringify({id:p0.id,saldo:window.__T().S.estoque.find(s=>s.id===p0.id).qtd})});console.log('antes',st0);
await p.click('#cf-ok');await W(1200);
const st1=await p.evaluate(sid=>window.__T().S.estoque.find(s=>s.id===sid).qtd,JSON.parse(st0).id);console.log('saldo depois',st1);
await p.screenshot({path:'os-det3.png'});
await p.click('[data-a="editar"]').catch(()=>console.log('sem editar'));await W(500);await p.fill('#ed-hor','2542');await p.click('.hd-pri');await W(900);await p.screenshot({path:'os-det4.png'});
await p.click('[data-a="informe"]');await W(1500);
console.log('ERR',errs);await b.close()})();
