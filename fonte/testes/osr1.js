const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/home/claude/frota-rondaflex/fonte/testes/fakedb.js','utf8');
const seed={'equipamentos/CB-08':{codigo:'CB-08',tipo:'Caminhao basculante',modelo:'AXOR',alocacao:'Mina'},'equipamentos/EH-01':{codigo:'EH-01',tipo:'Escavadeira',alocacao:'Mina'},
 'os/a':{num:12,o:{eq:'CB-08',por:'mec-1',porNome:'Joao',ts:Date.now()-3600e3,data:'2026-11-10',hor:'2550',aconteceu:'Suporte trincado',concl:false,feito:'',estado:'parado',pecas:[],fotos:[],resp:[],vinc:''}},'os/b':{num:13,o:{eq:'EH-01',por:'mec-2',porNome:'Pedro',ts:Date.now()-7200e3,data:'2026-11-10',hor:'',aconteceu:'Solda',concl:true,feito:'Soldado',estado:'operando',pecas:[],fotos:[],resp:[],vinc:''}},
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Joao',ativo:true},{uid:'mec-2',nome:'Pedro',ativo:true}]}};
const page=`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__frotaNS="teste/";window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"mec-1",papel:"mecanico",nome:"Joao Silva"}</script></head><body>${html}</body></html>`;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page}));
const errs=[];const abre=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://app.test/');await p.waitForTimeout(1800);return p};
const W=(p,ms)=>p.waitForTimeout(ms||500);
let p=await abre();
console.log('home mec:',await p.evaluate(()=>!!document.querySelector('[data-osnova]')));
await p.click('[data-osnova]');await W(p);await p.click('[data-eqp="CB-08"]');await W(p);
await p.fill('#of-hor','4512,3');await p.fill('#of-aco','vazamento no cilindro');await p.click('[data-cc="0"]');await W(p);await p.fill('#of-aco','vazamento no cilindro do braco');await W(p,600);
console.log('guardado:',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('osRasc')).map(k=>localStorage.getItem(k).slice(0,200))));
await p.close();
// 1) reabre: deve voltar direto na OS
p=await abre();
console.log('reabriu:',await p.evaluate(()=>({h2:(document.querySelector('#sheet h2')||{}).textContent,hor:(document.querySelector('#of-hor')||{}).value,aco:(document.querySelector('#of-aco')||{}).value,aberta:(document.querySelector('[data-cc="0"]')||{}).className})));
await p.screenshot({path:'r1.png'});
// 2) vai para a tela inicial pelo topo: faixa aparece
await p.click('header');await W(p,800);
console.log('faixa:',await p.evaluate(()=>(document.querySelector('.os-rsc')||{}).innerText));await p.screenshot({path:'r2.png'});
await p.close();
// 3) reabre: fica na tela inicial com faixa
p=await abre();
console.log('reabriu2: sheet?',await p.evaluate(()=>document.querySelector('#sheet')&&document.querySelector('#sheet').classList.contains('open')),'faixa:',await p.evaluate(()=>!!document.querySelector('.os-rsc')));
await p.click('[data-osr="r"]');await W(p);
console.log('retomou:',await p.evaluate(()=>({aco:(document.querySelector('#of-aco')||{}).value})));
// 4) salvar limpa
await p.click('button[form="osf"]');await W(p,900);
console.log('apos salvar:',await p.evaluate(()=>({k:Object.keys(localStorage).filter(k=>k.includes('osRasc')),faixa:!!document.querySelector('.os-rsc'),os:window.__db?1:0})));
// 5) descartar
await p.click('[data-osnova]');await W(p);await p.click('[data-eqp="EH-01"]');await W(p);await p.fill('#of-aco','outra coisa');await W(p,500);
await p.click('header');await W(p,800);console.log('faixa2:',await p.evaluate(()=>(document.querySelector('.os-rsc')||{}).innerText));
await p.click('[data-osr="d"]');await W(p,300);await p.click('#osr-ok');await W(p,500);
console.log('descartou:',await p.evaluate(()=>({k:Object.keys(localStorage).filter(k=>k.includes('osRasc')),faixa:!!document.querySelector('.os-rsc')})));
// 6) voltar + Sair limpa
await p.click('[data-osnova]');await W(p);await p.click('[data-eqp="EH-01"]');await W(p);await p.fill('#of-aco','mais uma');await W(p,500);
await p.click('#sheet [data-back]');await W(p,300);await p.click('#ss-ok');await W(p,600);
console.log('sair sem salvar:',await p.evaluate(()=>({k:Object.keys(localStorage).filter(k=>k.includes('osRasc')),faixa:!!document.querySelector('.os-rsc')})));

await p.click('header');await W(p,500);
const abreOS=async(id)=>{await p.click('[data-ost="'+(id==='a'?'abertas':'fechadas')+'"]').catch(()=>{});await W(p,300);await p.click('[data-os="'+id+'"]');await W(p)};
// 7) concluir
await abreOS('a');await p.click('[data-a="concluir"]');await W(p);await p.fill('#of-fei','troquei o reparo');await W(p,600);
await p.close();p=await abre();await W(p,800);
console.log('conc reabriu:',await p.evaluate(()=>({h2:(document.querySelector('#sheet h2')||{}).textContent,fei:(document.querySelector('#of-fei')||{}).value})));
await p.click('header');await W(p,600);console.log('faixa conc:',await p.evaluate(()=>(document.querySelector('.os-rsc small')||{}).textContent));
await p.click('[data-osr="r"]');await W(p);await p.click('[data-es="operando"]');await W(p,300);await p.click('button[form="osf"]');await W(p,900);
console.log('conc salva:',await p.evaluate(()=>({k:Object.keys(localStorage).filter(k=>k.includes('osRasc')),h2:(document.querySelector('#sheet.open h2,#sheet h2')||{}).textContent})));
// 8) adendo na OS fechada do Pedro
await p.click('header');await W(p,500);await abreOS('b');await p.click('[data-a="adendo"]');await W(p);await p.fill('#oa-obs','faltou anotar o eletrodo');await W(p,600);
await p.close();p=await abre();await W(p,800);
console.log('adendo reabriu:',await p.evaluate(()=>({h2:(document.querySelector('#sheet h2')||{}).textContent,o:(document.querySelector('#oa-obs')||{}).value})));
await p.click('button[form="osa"]');await W(p,900);console.log('adendo salvo:',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('osRasc'))));
// 9) editar a OS aberta
await p.click('header');await W(p,500);await abreOS('a');await p.click('[data-a="editar"]');await W(p);await p.fill('#ed-aconteceu','Suporte trincado e solto');await W(p,600);
await p.close();p=await abre();await W(p,800);
console.log('edit reabriu:',await p.evaluate(()=>({h2:(document.querySelector('#sheet h2')||{}).textContent,a:(document.querySelector('#ed-aconteceu')||{}).value})));
await p.screenshot({path:'r3.png'});
await p.click('#sheet [data-back]');await W(p,300);console.log('pergunta sair:',await p.evaluate(()=>!!document.querySelector('#ss-ok')));
await p.click('#ss-ok');await W(p,600);console.log('edit descartado:',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('osRasc'))));
console.log('ERR',errs);await b.close()})();
