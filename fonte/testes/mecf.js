const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/home/claude/frota-rondaflex/fonte/testes/fakedb.js','utf8');
const seed={'config/mecanicos':{lista:[{uid:'mec-1',nome:'Douglas Guilardi',funcao:'Mecanico',mat:'115',tel:'69999666099',ativo:true},{uid:'mec-2',nome:'Pedro',ativo:true,enc:true}]},
'equipamentos/ESC-01':{codigo:'ESC-01',tipo:'Escavadeira',marca:'CAT',modelo:'320',posse:'proprio',status:'ativo',usoDiario:8,itens:[],alocacao:'DM1'},
'estoque/st1':{codigo:'111',ref:'222-9021',desc:'Filtro oleo',tipo:'filtro',un:'un',qtd:3,minimo:2}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__frotaNS="teste/";window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
const W=ms=>p.waitForTimeout(ms||500);await W(1600);
const hd=async()=>p.evaluate(()=>document.querySelector('#sheet .sh-head')?.innerText.replace(/\n/g,' | '));
const bd=async()=>p.evaluate(()=>document.querySelector('#sheet .sh-body')?.innerText.replace(/\n/g,' / ').slice(0,300));
const inputs=async()=>p.evaluate(()=>document.querySelectorAll('#sheet input').length);
await p.evaluate(()=>window.__al('mecs'));await W();await p.click('[data-mf="mec-1"]');await W();
console.log('FICHA',await hd(),'#',await bd(),'inputs',await inputs());await p.screenshot({path:'1.png'});
await p.click('.hd-ed');await W();console.log('FORM',await hd(),'inputs',await inputs());await p.screenshot({path:'2.png'});
await p.fill('#mf-m','116');await p.click('.sh-head .hd-pri');await W(800);console.log('APOS SALVAR',await hd(),'#',await bd());
await p.click('[data-back]');await W();console.log('VOLTOU',await hd());
await p.click('.mc-nv');await W();console.log('NOVO',await hd(),'inputs',await inputs());await p.click('[data-back]');await W();
await p.click('[data-mf="mec-2"]');await W();await p.click('.hd-ed');await W();
const del=await p.$('#mf-del');console.log('tem excluir',!!del);if(del){await del.click();await W();await p.evaluate(()=>document.querySelector('#dl-ok').click());await W(800);console.log('APOS EXCLUIR',await hd(),'#',await bd())}
await p.evaluate(()=>window.__al('eq:ESC-01'));await W(900);console.log('EQ',await hd());await p.click('.hd-ed');await W();console.log('EQ FORM',await hd());await p.screenshot({path:'3.png'});
await p.evaluate(()=>window.__al('mv:st1'));await W(900);console.log('ST',await hd());await p.click('.hd-ed');await W();console.log('ST FORM',await hd());await p.click('[data-back]');await W();console.log('ST volta',await hd());
console.log('ERR',errs);await b.close()})();
