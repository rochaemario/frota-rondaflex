// Item 11 (Sem leitura no cronograma e na ficha). Uso: node item11.js (le /home/claude/frota.html)
const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync(process.argv[2]||'/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,openEq,openPend,vPainel,itemStatus,eqById});const OS_ON=true;');
const it=(pid,desc,iv,uh)=>({pid,desc,espec:'',qtd:1,un:'un',ivSel:iv,ultimaH:uh,ultimaData:'2026-09-01'});
const seed={
 'equipamentos/TE-01':{codigo:'TE-01',tipo:'Trator esteira',status:'ativo',intervaloPrev:250,horimetro:3800,horimetroData:'2026-11-25',itens:[it('a1','Filtro de oleo',250,3500)]},
 'equipamentos/CB-09':{codigo:'CB-09',tipo:'Caminhao basculante',status:'ativo',intervaloPrev:250,horimetro:'',itens:[it('b1','Filtro de oleo',250,3500),it('b2','Filtro diesel',500,3500)]},
 'equipamentos/CB-02':{codigo:'CB-02',tipo:'Caminhao basculante',status:'ativo',intervaloPrev:250,itens:[it('c1','Filtro de oleo',250,100)]},
 'equipamentos/PC-02':{codigo:'PC-02',tipo:'Pa carregadeira',status:'ativo',intervaloPrev:250,horimetro:0,horimetroData:'2026-11-25',itens:[it('d1','Filtro de oleo',250,0)]},
 'equipamentos/EH-03':{codigo:'EH-03',tipo:'Escavadeira',status:'ativo',horimetro:'',itens:[it('e1','Filtro ar',  'aval',0)]},
 'equipamentos/RE-09':{codigo:'RE-09',tipo:'Retroescavadeira',status:'inativo',horimetro:'',itens:[it('f1','Filtro de oleo',250,0)]},
 'config/mecanicos':{lista:[]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
let nok=0,nfa=0;const R=(k,v,ok)=>{if(ok===undefined)ok=!!v;ok?nok++:nfa++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v))};
const OUT='/tmp/i11';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page({uid:'adm',papel:'admin',nome:'Mario'})}));await p.goto('http://app.test/');await p.waitForTimeout(1600);
const W=ms=>p.waitForTimeout(ms||400);const shot=n=>p.screenshot({path:`${OUT}/${n}.png`});
await p.evaluate(()=>{const T=__T();T.S.focus='manut';T.render()});await W(500);
const cron=await p.evaluate(()=>{const h=[...document.querySelectorAll('.tsec-h')].find(x=>/Cronograma/.test(x.innerText));return [...h.closest('section').querySelectorAll('[data-cron]')].map(r=>({t:r.innerText.replace(/\s+/g,' ').trim(),c:r.querySelector('.pill').className}))});
R('cronograma: ordem e textos',cron.map(x=>x.t));
R('sem leitura no topo (CB-02, CB-09) e depois vencida TE-01',null,JSON.stringify(cron.map(x=>x.t.split(' ')[0]))===JSON.stringify(['CB-02','CB-09','TE-01','PC-02']));
R('pilula "Sem leitura" vermelha',null,cron[0].t==='CB-02 Sem leitura'&&cron[1].t==='CB-09 Sem leitura'&&/bad/.test(cron[0].c)&&/bad/.test(cron[1].c));
R('horimetro 0 conta como leitura (PC-02 Faltam)',cron[3]&&cron[3].t,cron[3]&&/Faltam/.test(cron[3].t));
R('TE-01 continua Vencida',cron[2]&&cron[2].t,cron[2]&&/Vencida 50 h/.test(cron[2].t));
R('EH-03 (so sob avaliacao) e RE-09 inativo fora',null,!cron.some(x=>/EH-03|RE-09/.test(x.t)));
await shot('cron');
await p.evaluate(()=>document.querySelector('[data-cron="CB-09"]').click());await W(600);
const pd=await p.evaluate(()=>({sit:document.querySelector('#sheet .pend-sit').innerText.replace(/\s+/g,' '),ist:[...document.querySelectorAll('#sheet .ist')].map(x=>x.innerText+'|'+x.className),rp:document.querySelectorAll('#sheet [data-rp]').length,fx:[...document.querySelectorAll('#sheet .facts')].map(x=>x.innerText.replace(/\s+/g,' '))}));
R('cronograma aberto: Situacao Sem leitura',pd.sit,/Sem leitura/.test(pd.sit));
R('itens "sem leitura" em vermelho',pd.ist,pd.ist.length===2&&pd.ist.every(x=>/^sem leitura\|.*bad/.test(x)));
R('sem Reprogramar e com "Proxima" (nao "Venceu em")',pd.fx,pd.rp===0&&pd.fx.every(x=>/Proxima/.test(x)&&!/Venceu/.test(x)));
await p.evaluate(()=>{const x=document.querySelector('#sheet .ia-h');x&&x.click()});await W(300);await shot('cron_aberto');
await p.evaluate(()=>document.querySelector('#scrim').click());await W(500);
await p.evaluate(()=>__T().openEq('CB-09'));await W(700);
const fi=await p.evaluate(()=>{const s=document.querySelector('#sheet .sit');return {sit:s&&s.innerText,c:s&&s.className,ist:[...document.querySelectorAll('#sheet .ist')].map(x=>x.innerText)}});
R('ficha: Situacao "Sem leitura" vermelha',fi,fi.sit==='Sem leitura'&&/bad/.test(fi.c));
R('ficha: itens do plano "sem leitura"',fi.ist,fi.ist.length===2&&fi.ist.every(x=>x==='sem leitura'));
await shot('ficha');
await p.evaluate(()=>document.querySelector('#scrim').click());await W(400);
await p.evaluate(()=>__T().openEq('TE-01'));await W(600);
const f2=await p.evaluate(()=>{const s=document.querySelector('#sheet .sit');return s&&s.innerText});
R('ficha com leitura continua igual (TE-01 Critico)',f2,f2==='Critico');
await p.evaluate(()=>document.querySelector('#scrim').click());await W(400);
await p.evaluate(()=>{const T=__T();T.S.focus='';T.render()});await W(400);
const pn=await p.evaluate(()=>document.querySelector('#app').innerText);
R('Painel nao mudou: sem CB-09/CB-02, com TE-01',null,!/CB-09|CB-02/.test(pn.split('Painel')[1]||'')||!/CB-09|CB-02/.test(pn));
R('vencimento por dentro igual (itemStatus CB-09 "Faltam")',await p.evaluate(()=>{const T=__T(),e=T.eqById('CB-09');return T.itemStatus(e,e.itens[0]).label}));
R('sem erros',errs,errs.length===0);
console.log(`\n${nok} ok, ${nfa} falha(s)`);await b.close();process.exit(nfa?1:0)})();
