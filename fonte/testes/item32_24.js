// Itens 32 (preventiva repetida 2 de 3) e 24 (Excluir preventiva). Uso: node item32_24.js (le /home/claude/frota.html)
const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('/* item 23: nunca','window.__T={formTroca:(...a)=>formTroca(...a),formFiltroAr:(...a)=>formFiltroAr(...a),formEditTroca:(...a)=>formEditTroca(...a),formUltPrev:(...a)=>formUltPrev(...a),openDelete:(...a)=>openDelete(...a)};/* item 23: nunca');
const P1={pid:'p1',desc:'Filtro de oleo motor',espec:'FIL-0001',estoqueId:'F1',qtd:1,un:'un'};
const seed={
 'equipamentos/TE-02':{codigo:'TE-02',tipo:'Trator esteira',horimetro:3870,horimetroData:'2026-11-18',itens:[{...P1,ultimaH:3876,ultimaData:'2026-11-13',ivSel:250,proxH:4126}]},
 'equipamentos/TE-03':{codigo:'TE-03',tipo:'Trator esteira',horimetro:3900,horimetroData:'2026-11-18',itens:[]},
 'equipamentos/MN-01':{codigo:'MN-01',tipo:'Motoniveladora',horimetro:1200,horimetroData:'2026-11-18',itens:[]},
 'estoque/F1':{codigo:'FIL-0001',ref:'W950',marca:'Mann',desc:'Filtro de oleo motor',tipo:'filtro',un:'un',qtd:5,minimo:1},
 'trocas/t0b':{equipId:'TE-02',data:'2026-08-01',horimetro:3376,itens:[P1],ajuste:true,resp:'',obs:''},
 'trocas/t0':{equipId:'TE-02',data:'2026-10-01',horimetro:3626,itens:[P1],ajuste:true,resp:'',obs:''},
 'trocas/t1':{equipId:'TE-02',data:'2026-11-13',horimetro:3876,itens:[P1],ajuste:false,resp:'',obs:''},
 'trocas/t2':{tipo:'filtro_ar',sub:'Motor',servico:'Troca',equipId:'TE-02',data:'2026-11-10',horimetro:3800,itens:[],ajuste:true},
 'trocas/t6':{equipId:'TE-02',data:'2026-11-05',horimetro:3750,itens:[{pid:'p9',desc:'Filtro respiro',qtd:1,un:'un',estoqueId:'F1'}],ajuste:true,resp:'',obs:''},
 'trocas/t3':{equipId:'TE-03',data:'2026-11-15',horimetro:3700,itens:[],ajuste:true},
 'trocas/t7':{tipo:'filtro_ar',sub:'Motor',servico:'Troca',equipId:'TE-03',data:'2026-11-16',horimetro:3710,itens:[],ajuste:true},
 'trocas/t8':{equipId:'TE-03',data:'2026-11-13',horimetro:3880,itens:[],ajuste:true},
 'trocas/t4':{equipId:'MN-01',tipo:'informada',data:'2026-09-01',horimetro:1000,itens:[],ajuste:true},
 'trocas/t5':{equipId:'MN-01',data:'2026-11-01',horimetro:1100,itens:[],ajuste:true}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},EDT={uid:'ed',papel:'editor',nome:'Gabriel'};
const R=(k,v)=>console.log(k.padEnd(58),typeof v==='string'?v:JSON.stringify(v));
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async eu=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);p.ctx=ctx;return p};
let p=await abre(ADM);const W=ms=>p.waitForTimeout(ms||350);
const box=s=>p.evaluate(s=>{const x=document.querySelector(s);if(!x)return'(sem caixa)';const r=x.querySelector('.dup-r'),y=x.querySelector('.dup-y');return r?'VERMELHO '+r.innerText.replace(/\s+/g,' ').trim():y?'AMARELO '+y.innerText.trim():'(sem aviso)'},s);
const n=()=>p.evaluate(async()=>(await window.__db.collection('trocas').get()).docs.length);
const doc=path=>p.evaluate(async x=>{const d=await window.__db.doc(x).get();return d.exists?d.data():null},path);
const set=async(sel,v)=>{await p.fill(sel,String(v));await p.dispatchEvent(sel,'input');await W(150)};
// ---------- item 32: preventiva
await p.evaluate(()=>__T.formTroca('TE-02'));await W(600);
await set('#t-dt','2026-11-13');await set('#t-hm',3880);R('32 prev TE-02 13/11 3880 (mesmo dia)',await box('#t-dup'));
await p.screenshot({path:'/tmp/i32_vermelho.png'});
let c0=await n();await p.click('button[form="ft"]');await W(600);R('32 prev mesmo dia: nao grava',(await n())===c0);
await set('#t-dt','2026-11-14');R('32 prev TE-02 14/11 3880 (dia seguinte)',await box('#t-dup'));
await set('#t-dt','2026-11-15');await set('#t-hm',3700);R('32 prev TE-02 15/11 3700 (= TE-03)',await box('#t-dup'));
await p.evaluate(()=>document.querySelector('#t-dup').scrollIntoView({block:'center'}));await p.screenshot({path:'/tmp/i32_amarelo.png'});
await set('#t-hm',3690);R('32 prev TE-02 15/11 3690 (so a data de TE-03)',await box('#t-dup'));
await set('#t-dt','2026-11-17');await set('#t-hm',3700);R('32 prev TE-02 17/11 3700 (so o horimetro de TE-03)',await box('#t-dup'));
// sem internet
await p.ctx.setOffline(true);await set('#t-dt','2026-11-13');await set('#t-hm',3881);R('32 prev sem internet 13/11',await box('#t-dup'));await p.ctx.setOffline(false);
// ---------- filtro de ar
await p.evaluate(()=>__T.formFiltroAr('TE-02','Motor'));await W(600);
await set('#a-dt','2026-11-13');await set('#a-hm',3880);R('32 ar motor 13/11 (dia da preventiva)',await box('#a-dup'));
await set('#a-dt','2026-11-10');await set('#a-hm',3810);R('32 ar motor 10/11 3810 (mesmo dia do filtro)',await box('#a-dup'));
c0=await n();await p.click('button[form="fa"]');await W(600);R('32 ar motor mesmo dia: nao grava',(await n())===c0);
await set('#a-dt','2026-11-16');await set('#a-hm',3710);R('32 ar motor 16/11 3710 (= TE-03)',await box('#a-dup'));
c0=await n();await p.click('button[form="fa"]');await W(1200);R('32 ar motor amarelo: grava',(await n())===c0+1);
await p.evaluate(()=>__T.formFiltroAr('TE-02','Ar condicionado'));await W(600);await set('#a-dt','2026-11-10');await set('#a-hm',3810);R('32 ar condicionado 10/11 (filtro motor no dia)',await box('#a-dup'));
// ---------- editar
await p.evaluate(()=>__T.formEditTroca('t6'));await W(600);R('32 editar t6 sem mudar',await box('#et-dup'));
await p.click('[data-fd="data"]');await W(250);await p.fill('#ef-v','2026-11-13');await p.click('#ef-ok');await W(300);R('32 editar t6 data -> 13/11',await box('#et-dup'));
await p.click('button[form="fet"]');await W(600);R('32 editar: nao salva',(await doc('trocas/t6')).data);
// ---------- informada
await p.evaluate(()=>__T.formUltPrev('MN-01','t4'));await W(600);await set('#up-dt','2026-11-01');R('32 informada data -> 01/11 (dia de preventiva)',await box('#up-dup'));
await p.click('button[form="fup"]');await W(600);R('32 informada: nao salva',(await doc('trocas/t4')).data);
// ---------- item 24: excluir
await p.evaluate(()=>__T.formEditTroca('t0'));await W(600);R('24 editar tem Excluir (admin)',await p.evaluate(()=>!!document.querySelector('#et-del')));
await p.click('#et-del');await W(300);R('24 confirmacao',await p.evaluate(()=>document.querySelector('#et-delc').innerText.replace(/\s+/g,' ').trim()));
await p.evaluate(()=>document.querySelector('#et-delc').scrollIntoView({block:'center'}));await p.screenshot({path:'/tmp/i24_confirma.png'});
await p.click('#et-delc [data-no]');await W(300);R('24 Cancelar: registro continua',!!(await doc('trocas/t0')));
await p.click('#et-del');await W(300);await p.click('#et-delc [data-yes]');await W(900);
R('24 excluir t0 (mais antigo): apagado',!(await doc('trocas/t0')));
R('24 t0: plano nao muda (troca mais nova vale)',(await doc('equipamentos/TE-02')).itens.map(i=>[i.ultimaH,i.ultimaData,i.proxH]));
let st0=(await doc('estoque/F1')).qtd;
await p.evaluate(()=>__T.formEditTroca('t1'));await W(600);await p.click('#et-del');await W(300);await p.click('#et-delc [data-yes]');await W(1200);
R('24 excluir t1 (normal): apagado',!(await doc('trocas/t1')));
R('24 t1: plano volta para t0b (3376, 01/08)',(await doc('equipamentos/TE-02')).itens.map(i=>[i.ultimaH,i.ultimaData,i.proxH]));
R('24 t1: estoque F1 '+st0+' -> ',(await doc('estoque/F1')).qtd);
R('24 t1: movimentacao',await p.evaluate(async()=>(await window.__db.collection('movs').get()).docs.map(d=>d.data()).map(m=>[m.tipo,m.qtd,m.obs,m.estoqueId])));
st0=(await doc('estoque/F1')).qtd;
await p.evaluate(()=>__T.formEditTroca('t6'));await W(600);await p.click('#et-del');await W(300);await p.click('#et-delc [data-yes]');await W(900);
R('24 excluir t6 (ajuste): apagado',!(await doc('trocas/t6')));R('24 t6: estoque nao muda',(await doc('estoque/F1')).qtd===st0);
await p.evaluate(()=>__T.formEditTroca('t2'));await W(600);await p.click('#et-del');await W(300);R('24 filtro de ar: texto',await p.evaluate(()=>document.querySelector('#et-delc').innerText.replace(/\s+/g,' ').trim()));
await p.click('#et-delc [data-yes]');await W(900);R('24 filtro de ar apagado',!(await doc('trocas/t2')));
await p.evaluate(()=>__T.formEditTroca('t4'));await W(600);R('24 informada abre Corrigir com Excluir',await p.evaluate(()=>!!document.querySelector('#up-del')));
await p.click('#up-del');await W(300);await p.click('#up-delc [data-yes]');await W(900);R('24 informada apagada',!(await doc('trocas/t4')));
await p.evaluate(()=>__T.openDelete('tr','t5'));await W(600);R('24 tela solta leva ao Editar',await p.evaluate(()=>!!document.querySelector('#fet')&&!!document.querySelector('#et-del')));
R('24 menu + sem "dl-tr"',await p.evaluate(()=>!document.querySelector('[data-m="dl-tr"]')));
await p.ctx.close();
p=await abre(EDT);await p.evaluate(()=>__T.formEditTroca('t5'));await p.waitForTimeout(600);R('24 editor: sem Excluir',await p.evaluate(()=>!!document.querySelector('#fet')&&!document.querySelector('#et-del')));
console.log('ERROS',errs);await b.close()})();
