// Item 31 parte A: OS no oficial (trava ate a virada), Mecanicos em Ajustes do app, Ver como, fluxo OS -> registrar.
// Uso: node item31.js [virada]   (sem argumento = como publicado, com trava; "virada" = simula VIRADA31=true)
const {chromium}=require('playwright');const fs=require('fs');
const VIR=process.argv[2]==='virada';const OUT=__dirname+'/i31'+(VIR?'v':'t');
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({openMenu,osRegistrar,openMecs,openMecFicha,osComo,osNova,openOS,osARegistrar,osPendPecas,osLista,openOSLista});const OS_ON=true;');
if(VIR)html=html.replace('const VIRADA31=OS_TESTE||false;','const VIRADA31=true;');
const it=[{pid:'p1',desc:'Filtro de oleo motor',espec:'W950',estoqueId:'FIL1',qtd:1,un:'un',ultimaH:3626,ultimaData:'2026-10-20',intervalo:250}];
const now=Date.now();
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Joao',ts:now-num*1000,data:'2026-11-18',fotos:[],resp:[],vinc:'',estado:'operando',...o}});
const seed={
 'equipamentos/TE-02':{codigo:'TE-02',tipo:'Trator esteira',modelo:'D6',horimetro:3870,horimetroData:'2026-11-18',itens:it,alocacao:'Mina'},
 'equipamentos/CB-08':{codigo:'CB-08',tipo:'Caminhao basculante',modelo:'AXOR',horimetro:2500,horimetroData:'2026-11-18',itens:[],alocacao:'Mina'},
 'estoque/FIL1':{ref:'W950',codigo:'FIL-0001',desc:'Filtro de oleo motor',marca:'Mann',tipo:'filtro',un:'un',minimo:1,qtd:5,encaixe:['TE-02']},
 'estoque/FIL2':{ref:'PH8A',codigo:'FIL-0002',desc:'Filtro de oleo motor',marca:'Fram',tipo:'filtro',un:'un',minimo:1,qtd:3,encaixe:['TE-02']},
 'estoque/FAR1':{ref:'AF25',codigo:'FIL-0003',desc:'Filtro de ar motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:2,encaixe:['TE-02']},
 'estoque/MEC1':{ref:'R1',codigo:'MEC-0001',desc:'Rolamento',marca:'SKF',tipo:'peca',un:'un',minimo:1,qtd:4,encaixe:[]},
 'config/equivalencias':{pares:[['FIL1','FIL2']]},
 'trocas/t1':{equipId:'TE-02',data:'2026-10-20',horimetro:3626,itens:it,ajuste:true,resp:'',obs:''},
 'os/o40':os(40,{tipo:'prev',eq:'TE-02',hor:'3876',aconteceu:'Preventiva 250 h',concl:true,feito:'Troca de oleos e filtros',pecas:[{k:'est',id:'FIL2',pid:'p1',nome:'Filtro de oleo motor',cod:'FIL-0002',un:'un',qtd:1}]}),
 'os/o41':os(41,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'TE-02',hor:'3880',aconteceu:'Filtro de ar do motor',concl:true,feito:'Troca',pecas:[{k:'est',id:'FAR1',nome:'Filtro de ar motor',cod:'FIL-0003',un:'un',qtd:1}]}),
 'os/o42':os(42,{eq:'CB-08',hor:'2500',aconteceu:'Rolamento com folga',concl:true,feito:'Troca do rolamento',pecas:[{k:'est',id:'MEC1',nome:'Rolamento',cod:'MEC-0001',un:'un',qtd:1}]}),
 'os/o43':os(43,{tipo:'prev',eq:'TE-02',hor:'3626',aconteceu:'Preventiva',concl:true,feito:'Troca',pecas:[{k:'est',id:'FIL1',pid:'p1',nome:'Filtro de oleo motor',cod:'FIL-0001',un:'un',qtd:1}]}),
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Joao Silva',funcao:'Mecanico',mat:'101',ativo:true},{uid:'mec-2',nome:'Pedro Lima',funcao:'Mecanico soldador',mat:'102',ativo:false}]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},EDT={uid:'ed',papel:'editor',nome:'Gabriel'},MEC={uid:'mec-1',papel:'mecanico',nome:'Joao Silva'};
const R=(k,v)=>console.log((VIR?'[virada] ':'[trava]  ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v));
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async(eu)=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);return p};
const W=(p,ms)=>p.waitForTimeout(ms||450);
const txt=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);return x?x.innerText.replace(/\s+/g,' ').trim():''},s);
const toast=p=>p.evaluate(()=>[...document.querySelectorAll('.toast,#toast')].map(x=>x.innerText.replace(/\s+/g,' ')).join(' | '));
const ntr=p=>p.evaluate(async()=>(await window.__db.collection('trocas').get()).docs.map(d=>({id:d.id,...d.data()})));
const nos=p=>p.evaluate(async()=>(await window.__db.collection('os').get()).docs.length);
// ---------- admin
let p=await abre(ADM);
const painel=await txt(p,'#sec-painel');R('admin: Painel mostra cartao azul "Registrar" (item 48)',VIR?/Registrar/.test(await txt(p,'#sec-painel .pn-k.reg')):!/Registrar/.test(painel));
await p.screenshot({path:OUT+'-1-home.png'});
R('admin: A registrar (lista interna)',await p.evaluate(()=>__T().osARegistrar().map(v=>v.num)));
R('admin: pecas a conferir OS 42',await p.evaluate(()=>__T().osPendPecas(__T().osLista().find(v=>v.num===42)).length));
await p.evaluate(()=>__T().openMenu('aj'));await W(p);
const aj=await txt(p,'#sheet');R('admin: Ajustes do app (texto)',aj.slice(-140));
await p.screenshot({path:OUT+'-2-ajustes.png'});
await p.click('[data-m="mecs"]');await W(p);R('admin: Mecanicos abre lista',await txt(p,'#sheet h2')+' · '+(await txt(p,'#sheet .sh-body')).slice(0,90));
await p.screenshot({path:OUT+'-3-mecanicos.png'});
await p.evaluate(()=>__T().openMecFicha('mec-1'));await W(p);
R('admin: ficha tem "Ver o app como"',await p.evaluate(()=>!!document.querySelector('#mv-como')));
await p.screenshot({path:OUT+'-4-ficha.png'});
await p.click('#mv-como');await W(p,800);
const bar=await txt(p,'.os-tb');R('Ver como: faixa',bar);R('Ver como: sem TESTE',!/TESTE/.test(bar));
R('Ver como: mini app (mc-h) e + escondido',await p.evaluate(()=>!!document.querySelector('.mc-h')&&document.querySelector('#fab').hidden));
await p.screenshot({path:OUT+'-5-vercomo.png'});
if(!VIR){await p.click('[data-osnova]');await W(p);R('Ver como: Nova OS antes da virada',await toast(p));}
await p.click('[data-tb="adm"]');await W(p,700);R('Voltar a admin: volta ao app do admin',await p.evaluate(()=>!document.querySelector('.mc-h')&&!!document.querySelector('#sec-painel')&&!document.querySelector('.os-tb')));
if(!VIR){
  await p.evaluate(()=>__T().osNova());await W(p);R('admin: Nova OS antes da virada',await toast(p));
  await p.evaluate(()=>__T().osRegistrar('o40'));await W(p);R('admin: Registrar pela OS antes da virada',await toast(p));
  await p.evaluate(()=>__T().openOS('o40'));await W(p);R('admin: OS 0040 abre (consulta)',(await txt(p,'#sheet')).slice(0,70));R('admin: OS 0040 sem botao Registrar',await p.evaluate(()=>!document.querySelector('[data-a="registrar"]')));
  await p.screenshot({path:OUT+'-6-os.png'});
}
if(VIR){
  // registrar preventiva vinda da OS 0040 (equivalente FIL2 do item do plano FIL1)
  /* item 48: com 2 ou mais OS na TAG, o cartao azul abre a escolha */
  await p.evaluate(()=>{const b=document.querySelector('#sec-painel [data-pnosl]');if(b)b.click()});await W(p,300);
  await p.click('#sec-painel [data-osreg="o40"]');await W(p,700);
  R('reg 0040: abre Registrar preventiva',await txt(p,'#sheet h2'));
  R('reg 0040: conciliacao',(await txt(p,'#t-conc')).slice(0,160));
  await p.screenshot({path:OUT+'-6-reg40.png',fullPage:false});
  let c0=(await ntr(p)).length;await p.click('button[form="ft"]');await W(p,1000);
  let tr=await ntr(p),nv=tr.find(t=>t.os==='o40');R('reg 0040: gravou troca ligada a OS',!!nv&&tr.length===c0+1);
  R('reg 0040: plano andou (ultimaH)',await p.evaluate(async()=>(await window.__db.doc('equipamentos/TE-02').get()).data().itens.map(i=>i.ultimaH)));
  R('reg 0040: saiu de a registrar',await p.evaluate(()=>__T().osARegistrar().map(v=>v.num)));
  // filtro de ar 0041
  await p.evaluate(()=>__T().osRegistrar('o41'));await W(p,700);R('reg 0041: abre',await txt(p,'#sheet h2'));
  c0=(await ntr(p)).length;await p.click('button[form="fa"]');await W(p,1000);tr=await ntr(p);R('reg 0041: gravou filtro de ar ligado',!!tr.find(t=>t.os==='o41'&&t.tipo==='filtro_ar')&&tr.length===c0+1);
  // repetido: 0043 no horimetro 3626 (ja existe t1)
  await p.evaluate(()=>__T().osRegistrar('o43'));await W(p,700);R('reg 0043: horimetro',await p.evaluate(()=>document.querySelector('#t-hm').value));R('reg 0043: aviso repetido',await txt(p,'#t-dup'));
  c0=(await ntr(p)).length;await p.click('button[form="ft"]');await W(p,800);R('reg 0043: bloqueado (nao grava)',(await ntr(p)).length===c0);R('reg 0043: aviso ao tocar',await toast(p)+' / '+await txt(p,'#t-dup'));
  await p.screenshot({path:OUT+'-7-dup43.png'});
  R('conferir: OS 0042 com peca a conferir',await p.evaluate(()=>__T().osPendPecas(__T().osLista().find(v=>v.num===42)).length));
}
await p.close();
// ---------- editor
p=await abre(EDT);await p.evaluate(()=>__T().openMenu('aj'));await W(p);R('editor: Ajustes do app sem Mecanicos',!/Mecanicos/.test(await txt(p,'#sheet')));
R('editor: ve Painel normal',await p.evaluate(()=>!!document.querySelector('#sec-painel')));await p.close();
// ---------- mecanico (login real)
p=await abre(MEC);
R('mecanico: so mini app',await p.evaluate(()=>!!document.querySelector('.mc-h')&&!document.querySelector('#sec-painel')&&document.querySelector('#fab').hidden&&!document.querySelector('.os-tb')));
await p.screenshot({path:OUT+'-8-mec.png'});
if(VIR){
  // nova OS preventiva concluida pelo mini app
  const n0=await nos(p);
  await p.click('[data-osnova]');await W(p);await p.click('[data-eqp="TE-02"]');await W(p);
  await p.click('[data-tp="prev"]');await W(p);await p.click('[data-cc="1"]');await W(p);
  await p.fill('#of-hor','4130');await p.click('[data-es="operando"]');await W(p,300);
  R('mec: preventiva puxa itens que vencem',(await txt(p,'#sheet')).match(/Filtro de oleo motor/)?'sim':'nao');
  await p.screenshot({path:OUT+'-9-mecprev.png'});
  await p.click('button[form="osf"]');await W(p,1200);R('mec: OS gravada',(await nos(p))===n0+1);
  const t0=await toast(p);R('mec: aviso',t0);
  // OS sem horimetro bloqueia
  await p.evaluate(()=>{const s=document.querySelector('#sheet');if(s&&s.classList.contains('open'))history.back()});await W(p);
}
await p.close();
// ---------- admin depois da OS do mecanico (so na virada)
R('erros de pagina',errs.length?errs.slice(0,5):'nenhum');
await b.close()})();
