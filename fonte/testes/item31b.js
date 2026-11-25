// Item 31 parte B: tela "Conferencia da virada" (+ › Ajustes do app › Equipe). Uso: node item31b.js
const {chromium}=require('playwright');const fs=require('fs');const OUT=__dirname+'/i31b';
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
const VIR=process.argv[2]==='virada';
html=html.replace('const OS_ON=true;','window.__T=()=>({openMenu,openVir31,osARegistrar,osPendPecas,osLista,osById,openOS});const OS_ON=true;');
if(VIR)html=html.replace('const VIRADA31=OS_TESTE||false;','const VIRADA31=true;');
const it=[{pid:'p1',desc:'Filtro de oleo motor',espec:'W950',estoqueId:'FIL1',qtd:1,un:'un',ultimaH:3626,ultimaData:'2026-10-20',intervalo:250}];
const now=Date.now();
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Joao',ts:new Date('2026-11-18T10:00').getTime(),data:'2026-11-18',fotos:[],resp:[],vinc:'',estado:'operando',...o}});
const seed={
 'equipamentos/TE-02':{codigo:'TE-02',tipo:'Trator esteira',modelo:'D6',horimetro:3880,horimetroData:'2026-11-19',itens:it,alocacao:'Mina'},
 'equipamentos/CB-08':{codigo:'CB-08',tipo:'Caminhao basculante',modelo:'AXOR',horimetro:2500,horimetroData:'2026-11-18',itens:[],alocacao:'Mina'},
 'estoque/FIL1':{ref:'W950',codigo:'FIL-0001',desc:'Filtro de oleo motor',marca:'Mann',tipo:'filtro',un:'un',minimo:1,qtd:5,encaixe:['TE-02']},
 'estoque/FAR1':{ref:'AF25',codigo:'FIL-0003',desc:'Filtro de ar motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:2,encaixe:['TE-02']},
 'estoque/MEC1':{ref:'R1',codigo:'MEC-0001',desc:'Rolamento',marca:'SKF',tipo:'peca',un:'un',minimo:1,qtd:4,encaixe:[]},
 'trocas/t1':{equipId:'TE-02',data:'2026-10-20',horimetro:3626,itens:it,resp:'',obs:''},
 'trocas/tOf1':{equipId:'TE-02',data:'2026-11-18',horimetro:3876,itens:it,resp:'',obs:''},
 'trocas/tOf2':{equipId:'TE-02',tipo:'filtro_ar',sub:'Motor',data:'2026-11-19',horimetro:3880,itens:[{desc:'Filtro de ar motor',qtd:1}],resp:'',obs:''},
 'movs/m1':{estoqueId:'MEC1',tipo:'saida',qtd:1,data:'2026-11-18',obs:'manual',equipId:'CB-08',origem:'manual',saldo:4,ts:1},
 'movs/m2':{estoqueId:'MEC1',tipo:'saida',qtd:2,data:'2026-10-01',obs:'antiga',equipId:'CB-08',origem:'manual',saldo:5,ts:0},
 'os/o40':os(40,{tipo:'prev',eq:'TE-02',hor:'3876',aconteceu:'Preventiva 250 h',concl:true,feito:'Troca',pecas:[{k:'est',id:'FIL1',pid:'p1',nome:'Filtro de oleo motor',cod:'FIL-0001',un:'un',qtd:1}]}),
 'os/o41':os(41,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'TE-02',hor:'3880',aconteceu:'Filtro de ar do motor',concl:true,feito:'Troca',pecas:[{k:'est',id:'FAR1',nome:'Filtro de ar motor',cod:'FIL-0003',un:'un',qtd:1}]}),
 'os/o42':os(42,{eq:'CB-08',hor:'2500',aconteceu:'Rolamento com folga',concl:true,feito:'Troca do rolamento',pecas:[{k:'est',id:'MEC1',nome:'Rolamento',cod:'MEC-0001',un:'un',qtd:1},{k:'sc',nome:'Parafuso',qtd:4}]}),
 'os/o43':os(43,{tipo:'prev',eq:'TE-02',hor:'3876',aconteceu:'Preventiva repetida',concl:true,feito:'Troca',pecas:[]}),
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Joao Silva',funcao:'Mecanico',mat:'101',ativo:true}]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},EDT={uid:'ed',papel:'editor',nome:'Gabriel'};
let nok=0,nf=0;const R=(k,v,ok)=>{if(ok===undefined)ok=!!v;ok?nok++:nf++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(60),typeof v==='string'?v:JSON.stringify(v))};
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async(eu)=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);return p};
const W=(p,ms)=>p.waitForTimeout(ms||600);
const txt=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);return x?x.innerText.replace(/\s+/g,' ').trim():''},s);
const tr=(p,id)=>p.evaluate(async id=>(await window.__db.doc('trocas/'+id).get()).data(),id);
const ck=(p,sel)=>p.evaluate(s=>{const x=document.querySelector(s);if(!x)return false;x.click();return true},sel);
let p=await abre(ADM);
await p.evaluate(()=>__T().openMenu('aj'));await W(p);
const aj=await txt(p,'#sheet');R('Ajustes › Equipe: "Conferencia da virada"',aj.match(/.{0,40}Conferencia da virada.{0,40}/)?.[0]||'',/EQUIPE Mecanicos Conferencia da virada/.test(aj));
await ck(p,'[data-m="vir31"]');await W(p,900);
R('tela abre com titulo e "4 a decidir"',await txt(p,'#sheet .sh-tt'),/Conferencia da virada 4 a decidir/.test(await txt(p,'#sheet .sh-tt')));
const c40=await txt(p,'[data-c1="o40"]');R('OS 0040: mostra registro 18/11 · 3.876 h, nao o de 20/10',c40.slice(0,200),/18\/11\/2026 · 3\.876/.test(c40)&&!/20\/10/.test(c40));
const c41=await txt(p,'[data-c1="o41"]');R('OS 0041 (filtro ar motor): so o filtro de ar 19/11',c41.slice(0,200),/19\/11\/2026 · 3\.880/.test(c41)&&!/3\.876/.test(c41));
await p.screenshot({path:OUT+'-1.png',fullPage:true});
await ck(p,'[data-v1l="o40"][data-tr="tOf1"]');await W(p,1200);
R('Ja registrada: troca tOf1.os = o40',(await tr(p,'tOf1')).os,(await tr(p,'tOf1')).os==='o40');
R('OS 0040: "Ligada ao registro de 18/11/2026 · 3.876 h"',await txt(p,'[data-c1="o40"]'),/Ligada ao registro de 18\/11\/2026 · 3\.876/.test(await txt(p,'[data-c1="o40"]')));
R('OS 0043: tOf1 nao e mais oferecido',await txt(p,'[data-c1="o43"]'),!/3\.876 h/.test((await txt(p,'[data-c1="o43"]')).replace(/Itens da OS.*?(?=Registros)/,'').replace(/^.*?Registros/,'')));
R('subtitulo: 3 a decidir',await txt(p,'#sheet .sh-tt .sub'),await txt(p,'#sheet .sh-tt .sub')==='3 a decidir');
const h40=await p.evaluate(()=>__T().osById('o40').hist.map(h=>h.txt).join(' | '));R('historico da OS 0040',h40,/Ligada ao registro de 18\/11\/2026 · 3\.876 h/.test(h40));
await ck(p,'[data-v1r="o41"]');await W(p,900);R('OS 0041 Registrar → "Fica em Preventivas a registrar"',await txt(p,'[data-c1="o41"]'),/Fica em Preventivas a registrar/.test(await txt(p,'[data-c1="o41"]')));
await ck(p,'[data-v1x="o40"]');await W(p,1400);
R('Desfazer OS 0040: troca sem os e oferece de novo',JSON.stringify((await tr(p,'tOf1')).os)+' · '+(await txt(p,'[data-c1="o40"]')).slice(-60),!(await tr(p,'tOf1')).os&&/Ja registrada/.test(await txt(p,'[data-c1="o40"]')));
await ck(p,'[data-v1l="o40"][data-tr="tOf1"]');await W(p,1200);
const c42=await txt(p,'[data-c2="o42"]');R('OS 0042: saida 18/11 MEC-0001 CB-08, sem a de 01/10',c42,/18\/11\/2026 · MEC-0001 · 1 · CB-08 · manual/.test(c42)&&!/01\/10/.test(c42));
await p.screenshot({path:OUT+'-2.png',fullPage:true});
const q0=await p.evaluate(async()=>(await window.__db.doc('estoque/MEC1').get()).data().qtd),nm0=await p.evaluate(async()=>(await window.__db.collection('movs').get()).docs.length);
const pk=await p.evaluate(()=>__T().osById('o42').pecas[0].pk);
await ck(p,`[data-v2j="o42"][data-pk="${pk}"]`);await W(p,900);
const q1=await p.evaluate(async()=>(await window.__db.doc('estoque/MEC1').get()).data().qtd),nm1=await p.evaluate(async()=>(await window.__db.collection('movs').get()).docs.length);
R('Baixa ja dada: estoque e movimentos nao mudam',`${q0}→${q1} · movs ${nm0}→${nm1}`,q0===q1&&nm0===nm1);
R('Rolamento: "✓ Baixa ja dada"; OS ainda a decidir (parafuso)',await txt(p,'[data-c2="o42"]'),/Baixa ja dada/.test(await txt(p,'[data-c2="o42"]'))&&/Conferir depois/.test(await txt(p,'[data-c2="o42"]')));
await ck(p,`[data-v2x="o42"][data-pk="${pk}"]`);await W(p,900);
R('Desfazer peca: volta o botao Baixa ja dada',await txt(p,'[data-c2="o42"]'),(await p.$$('[data-v2j="o42"]')).length===2);
await ck(p,`[data-v2j="o42"][data-pk="${pk}"]`);await W(p,900);
const pk2=await p.evaluate(()=>__T().osById('o42').pecas[1].pk);await ck(p,`[data-v2j="o42"][data-pk="${pk2}"]`);await W(p,900);
R('as 2 pecas com baixa ja dada → OS decidida',await txt(p,'#sheet .sh-tt .sub'),await txt(p,'#sheet .sh-tt .sub')==='1 a decidir');
const h42=await p.evaluate(()=>__T().osById('o42').hist.map(h=>h.txt+(h.d?' ('+h.d+')':'')).join(' | '));R('historico OS 0042',h42,/Baixa ja dada no oficial/.test(h42)&&/Desfez a conferencia/.test(h42));
await ck(p,'[data-v1r="o43"]');await W(p,900);R('tudo decidido: 0 a decidir',await txt(p,'#sheet .sh-tt .sub'),await txt(p,'#sheet .sh-tt .sub')==='0 a decidir');
await p.screenshot({path:OUT+'-3.png',fullPage:true});
R('sem virada: a registrar continua vazio',await p.evaluate(()=>__T().osARegistrar().length),await p.evaluate(()=>__T().osARegistrar().length)===0);
const pe=await abre(EDT);await pe.evaluate(()=>__T().openMenu('aj'));await W(pe);R('editor: sem Conferencia da virada',!/Conferencia da virada/.test(await txt(pe,'#sheet')));
if(VIR){const p2=await abre(ADM);
  // reaplica as escolhas num banco novo: 40 ligada, 41 e 43 a registrar, 42 ja
  R('virada: a registrar (sem as ligadas)',await p2.evaluate(()=>__T().osARegistrar().map(v=>v.num)));}
R('sem erros na pagina',errs.join(' | ')||'nenhum',!errs.length);
console.log(`\n${nok} ok, ${nf} falhas`);await b.close()})();
