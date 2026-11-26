// Itens 45 (corrigir item no registro de preventiva) e 46 (Planos a completar). Uso: node item45_46.js (le /home/claude/frota.html)
const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,planoAbre,osRegistrar,formEditTroca,osById,openOS,osLista});const OS_ON=true;');
const P1={pid:'p1',desc:'Filtro de oleo',espec:'',estoqueId:'FIL1',qtd:1,un:'un',ivSel:250,ultimaH:3500,ultimaData:'2026-09-01'};
const P2={pid:'p2',desc:'Oleo Mobil 15W-40',espec:'',estoqueId:'OL1',qtd:20,un:'L',ivSel:'',ultimaH:3500,ultimaData:'2026-09-01'};
const PAR={pid:'pa',desc:'Filtro de ar motor',espec:'',estoqueId:'FAR1',qtd:1,un:'un',ivSel:'aval',ultimaH:3500,ultimaData:'2026-09-01'};
const TS=new Date('2026-11-25T10:00').getTime();
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Douglas',ts:TS,data:'2026-11-25',fotos:[],resp:[],vinc:'',estado:'operando',concl:true,...o}});
const seed={
 'equipamentos/TE-01':{codigo:'TE-01',tipo:'Trator esteira',status:'ativo',intervaloPrev:250,horimetro:3800,horimetroData:'2026-11-25',itens:[P1,P2,PAR]},
 'equipamentos/CB-01':{codigo:'CB-01',tipo:'Caminhao basculante',status:'ativo',intervaloPrev:250,horimetro:100,itens:[]},
 'equipamentos/MN-02':{codigo:'MN-02',tipo:'Motoniveladora',status:'ativo',horimetro:100,itens:[{pid:'m1',desc:'Filtro x',qtd:1,ivSel:''},{pid:'m2',desc:'Filtro y',qtd:1,ivSel:''}]},
 'equipamentos/EH-01':{codigo:'EH-01',tipo:'Escavadeira',status:'ativo',intervaloPrev:250,horimetro:100,itens:[{pid:'e1',desc:'Filtro z',qtd:1,ivSel:500},{pid:'e2',desc:'Filtro ar',qtd:1,ivSel:'aval'}]},
 'equipamentos/RE-01':{codigo:'RE-01',tipo:'Retroescavadeira',status:'inativo',horimetro:100,itens:[]},
 'equipamentos/PC-01':{codigo:'PC-01',tipo:'Pa carregadeira',status:'ativo',intervaloPrev:0,horimetro:100,itens:[{pid:'c1',desc:'Filtro w',qtd:1,ivSel:''},{pid:'c2',desc:'Filtro v',qtd:1,ivSel:''},{pid:'c3',desc:'Filtro u',qtd:1,ivSel:500}]},
 'equipamentos/TE-02':{codigo:'TE-02',tipo:'Trator esteira',status:'ativo',intervaloPrev:250,horimetro:3900,horimetroData:'2026-11-20',
   itens:[{...P1,ultimaH:3500},{pid:'pn',desc:'Filtro hidraulico',espec:'H12111X',estoqueId:'FIL9',qtd:1,un:'un',ivSel:500,ultimaH:3880,ultimaData:'2026-11-20'},{...P2,ivSel:250,ultimaH:3880,ultimaData:'2026-11-20'}]},
 'estoque/FIL1':{ref:'LF3349',alm:'FIL-0001',desc:'Filtro de oleo',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:5},
 'estoque/FIL9':{ref:'H12111X',alm:'FIL-0009',desc:'Filtro hidraulico',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:4},
 'estoque/OL1':{ref:'MOBIL15W40',alm:'LUB-0001',desc:'Oleo Mobil 15W-40',marca:'Mobil',tipo:'oleo',un:'L',minimo:1,qtd:200},
 'estoque/OL9':{ref:'3E-9902',alm:'LUB-0009',desc:'Oleo hidraulico 10W',marca:'CAT',tipo:'oleo',un:'L',minimo:1,qtd:100},
 'estoque/FAR1':{ref:'AF25',alm:'FIL-0003',desc:'Filtro de ar motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:3},
 'estoque/FAC':{ref:'AF99',alm:'FIL-0004',desc:'Filtro de ar cabine',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:3},
 'trocas/tA':{equipId:'TE-02',data:'2026-09-01',horimetro:3500,itens:[{...P1}],resp:'',obs:''},
 'trocas/tX':{equipId:'TE-02',os:'o97',data:'2026-11-20',horimetro:3880,itens:[{pid:'pn',desc:'Filtro hidraulico',espec:'FIL-0009',qtd:1,un:'un',estoqueId:'FIL9'},{pid:'p2',desc:'Oleo Mobil 15W-40',espec:'LUB-0001',qtd:20,un:'L',estoqueId:'OL1'}],resp:'Douglas',obs:'OS 0097'},
 'os/o95':os(95,{tipo:'prev',eq:'TE-01',hor:'3800',aconteceu:'Preventiva 250 h',feito:'Troca de oleos e filtros',pecas:[{k:'est',id:'FIL9',nome:'Filtro hidraulico',cod:'FIL-0009',un:'un',qtd:1},{k:'est',id:'OL9',nome:'Oleo hidraulico 10W',cod:'LUB-0009',un:'L',qtd:20}]}),
 'os/o96':os(96,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'TE-01',hor:'3800',aconteceu:'Filtro de ar do motor',feito:'Troca',pecas:[{k:'est',id:'FAC',nome:'Filtro de ar cabine',cod:'FIL-0004',un:'un',qtd:1}]}),
 'os/o97':os(97,{tipo:'prev',eq:'TE-02',hor:'3880',data:'2026-11-20',aconteceu:'Preventiva',feito:'Troca',pecas:[{k:'est',id:'FIL9',nome:'Filtro hidraulico',cod:'FIL-0009',un:'un',qtd:1},{k:'est',id:'OL1',pid:'p2',nome:'Oleo Mobil 15W-40',cod:'LUB-0001',un:'L',qtd:20}]}),
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Douglas',funcao:'Mecanico',mat:'101',ativo:true}]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},EDT={uid:'ed',papel:'editor',nome:'Gabriel'},CON={uid:'co',papel:'consulta',nome:'Visita'};
let nok=0,nfa=0;const R=(k,v,ok)=>{if(ok===undefined)ok=!!v;ok?nok++:nfa++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(62),typeof v==='string'?v:JSON.stringify(v))};
const OUT='/tmp/i45';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async eu=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);return p};
const W=(p,ms)=>p.waitForTimeout(ms||400);
const txt=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);return x?x.innerText.replace(/\s+/g,' ').trim():''},s);
const ck=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);if(!x)return false;x.click();return true},s);
const doc=(p,path)=>p.evaluate(async x=>{const d=await window.__db.doc(x).get();return d.exists?JSON.parse(JSON.stringify(d.data())):null},path);
const col=(p,c)=>p.evaluate(async c=>(await window.__db.collection(c).get()).docs.map(d=>({id:d.id,...d.data()})),c);
const shot=(p,n)=>p.screenshot({path:`${OUT}/${n}.png`});
let p=await abre(ADM);
// ---------------- item 46
await p.evaluate(()=>{const T=__T();T.S.focus='manut';T.render()});await W(p,500);
const pac=await p.evaluate(()=>{const h=[...document.querySelectorAll('.tsec-h')].find(x=>/Planos a completar/.test(x.innerText));if(!h)return null;const sec=h.closest('section');return {t:h.innerText.replace(/\s+/g,' '),rows:[...sec.querySelectorAll('[data-sif]')].map(r=>r.innerText.replace(/\s+/g,' ').trim())}});
R('46 secao "Planos a completar · N"',pac&&pac.t,!!pac&&/Planos a completar 4/.test(pac.t));
R('46 linhas em ordem pela TAG, motivos',pac&&pac.rows,!!pac&&JSON.stringify(pac.rows)===JSON.stringify(['CB-01 Sem plano','MN-02 2 itens sem intervalo','PC-01 2 itens sem intervalo','TE-01 1 item usa a ficha']));
R('46 sem "Sem intervalo na ficha"',await p.evaluate(()=>!/Sem intervalo na ficha/.test(document.querySelector('#app').innerText)));
await p.evaluate(()=>{const h=[...document.querySelectorAll('.tsec-h')].find(x=>/Planos a completar/.test(x.innerText));h.scrollIntoView({block:'start'})});await shot(p,'46_lista');
await ck(p,'[data-sif="TE-01"]');await W(p,700);
R('46 toque abre o plano (Editar equipamento, parte Preventivas)',await p.evaluate(()=>{const x=document.querySelector('#sheet #fe-prev'),b=document.querySelector('#sheet .sh-body');if(!x||!b)return false;const d=x.getBoundingClientRect().top-b.getBoundingClientRect().top;return /Editar equipamento/.test(document.querySelector('#sheet .sh-tt').innerText)&&d>=-2&&d<40}));
await shot(p,'46_plano');
// corrige: TE-01 item p2 recebe intervalo proprio -> sai da lista
await p.evaluate(async()=>{const d=(await window.__db.doc('equipamentos/TE-01').get()).data();await window.__db.doc('equipamentos/TE-01').update({itens:d.itens.map(i=>i.pid==='p2'?{...i,ivSel:250}:i)})});
await p.evaluate(()=>{const T=__T();document.querySelector('#scrim').click()});await W(p,600);
await p.evaluate(()=>{const T=__T();T.S.focus='manut';T.render()});await W(p,400);
R('46 corrigiu: TE-01 sai da lista',await p.evaluate(()=>[...document.querySelectorAll('[data-sif]')].map(r=>r.innerText.replace(/\s+/g,' ').trim())),await p.evaluate(()=>![...document.querySelectorAll('[data-sif]')].some(r=>/TE-01/.test(r.innerText))));
await p.evaluate(async()=>{const d=(await window.__db.doc('equipamentos/TE-01').get()).data();await window.__db.doc('equipamentos/TE-01').update({itens:d.itens.map(i=>i.pid==='p2'?{...i,ivSel:''}:i)})});await W(p,300);
// ---------------- item 45: registro vindo da OS (preventiva)
await p.evaluate(()=>{const T=__T();T.S.focus='';T.render();T.osRegistrar('o95')});await W(p,900);
const conc=()=>p.evaluate(()=>[...document.querySelectorAll('#t-conc .cc-r')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
let c=await conc();R('45 antes: referencia em toda linha',c,c.some(x=>/Filtro de oleo LF3349 · Pendente/.test(x))&&c.some(x=>/Filtro hidraulico H12111X · novo no plano/.test(x))&&c.some(x=>/Oleo hidraulico 10W 3E-9902 · novo no plano/.test(x)));
await p.evaluate(()=>document.querySelector('#t-conc').scrollIntoView({block:'start'}));await shot(p,'45_antes');
await ck(p,'[data-ccm="s:FIL9"]');await W(p,250);
R('45 tocar no item do mecanico: Trocar item e Tirar',await txt(p,'#t-conc .cc-x'),/Trocar item Tirar/.test(await txt(p,'#t-conc .cc-x')));
await ck(p,'[data-cctk="s:FIL9"]');await W(p,250);
const tk=await txt(p,'#t-conc .cc-tk');R('45 Trocar item: pendentes com referencia + busca',tk,/Pendentes do plano Filtro de oleo LF3349 Oleo Mobil 15W-40 MOBIL15W40 No estoque/i.test(tk));
R('45 quantidade vem a do mecanico',await p.evaluate(()=>document.querySelector('#cc-tq').value),await p.evaluate(()=>document.querySelector('#cc-tq').value)==='1');
await p.evaluate(()=>document.querySelector('#t-conc .cc-tk').scrollIntoView({block:'center'}));await shot(p,'45_trocar');
const pos=()=>p.evaluate(()=>{const b=document.querySelector('#sheet .sh-body');return {top:Math.round(document.querySelector('#t-conc').getBoundingClientRect().top),st:b.scrollTop,max:b.scrollHeight-b.clientHeight}});
const y0=await pos();
await ck(p,'[data-cctpi="p1"]');await W(p,500);
const y1=await pos();
c=await conc();R('45 trocou: Filtro de oleo ✓ corrigido; H12111X saiu',c,c.some(x=>/✓ Filtro de oleo LF3349 · mesmo item · corrigido · era Filtro hidraulico · FIL-0009/.test(x))&&!c.some(x=>/H12111X/.test(x)));
R('45 a tela nao pulou (quadro do plano no mesmo lugar)',[y0,y1],Math.abs(y0.top-y1.top)<2||(y1.st===y1.max&&y1.st<y0.st));
// oleo: busca no estoque e quantidade editada
await ck(p,'[data-ccm="s:OL9"]');await W(p,200);await ck(p,'[data-cctk="s:OL9"]');await W(p,200);
R('45 quantidade do oleo = 20',await p.evaluate(()=>document.querySelector('#cc-tq').value),await p.evaluate(()=>document.querySelector('#cc-tq').value)==='20');
await p.fill('#cc-tq','18');await p.fill('#cc-tsq','mobil 15w40');await p.dispatchEvent('#cc-tsq','input');await W(p,250);
await ck(p,'#cc-tsr [data-ccts="OL1"]');await W(p,500);
c=await conc();R('45 oleo pela busca: Oleo Mobil ✓ corrigido',c,c.some(x=>/✓ Oleo Mobil 15W-40 MOBIL15W40 · mesmo item · corrigido · era Oleo hidraulico 10W/.test(x))&&!c.some(x=>/3E-9902/.test(x)));
R('45 quantidade 18 no lancamento',await p.evaluate(()=>document.querySelector('[data-q="p2"]').value),await p.evaluate(()=>document.querySelector('[data-q="p2"]').value)==='18');
// Voltar ao lancado e de novo
await ck(p,'[data-ccm="p:p2"]');await W(p,200);R('45 item corrigido mostra Voltar ao lancado',await txt(p,'#t-conc .cc-x'),/Voltar ao lancado/.test(await txt(p,'#t-conc .cc-x')));
await ck(p,'[data-ccvo="p:p2"]');await W(p,400);c=await conc();R('45 Voltar ao lancado: 3E-9902 volta',c,c.some(x=>/3E-9902 · novo no plano/.test(x))&&c.some(x=>/Oleo Mobil 15W-40 MOBIL15W40 · Pendente/.test(x)));
await ck(p,'[data-ccm="s:OL9"]');await W(p,200);await ck(p,'[data-ccti="s:OL9"]');await W(p,400);c=await conc();
R('45 Tirar: linha "tirado do registro" com Voltar',c,c.some(x=>/Oleo hidraulico 10W 3E-9902 · tirado do registro Voltar ao lancado/.test(x)));
await ck(p,'[data-ccvo^="t:"]');await W(p,400);c=await conc();R('45 Voltar do tirado',c,c.some(x=>/3E-9902 · novo no plano/.test(x)));
await ck(p,'[data-ccm="s:OL9"]');await W(p,200);await ck(p,'[data-cctk="s:OL9"]');await W(p,200);await ck(p,'[data-cctpi="p2"]');await W(p,500);
c=await conc();R('45 oleo trocado pelo pendente (qtd 20)',[c,await p.evaluate(()=>document.querySelector('[data-q="p2"]').value)],c.some(x=>/✓ Oleo Mobil/.test(x))&&await p.evaluate(()=>document.querySelector('[data-q="p2"]').value)==='20');
await p.evaluate(()=>document.querySelector('#t-conc').scrollIntoView({block:'start'}));await shot(p,'45_depois');
const st0=await col(p,'estoque');const q0=Object.fromEntries(st0.map(x=>[x.id,x.qtd]));
await ck(p,'.hd-pri');await W(p,1500);
const trs=(await col(p,'trocas')).filter(t=>t.os==='o95');R('45 registrado: 1 registro ligado a OS 0095',trs.length,trs.length===1);
R('45 itens do registro = certos',trs[0]&&trs[0].itens.map(i=>[i.pid,i.estoqueId,i.qtd]),!!trs[0]&&JSON.stringify(trs[0].itens.map(i=>[i.pid,i.estoqueId,i.qtd]).sort())===JSON.stringify([['p1','FIL1',1],['p2','OL1',20]]));
const st1=Object.fromEntries((await col(p,'estoque')).map(x=>[x.id,x.qtd]));
R('45 baixa no item certo (FIL1 5->4, OL1 200->180), errados iguais',[q0.FIL1,st1.FIL1,q0.OL1,st1.OL1,st1.FIL9,st1.OL9],st1.FIL1===4&&st1.OL1===180&&st1.FIL9===4&&st1.OL9===100);
const eq1=await doc(p,'equipamentos/TE-01');R('45 plano andou (p1 e p2 em 3800); nada novo no plano',eq1.itens.map(i=>[i.pid,i.ultimaH]),eq1.itens.length===3&&eq1.itens.filter(i=>i.pid!=='pa').every(i=>i.ultimaH===3800));
const v95=await p.evaluate(()=>{const v=__T().osById('o95');return {pc:v.pecas.map(x=>[x.id,x.nome,x.qtd]),h:v.hist.map(h=>[h.txt,h.d,h.nome])}});
R('45 OS mostra os itens certos',v95.pc,JSON.stringify(v95.pc)===JSON.stringify([['FIL1','Filtro de oleo',1],['OL1','Oleo Mobil 15W-40',20]]));
R('45 historico da OS',v95.h.filter(h=>/corrigido/.test(h[0])),v95.h.filter(h=>/Item corrigido no registro/.test(h[0])&&/Mario/.test(h[2])).length===2&&v95.h.some(h=>/Filtro hidraulico · FIL-0009 → Filtro de oleo · LF3349/.test(h[1]||'')));
await p.evaluate(()=>__T().openOS('o95'));await W(p,700);const ot=await txt(p,'#sheet');
R('45 tela da OS: certos e sem marca de editado',ot.slice(0,160),/Filtro de oleo/.test(ot)&&/Oleo Mobil 15W-40/.test(ot)&&!/Filtro hidraulico/.test(ot)&&!/editad/i.test(ot.split('Acoes')[0]||ot));
await shot(p,'45_os');
// ---------------- item 45: filtro de ar vindo da OS
await p.evaluate(()=>__T().osRegistrar('o96'));await W(p,900);
const ca=()=>p.evaluate(()=>[...document.querySelectorAll('#a-plan .cc-r')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
let a=await ca();R('45 ar antes: referencia nas linhas',a,a.some(x=>/Filtro de ar cabine AF99 · fora do plano/.test(x)));
await ck(p,'[data-ccm="s:FAC"]');await W(p,200);await ck(p,'#a-plan [data-cctk="s:FAC"]');await W(p,250);
R('45 ar Trocar item: pendente Filtro de ar motor',await txt(p,'#a-plan .cc-tk'),/Filtro de ar motor AF25/.test(await txt(p,'#a-plan .cc-tk')));
await ck(p,'#a-plan [data-cctpi="pa"]');await W(p,500);a=await ca();
R('45 ar trocou: ✓ Filtro de ar motor corrigido',a,a.some(x=>/✓ Filtro de ar motor AF25 · mesmo item · corrigido/.test(x))&&!a.some(x=>/AF99/.test(x)));
R('45 ar lista de filtros = FAR1',await p.evaluate(()=>[...document.querySelectorAll('#a-its .kr b')].map(x=>x.innerText)),await p.evaluate(()=>[...document.querySelectorAll('#a-its .kr b')].map(x=>x.innerText).join()==='Filtro de ar motor'));
await shot(p,'45_ar');
await ck(p,'.hd-pri');await W(p,1500);
const ta=(await col(p,'trocas')).find(t=>t.os==='o96');R('45 ar registrado com FAR1',ta&&ta.itens.map(i=>i.estoqueId),!!ta&&ta.itens.map(i=>i.estoqueId).join()==='FAR1');
const st2=Object.fromEntries((await col(p,'estoque')).map(x=>[x.id,x.qtd]));R('45 ar baixa FAR1 3->2, FAC igual',[st2.FAR1,st2.FAC],st2.FAR1===2&&st2.FAC===3);
R('45 ar OS mostra o certo',await p.evaluate(()=>__T().osById('o96').pecas.map(x=>x.id)),await p.evaluate(()=>__T().osById('o96').pecas.map(x=>x.id).join()==='FAR1'));
// ---------------- item 45: Editar preventiva (depois de registrado)
await p.evaluate(()=>__T().formEditTroca('tX'));await W(p,700);
R('45 editar: linhas com referencia',await txt(p,'#et-l'),/Filtro hidraulico H12111X/.test(await txt(p,'#et-l'))&&/Oleo Mobil 15W-40 MOBIL15W40/.test(await txt(p,'#et-l')));
await ck(p,'#et-l .et-h[data-k="0"]');await W(p,200);R('45 editar: botao Trocar item (admin)',await txt(p,'#et-l .et-a'),/Trocar item/.test(await txt(p,'#et-l .et-a')));
await ck(p,'#et-l [data-md="tk"]');await W(p,250);R('45 editar: pendentes do plano com referencia',await txt(p,'#et-l .et-b'),/Pendentes do plano Filtro de oleo LF3349/i.test(await txt(p,'#et-l .et-b')));
await ck(p,'#et-l [data-tkp="p1"]');await W(p,300);const cf=await txt(p,'#et-tkc');
R('45 editar: confirmacao explica estoque, plano e OS',cf,/Filtro hidraulico volta ao estoque \(\+1 un\)/.test(cf)&&/Filtro de oleo sai do estoque/.test(cf)&&/Filtro de oleo anda para 3\.880 h/.test(cf)&&/Filtro hidraulico fica sem troca anterior/.test(cf)&&/OS 0097 passa a mostrar Filtro de oleo/.test(cf)&&/Manter no plano Tirar do plano/.test(cf));
await p.evaluate(()=>document.querySelector('#et-tkc').scrollIntoView({block:'center'}));await shot(p,'45_editar_conf');
const s3=Object.fromEntries((await col(p,'estoque')).map(x=>[x.id,x.qtd]));
await ck(p,'#et-tkc [data-tkgo="1"]');await W(p,1600);
const tX=await doc(p,'trocas/tX');R('45 editar: registro com o certo',tX.itens.map(i=>[i.pid,i.estoqueId,i.qtd]),JSON.stringify(tX.itens.map(i=>[i.pid,i.estoqueId,i.qtd]))===JSON.stringify([['p1','FIL1',1],['p2','OL1',20]]));
const s4=Object.fromEntries((await col(p,'estoque')).map(x=>[x.id,x.qtd]));R('45 editar: FIL9 +1, FIL1 -1',[s3.FIL9,s4.FIL9,s3.FIL1,s4.FIL1],s4.FIL9===s3.FIL9+1&&s4.FIL1===s3.FIL1-1);
const mv=(await col(p,'movs')).filter(m=>m.obs==='Item corrigido na preventiva').map(m=>[m.estoqueId,m.tipo,m.qtd]).sort();R('45 editar: movimentacoes "Item corrigido na preventiva"',mv,JSON.stringify(mv)===JSON.stringify([['FIL1','saida',1],['FIL9','entrada',1]]));
const e2=await doc(p,'equipamentos/TE-02');R('45 editar: p1 anda para 3880; pn sai do plano',e2.itens.map(i=>[i.pid,i.ultimaH]),JSON.stringify(e2.itens.map(i=>[i.pid,i.ultimaH]))===JSON.stringify([['p1',3880],['p2',3880]]));
const v97=await p.evaluate(()=>{const v=__T().osById('o97');return {pc:v.pecas.map(x=>x.id),h:v.hist.filter(h=>/corrigido/.test(h.txt)).map(h=>h.d)}});R('45 editar: OS 0097 mostra o certo + historico',v97,v97.pc.join()==='FIL1,OL1'&&v97.h.length===1);
R('45 editar: tela reabriu com o item novo',await txt(p,'#et-l'),/Filtro de oleo LF3349/.test(await txt(p,'#et-l')));
// desfazer = trocar de novo
await ck(p,'#et-l .et-h[data-k="0"]');await W(p,200);await ck(p,'#et-l [data-md="tk"]');await W(p,200);await p.fill('#et-tsq','h12111x');await p.dispatchEvent('#et-tsq','input');await W(p,250);
await ck(p,'#et-tsr [data-tks="FIL9"]');await W(p,300);R('45 desfazer (trocar de novo): confirmacao',await txt(p,'#et-tkc'),/Trocar Filtro de oleo por Filtro hidraulico/.test(await txt(p,'#et-tkc')));
await ck(p,'#et-tkc [data-tkgo="0"]');await W(p,1600);
const tX2=await doc(p,'trocas/tX');const s5=Object.fromEntries((await col(p,'estoque')).map(x=>[x.id,x.qtd]));
R('45 desfeito: registro e estoque voltaram',[tX2.itens.map(i=>i.estoqueId),s5.FIL9,s5.FIL1],tX2.itens[0].estoqueId==='FIL9'&&s5.FIL9===s3.FIL9&&s5.FIL1===s3.FIL1);
R('45 desfeito: p1 volta para a troca anterior (3500)',(await doc(p,'equipamentos/TE-02')).itens.map(i=>[i.pid,i.ultimaH]),(await doc(p,'equipamentos/TE-02')).itens.find(i=>i.pid==='p1').ultimaH===3500);
// editor nao ve Trocar item; consulta abre a ficha no item 46
const pe=await abre(EDT);await pe.evaluate(()=>__T().formEditTroca('tA'));await W(pe,700);await ck(pe,'#et-l .et-h[data-k="0"]');await W(pe,200);
R('45 editor: sem Trocar item',await txt(pe,'#et-l .et-a'),!/Trocar item/.test(await txt(pe,'#et-l .et-a')));
const pc=await abre(CON);await pc.evaluate(()=>__T().planoAbre('CB-01'));await W(pc,600);R('46 consulta: toque abre a ficha',await txt(pc,'#sheet .sh-tt'),/CB-01/.test(await txt(pc,'#sheet .sh-tt'))&&!(await pc.evaluate(()=>!!document.querySelector('#fe-prev'))));
R('sem erros na pagina',errs,!errs.length);
console.log(`\n${nok} ok, ${nfa} falhas`);await b.close()})();
