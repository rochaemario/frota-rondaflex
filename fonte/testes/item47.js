// Item 47 (pecas sem cadastro da OS: ligar ou cadastrar). Uso: node item47.js (le /home/claude/frota.html)
const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,osRegistrar,osById,openOS,osDraw,vMec});const OS_ON=true;');
const P1={pid:'p1',desc:'Filtro de oleo',espec:'',estoqueId:'FIL1',qtd:1,un:'un',ivSel:250,ultimaH:3500,ultimaData:'2026-09-01'};
const P2={pid:'p2',desc:'Oleo Mobil 15W-40',espec:'',estoqueId:'OL1',qtd:20,un:'L',ivSel:250,ultimaH:3500,ultimaData:'2026-09-01'};
const PAR={pid:'pa',desc:'Filtro de ar motor',espec:'',estoqueId:'FAR1',qtd:1,un:'un',ivSel:'aval',ultimaH:3500,ultimaData:'2026-09-01'};
const TS=new Date('2026-11-25T10:00').getTime();
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Douglas',ts:TS,data:'2026-11-25',fotos:[],resp:[],vinc:'',estado:'operando',concl:true,...o}});
const seed={
 'equipamentos/TE-01':{codigo:'TE-01',tipo:'Trator esteira',status:'ativo',intervaloPrev:250,horimetro:3800,horimetroData:'2026-11-25',itens:[P1,P2,PAR]},
 'equipamentos/EH-01':{codigo:'EH-01',tipo:'Escavadeira',status:'ativo',intervaloPrev:250,horimetro:100,itens:[]},
 'estoque/FIL1':{ref:'LF3349',alm:'FIL-0001',desc:'Filtro de oleo motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:5},
 'estoque/OL1':{ref:'MOBIL15W40',alm:'LUB-0001',desc:'Oleo Mobil 15W-40',marca:'Mobil',tipo:'oleo',un:'L',minimo:1,qtd:200},
 'estoque/FAR1':{ref:'AF25',alm:'FIL-0003',desc:'Filtro de ar motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:3},
 'estoque/MAN1':{ref:'',alm:'MAN-0007',desc:'Mangueira hidraulica 1/2',marca:'Parker',tipo:'Mangueiras',un:'un',minimo:0,qtd:0},
 'os/o95':os(95,{tipo:'prev',eq:'TE-01',hor:'3800',aconteceu:'Preventiva 250 h',feito:'Troca de oleos e filtros',pecas:[{k:'est',id:'OL1',pid:'p2',nome:'Oleo Mobil 15W-40',cod:'LUB-0001',un:'L',qtd:20},{k:'sc',nome:'Filtro de oleo motor',qtd:1,foto:''},{k:'sc',nome:'Filtro separador agua',qtd:2,foto:''}]}),
 'os/o96':os(96,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'TE-01',hor:'3801',data:'2026-11-26',aconteceu:'Filtro de ar do motor',feito:'Troca',pecas:[{k:'sc',nome:'Filtro de ar motor',qtd:1,foto:''}]}),
 'os/o98':os(98,{tipo:'cor',eq:'EH-01',hor:'100',aconteceu:'Vazamento',feito:'Troca de mangueira',pecas:[{k:'est',id:'OL1',nome:'Oleo Mobil 15W-40',cod:'LUB-0001',un:'L',qtd:2},{k:'sc',nome:'Mangueira hidraulica 1/2',qtd:1,foto:''}]}),
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Douglas',funcao:'Mecanico',mat:'101',ativo:true}]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},MEC={uid:'mec-1',papel:'mecanico',nome:'Douglas'};
let nok=0,nfa=0;const R=(k,v,ok)=>{if(ok===undefined)ok=!!v;ok?nok++:nfa++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(62),typeof v==='string'?v:JSON.stringify(v))};
const OUT='/tmp/i47';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async eu=>{const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);return p};
const W=(p,ms)=>p.waitForTimeout(ms||400);
const txt=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);return x?x.innerText.replace(/\s+/g,' ').trim():''},s);
const ck=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);if(!x)return false;x.click();return true},s);
const doc=(p,path)=>p.evaluate(async x=>{const d=await window.__db.doc(x).get();return d.exists?JSON.parse(JSON.stringify(d.data())):null},path);
const col=(p,c)=>p.evaluate(async c=>(await window.__db.collection(c).get()).docs.map(d=>({id:d.id,...d.data()})),c);
const toast=p=>p.evaluate(()=>{const t=document.querySelector('.toast');return t?t.innerText:''});
const shot=(p,n)=>p.screenshot({path:`${OUT}/${n}.png`});
const st=()=>p.evaluate(()=>document.querySelector('#sheet .sh-body').scrollTop);
let p=await abre(ADM);
// ============ A) Registrar preventiva vindo da OS 0095
await p.evaluate(()=>__T().osRegistrar('o95'));await W(p,900);
let sc=await txt(p,'#t-sc');
R('A secao "Sem cadastro · 2" com nome, quantidade e texto',sc,/Sem cadastro · 2/i.test(sc)&&/Filtro de oleo motor 1 un/.test(sc)&&/Filtro separador agua 2 un/.test(sc));
R('A nada nas observacoes',await p.evaluate(()=>document.querySelector('#t-obs').value),!/Sem cadastro|separador/i.test(await p.evaluate(()=>document.querySelector('#t-obs').value)));
R('A fundo amarelo',await p.evaluate(()=>getComputedStyle(document.querySelector('.scg-r')).backgroundColor),await p.evaluate(()=>getComputedStyle(document.querySelector('.scg-r')).backgroundColor==='rgb(255, 246, 227)'));
await p.evaluate(()=>document.querySelector('#t-sc').scrollIntoView({block:'center'}));await shot(p,'A1_secao');
// trava do Registrar
await p.evaluate(()=>document.querySelector('#sheet .sh-body').scrollTop=0);
await p.evaluate(()=>document.querySelector('#ft').requestSubmit());await W(p,700);
R('A Registrar travado: aviso + toast',[await txt(p,'.scg-al'),await toast(p)],/Ligue ou cadastre as 2 pecas sem cadastro/.test(await txt(p,'.scg-al'))&&/Ligue ou cadastre as 2 pecas sem cadastro/.test(await toast(p)));
R('A a tela foi ate elas',await p.evaluate(()=>{const r=document.querySelector('#scg-w').getBoundingClientRect();return Math.round(r.top)}),await p.evaluate(()=>{const r=document.querySelector('#scg-w').getBoundingClientRect();return r.top>=0&&r.top<700}));
R('A nada gravado',(await col(p,'trocas')).length,(await col(p,'trocas')).length===0);
await shot(p,'A2_trava');
// tocar: busca ja preenchida
await ck(p,'.scg-r');await W(p,300);
R('A tocar abre ali mesmo (sem janela por cima)',await p.evaluate(()=>!document.querySelector('.os-scr')&&!!document.querySelector('#t-sc .scg-x')));
R('A busca preenchida com o nome da OS',await p.evaluate(()=>document.querySelector('.scg-q').value),await p.evaluate(()=>document.querySelector('.scg-q').value)==='Filtro de oleo motor');
const res=await txt(p,'.scg-res');R('A resultado: codigo, descricao, referencia e saldo',res,/5 un Filtro de oleo motor FIL-0001 · LF3349/.test(res));
R('A botao "+ Cadastrar item novo" e sem "deixar sem cadastro"',await txt(p,'.scg-x'),/\+ Cadastrar item novo/.test(await txt(p,'.scg-x'))&&!/deixar/i.test(await txt(p,'.scg-x')));
await shot(p,'A3_aberto');
const y0=await st();
await ck(p,'[data-scgl="FIL1"]');await W(p,900);
const y1=await st();
sc=await txt(p,'#t-sc');R('A ligado: secao fica com 1',sc,/Sem cadastro · 1/i.test(sc)&&!/Filtro de oleo motor/.test(sc));
let c=await p.evaluate(()=>[...document.querySelectorAll('#t-conc .cc-r')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
R('A a linha sobe para os itens: ✓ ligado · na OS: <nome>',c,c.some(x=>/✓ Filtro de oleo motor LF3349 · mesmo item ✓ ligado · na OS: Filtro de oleo motor/.test(x)));
R('A a tela nao pulou',[y0,y1],Math.abs(y0-y1)<60);
let v=await p.evaluate(()=>{const v=__T().osById('o95');return {p:v.pecas.map(x=>[x.k,x.id||'',x.nome,x.orig||'']),h:v.hist.map(h=>[h.txt,h.d,h.nome])}});
R('A a peca virou o item na propria OS (k:est)',v.p,JSON.stringify(v.p[1])===JSON.stringify(['est','FIL1','Filtro de oleo motor','Filtro de oleo motor']));
R('A historico: nome original e quem ligou',v.h.slice(-1),/Ligou peca sem cadastro/.test(v.h.slice(-1)[0][0])&&/Filtro de oleo motor → Filtro de oleo motor · FIL-0001/.test(v.h.slice(-1)[0][1])&&v.h.slice(-1)[0][2]==='Mario');
await p.evaluate(()=>document.querySelector('#t-conc').scrollIntoView({block:'start'}));await shot(p,'A4_ligado');
// cadastrar item novo
await ck(p,'.scg-r');await W(p,300);
R('A 2a peca: busca com o nome, nada encontrado',await txt(p,'.scg-res'),/Nenhum item encontrado/.test(await txt(p,'.scg-res')));
await ck(p,'[data-scgcad]');await W(p,700);
R('A abre o cadastro (Novo item do estoque)',await txt(p,'#sheet .sh-tt'),/Novo item do estoque/.test(await txt(p,'#sheet .sh-tt')));
await p.evaluate(()=>{const i=document.querySelector('#s-idq');i.value='SEP-123';i.dispatchEvent(new Event('input'))});await W(p,500);
await ck(p,'#s-go');await W(p,300);
R('A descricao preenchida com o nome da OS',await p.evaluate(()=>document.querySelector('#s-desc').value),await p.evaluate(()=>document.querySelector('#s-desc').value)==='Filtro separador agua');
await p.evaluate(()=>document.querySelector('#fs').requestSubmit());await W(p,500);
R('A item 26: marca obrigatoria (nao salva sem marca)',await txt(p,'#sheet .sh-tt'),await p.evaluate(()=>!document.querySelector('#s-marca').checkValidity())&&/Novo item/.test(await txt(p,'#sheet .sh-tt')));
await p.evaluate(()=>{document.querySelector('#s-marca').value='Racor'});await p.evaluate(()=>document.querySelector('#fs').requestSubmit());await W(p,2200);
R('A volta ao registro',await txt(p,'#sheet .sh-tt'),/Registrar preventiva/.test(await txt(p,'#sheet .sh-tt')));
const novo=(await col(p,'estoque')).find(x=>x.ref==='SEP-123');
R('A item novo com saldo = quantidade (entrada automatica)',novo&&novo.qtd,!!novo&&novo.qtd===2);
let mv=(await col(p,'movs')).filter(m=>novo&&m.estoqueId===novo.id);
R('A entrada "Compra direta · OS 0095"',mv,mv.length===1&&mv[0].tipo==='entrada'&&mv[0].qtd===2&&mv[0].obs==='Compra direta · OS 0095');
R('A secao sumiu',await p.evaluate(()=>document.querySelector('#t-sc').innerText.trim()),await p.evaluate(()=>!document.querySelector('#t-sc').innerText.trim()));
c=await p.evaluate(()=>[...document.querySelectorAll('#t-conc .cc-r')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
R('A item novo ligado: novo no plano + ✓ ligado · na OS',c,c.some(x=>/Filtro separador agua SEP-123 · novo no plano ✓ ligado · na OS: Filtro separador agua/.test(x)));
R('A o que ja tinha feito continua (Filtro de oleo ligado)',c,c.some(x=>/✓ Filtro de oleo motor LF3349 · mesmo item ✓ ligado/.test(x)));
v=await p.evaluate(()=>__T().osById('o95').hist.slice(-1)[0]);
R('A historico do cadastro',v,/Cadastrou e ligou peca sem cadastro/.test(v.txt)&&/Filtro separador agua → Filtro separador agua/.test(v.d)&&/entrada de 2 \(compra direta\)/.test(v.d));
await p.evaluate(()=>document.querySelector('#t-conc').scrollIntoView({block:'start'}));await shot(p,'A5_cadastrado');
// intervalo do novo no plano e registrar
await p.evaluate(()=>{const s=document.querySelector('[data-ccnv]');s.value='500';s.dispatchEvent(new Event('change'))});
await p.evaluate(()=>document.querySelector('#ft').requestSubmit());await W(p,1500);
const tr=(await col(p,'trocas'))[0];
R('A registrou',tr&&tr.os,!!tr&&tr.os==='o95');
R('A baixa normal: FIL-0001 5 → 4',(await doc(p,'estoque/FIL1')).qtd,(await doc(p,'estoque/FIL1')).qtd===4);
R('A item novo: entrada 2 e saida 2 (saldo zero)',(await doc(p,'estoque/'+novo.id)).qtd,(await doc(p,'estoque/'+novo.id)).qtd===0);
mv=(await col(p,'movs')).filter(m=>m.estoqueId===novo.id).map(m=>m.tipo+' '+m.qtd);
R('A movimentacoes do item novo',mv,JSON.stringify(mv)==='["entrada 2","saida 2"]');
// informe mostra o codigo do item ligado
const inf=await p.evaluate(async()=>{const T=[];const f=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(t,...a){T.push(String(t));return f.call(this,t,...a)};try{await __T().osDraw(__T().osById('o95'),'share')}catch(e){T.push('ERRO '+e.message)}CanvasRenderingContext2D.prototype.fillText=f;return T.join(' | ')});
R('A informe com o codigo do item ligado',inf.split(' | ').filter(x=>/FIL-|SEP|LUB|MOBIL|cadastro/i.test(x)),/FIL-0001 · LF3349/.test(inf)&&/SEP-123/.test(inf)&&!/sem cadastro/i.test(inf));
// ============ B) Filtro de ar vindo da OS 0096
await p.evaluate(()=>{document.querySelector('#scrim').click()});await W(p,500);
await p.evaluate(()=>__T().osRegistrar('o96'));await W(p,900);
R('B secao no filtro de ar',await txt(p,'#a-sc'),/Sem cadastro · 1 Filtro de ar motor 1 un/i.test(await txt(p,'#a-sc')));
R('B nada nas observacoes',await p.evaluate(()=>document.querySelector('#a-obs').value),!/Sem cadastro/.test(await p.evaluate(()=>document.querySelector('#a-obs').value)));
await p.evaluate(()=>document.querySelector('#fa').requestSubmit());await W(p,600);
R('B Registrar travado',await toast(p),/Ligue ou cadastre a peca sem cadastro/.test(await toast(p))&&(await col(p,'trocas')).length===1);
await ck(p,'#a-sc .scg-r');await W(p,300);await ck(p,'[data-scgl="FAR1"]');await W(p,900);
R('B ligado: filtro na lista com ✓ ligado',await txt(p,'#a-its'),/Filtro de ar motor AF25 · saldo 3 ✓ ligado · na OS: Filtro de ar motor/.test(await txt(p,'#a-its')));
await shot(p,'B1_ar');
await p.evaluate(()=>document.querySelector('#fa').requestSubmit());await W(p,1500);
R('B registrou e deu baixa: 3 → 2',(await doc(p,'estoque/FAR1')).qtd,(await doc(p,'estoque/FAR1')).qtd===2&&(await col(p,'trocas')).some(t=>t.os==='o96'));
// ============ C) Conferir pecas de OS corretiva (0098)
await p.evaluate(()=>{document.querySelector('#scrim').click()});await W(p,500);
await p.evaluate(()=>__T().openOS('o98',true));await W(p,700);
let ct=await txt(p,'#os-sc');R('C conferencia: secao "Sem cadastro · 1"',ct,/Sem cadastro · 1 Mangueira hidraulica 1\/2 1 un/i.test(ct)&&!/Ligue ou cadastre/.test(ct));
await shot(p,'C1_conf');
// conferir o oleo (ultima peca do estoque) -> vai ate as sem cadastro
await ck(p,'[data-pk="o98:0"]');await W(p,400);await ck(p,'#cf-ok');await W(p,1500);
ct=await txt(p,'#os-sc');R('C so sobrou sem cadastro: aviso e a tela vai ate elas',[ct,await toast(p)],/Ligue ou cadastre a peca sem cadastro/.test(ct)&&/Ligue ou cadastre a peca sem cadastro/.test(await toast(p)));
R('C OS continua em pecas a conferir',await p.evaluate(()=>__T().osById('o98').pecas.filter(x=>!__T().osById('o98').conf[x.pk]).length),await p.evaluate(()=>__T().osById('o98').pecas.filter(x=>!__T().osById('o98').conf[x.pk]).length)===1);
await ck(p,'#os-sc .scg-r');await W(p,300);
R('C busca preenchida e acha a mangueira (saldo 0)',await txt(p,'#os-sc .scg-res'),/0 un Mangueira hidraulica 1\/2 MAN-0007/.test(await txt(p,'#os-sc .scg-res')));
await ck(p,'[data-scgl="MAN1"]');await W(p,1200);
const row=await p.evaluate(()=>{const b=document.querySelector('[data-pk="o98:1"]');return b?b.innerText.replace(/\s+/g,' ').trim():''});
R('C ligada a item com saldo zero: aviso amarelo, nao trava',row,/Mangueira hidraulica 1\/2 MAN-0007 ✓ ligado · na OS: Mangueira hidraulica 1\/2 Saldo zero · insuficiente conferir/.test(row));
R('C secao sumiu',await p.evaluate(()=>!document.querySelector('#os-sc')));
await shot(p,'C2_ligada');
await ck(p,'[data-pk="o98:1"]');await W(p,400);await ck(p,'#cf-ok');await W(p,1500);
R('C conferida com baixa normal (0 → -1)',(await doc(p,'estoque/MAN1')).qtd,(await doc(p,'estoque/MAN1')).qtd===-1);
R('C OS saiu de pecas a conferir',await p.evaluate(()=>{const v=__T().osById('o98');return v.pecas.filter(x=>!v.conf[x.pk]).length}),await p.evaluate(()=>{const v=__T().osById('o98');return v.pecas.filter(x=>!v.conf[x.pk]).length})===0);
const hc=await p.evaluate(()=>__T().osById('o98').hist.map(h=>h.txt+' · '+(h.d||'')));
R('C historico da OS',hc,hc.some(x=>/Ligou peca sem cadastro · Mangueira hidraulica 1\/2 → Mangueira hidraulica 1\/2 · MAN-0007/.test(x)));
// ============ D) mini app (mecanico): sem a secao, sem erro
const q=await abre(MEC);
await q.evaluate(()=>__T().openOS('o98'));await W(q,600);
R('D mini app sem a secao nova',await q.evaluate(()=>!document.querySelector('#os-sc')&&!document.querySelector('.scg-r')));
console.log(`\n${nok} ok, ${nfa} falhas, erros de pagina: ${errs.length?errs.join(' / '):'nenhum'}`);await b.close()})();
