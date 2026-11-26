// Item 48 (Painel: OS a registrar na linha da TAG). Uso: node item48.js [arquivo] (le /home/claude/frota.html)
const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync(process.argv[2]||'/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,osById});const OS_ON=true;');
const it=(pid,desc,est,iv,uh)=>({pid,desc,espec:'',estoqueId:est,qtd:1,un:'un',ivSel:iv,ultimaH:uh,ultimaData:'2026-09-01'});
const TS=new Date('2026-11-25T10:00').getTime();
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Douglas',ts:TS+num,data:'2026-11-25',fotos:[],resp:[],vinc:'',estado:'operando',concl:true,...o}});
const pc=(id,nome,cod)=>({k:'est',id,nome,cod,un:'un',qtd:1});
const seed={
 'equipamentos/TE-01':{codigo:'TE-01',tipo:'Trator esteira',status:'ativo',intervaloPrev:250,horimetro:3800,horimetroData:'2026-11-25',itens:[it('a1','Filtro de oleo','FIL1',250,3500)]},
 'equipamentos/CB-03':{codigo:'CB-03',tipo:'Caminhao basculante',status:'ativo',intervaloPrev:250,horimetro:1000,horimetroData:'2026-11-25',itens:[it('b1','Filtro de oleo','FIL1',250,990)]},
 'equipamentos/EH-07':{codigo:'EH-07',tipo:'Escavadeira',status:'ativo',intervaloPrev:250,horimetro:5000,horimetroData:'2026-11-25',itens:[it('c1','Filtro de oleo','FIL1',250,4000),it('c2','Filtro diesel','FIL2',250,4000),it('c3','Filtro de ar motor','FAR1','aval',4000)]},
 'equipamentos/PC-05':{codigo:'PC-05',tipo:'Pa carregadeira',status:'ativo',intervaloPrev:250,horimetro:2000,horimetroData:'2026-11-25',itens:[it('d1','Filtro de oleo','FIL1',250,1900),it('d3','Filtro de ar motor','FAR1','aval',1900)]},
 'equipamentos/MN-04':{codigo:'MN-04',tipo:'Motoniveladora',status:'ativo',intervaloPrev:250,horimetro:900,horimetroData:'2026-11-25',itens:[it('e1','Filtro de oleo','FIL1',250,600)]},
 'equipamentos/RE-02':{codigo:'RE-02',tipo:'Retroescavadeira',status:'ativo',intervaloPrev:250,horimetro:740,horimetroData:'2026-11-25',itens:[it('f1','Filtro de oleo','FIL1',250,500)]},
 'estoque/FIL1':{ref:'LF3349',alm:'FIL-0001',desc:'Filtro de oleo',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:50},
 'estoque/FIL2':{ref:'FF5052',alm:'FIL-0002',desc:'Filtro diesel',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:50},
 'estoque/FAR1':{ref:'AF25',alm:'FIL-0003',desc:'Filtro de ar motor',marca:'Fleet',tipo:'filtro',un:'un',minimo:1,qtd:50},
 'os/o91':os(91,{tipo:'prev',eq:'CB-03',hor:'1000',aconteceu:'Preventiva',feito:'Troca',pecas:[pc('FIL1','Filtro de oleo','FIL-0001')]}),
 'os/o92':os(92,{tipo:'prev',eq:'TE-01',hor:'3800',aconteceu:'Preventiva',feito:'Troca',pecas:[pc('FIL1','Filtro de oleo','FIL-0001')]}),
 'os/o93':os(93,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'EH-07',hor:'5000',aconteceu:'Filtro de ar',feito:'Troca',pecas:[pc('FAR1','Filtro de ar motor','FIL-0003')]}),
 'os/o94':os(94,{tipo:'prev',eq:'PC-05',hor:'2000',data:'2026-11-24',aconteceu:'Preventiva',feito:'Troca',pecas:[pc('FIL1','Filtro de oleo','FIL-0001')]}),
 'os/o95':os(95,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'PC-05',hor:'2000',aconteceu:'Filtro de ar',feito:'Troca',pecas:[pc('FAR1','Filtro de ar motor','FIL-0003')]}),
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Douglas',funcao:'Mecanico',mat:'101',ativo:true}]}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
let nok=0,nfa=0;const R=(k,v,ok)=>{if(ok===undefined)ok=!!v;ok?nok++:nfa++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v))};
const OUT='/tmp/i48';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async(eu,w)=>{const ctx=await b.newContext({viewport:{width:w||390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);
  await p.evaluate(()=>{const T=__T();T.S.focus='';T.S.pnTab='eq';T.render()});await p.waitForTimeout(400);return p};
const linhas=p=>p.evaluate(()=>[...document.querySelectorAll('.pn-list .pn-r')].map(r=>{const h=r.querySelector('.pn-h'),c=h.querySelector('.pn-c');return {tag:c.innerText,tagInteira:c.scrollWidth<=c.clientWidth+1,k:[...h.querySelectorAll('.pn-k')].map(k=>k.className.replace('pn-k ','')+':'+k.innerText),bar:h.querySelector('.pn-s').className.replace('pn-s ',''),alt:Math.round(h.getBoundingClientRect().height),cabe:h.scrollWidth<=h.clientWidth+1}}));
const ADM={uid:'adm',papel:'admin',nome:'Mario'};
let p=await abre(ADM);const W=ms=>p.waitForTimeout(ms||400);
let L=await linhas(p);
R('linhas',L.map(x=>x.tag+' '+x.k.join(' ')+' |'+x.bar));
R('azuis no topo (com vencidas primeiro): EH-07, TE-01, CB-03, PC-05; depois MN-04, RE-02',null,JSON.stringify(L.map(x=>x.tag))===JSON.stringify(['EH-07','TE-01','CB-03','PC-05','MN-04','RE-02']));
const G=t=>L.find(x=>x.tag===t);
R('so registrar (CB-03): 1 cartao azul "Registrar preventiva"',G('CB-03').k,JSON.stringify(G('CB-03').k)==='["reg:Registrar preventiva"]');
R('registrar + vencidas (TE-01): azul + vermelho',G('TE-01').k,G('TE-01').k.length===2&&/^reg:Registrar/.test(G('TE-01').k[0])&&G('TE-01').k[1]==='bad:1 vencida');
R('filtro de ar + vencidas (EH-07)',G('EH-07').k,/^reg:Registrar( filtro de ar)?$/.test(G('EH-07').k[0])&&G('EH-07').k[1]==='bad:2 vencidas');
R('duas OS (PC-05): "Registrar 2 OS" ou "Registrar 2"',G('PC-05').k,/^reg:Registrar 2( OS)?$/.test(G('PC-05').k[0]));
R('barra lateral azul nas linhas com cartao azul',L.map(x=>x.bar),L.slice(0,4).every(x=>x.bar==='reg')&&L[4].bar==='bad'&&L[5].bar==='warn');
R('uma linha so (mesma altura), TAG inteira e nada sai da linha',L.map(x=>x.alt+(x.cabe&&x.tagInteira?'':'!')),L.every(x=>x.cabe&&x.tagInteira&&x.alt===L[0].alt));
R('secao separada "Preventivas a registrar" saiu',null,await p.evaluate(()=>!/Preventivas a registrar/.test(document.querySelector('#app').innerText)));
const ct=await p.evaluate(()=>({eq:document.querySelector('[data-pntab="eq"] b').innerText,hd:document.querySelector('.pnb-n').innerText}));
R('contagem: 6 TAGs (cada uma uma vez)',ct,ct.eq==='6'&&ct.hd==='6 pendencias');
await p.screenshot({path:OUT+'/painel390.png'});
// vermelho abre pendencias como hoje
const yT=()=>p.evaluate(()=>[...document.querySelectorAll('.pn-r')].find(r=>/TE-01/.test(r.innerText)).querySelector('.pn-h').getBoundingClientRect().top);const y0=await yT();
await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/TE-01/.test(r.innerText));r.querySelector('.pn-k.bad').click()});await W(300);
const ab=await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/TE-01/.test(r.innerText));return {b:!r.querySelector(':scope>.ia-b').hidden,t:r.querySelector(':scope>.ia-b').innerText.replace(/\s+/g,' '),sh:!!document.querySelector('#sheet .sh-body')&&document.querySelector('#sheet').offsetParent!==null}});
R('vermelho abre as pendencias (Abrir pendencias) sem abrir registro',ab.t.slice(0,80),ab.b&&/Abrir pendencias/.test(ab.t));
const y1=await yT();
R('nada pula ao abrir',[y0,y1],y0===y1);
await p.screenshot({path:OUT+'/aberto.png'});
await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/TE-01/.test(r.innerText));r.querySelector('.pn-k.bad').click()});await W(200);
// duas OS: escolha
await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/PC-05/.test(r.innerText));r.querySelector('.pn-k.reg').click()});await W(300);
const ch=await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/PC-05/.test(r.innerText));const l=r.querySelector('.pn-osl');return l&&!l.hidden?[...l.querySelectorAll('.pn-osi')].map(x=>x.innerText.replace(/\s+/g,' ').trim()):null});
R('duas OS: escolha com numero, tipo, data',ch,JSON.stringify(ch)==='["0094 Preventiva 24/11","0095 Filtro de ar 25/11"]');
await p.screenshot({path:OUT+'/duas.png'});
await p.evaluate(()=>[...document.querySelectorAll('.pn-osi')][1].click());await W(900);
R('escolher abre o registro de filtro de ar da OS 0095',await p.evaluate(()=>document.querySelector('#sheet .sh-tt').innerText+' | '+document.querySelector('#sheet').innerText.slice(0,200).replace(/\s+/g,' ')),await p.evaluate(()=>/filtro de ar/i.test(document.querySelector('#sheet').innerText)&&/PC-05/.test(document.querySelector('#sheet').innerText)));
await p.evaluate(()=>document.querySelector('#scrim').click());await W(500);
// azul abre registro; registrar e ver sumir
await p.evaluate(()=>{const T=__T();T.S.focus='';T.render()});await W(300);
await p.evaluate(()=>{const r=[...document.querySelectorAll('.pn-r')].find(r=>/CB-03/.test(r.innerText));r.querySelector('.pn-k.reg').click()});await W(900);
const sh=await p.evaluate(()=>document.querySelector('#sheet').innerText.replace(/\s+/g,' ').slice(0,160));
R('azul abre o registro preenchido pela OS 0091 (CB-03)',sh,/Da OS 0091/.test(sh)&&/Registrar preventiva/.test(sh));
await p.evaluate(()=>document.querySelector('.hd-pri').click());await W(1500);
await p.evaluate(()=>{const T=__T();T.S.focus='';T.render()});await W(400);
L=await linhas(p);
R('depois de registrar: CB-03 some (so tinha o azul)',L.map(x=>x.tag),!L.some(x=>x.tag==='CB-03'));
const trs=await p.evaluate(async()=>(await window.__db.collection('trocas').get()).docs.map(d=>d.data().os));
R('registro gravado ligado a OS 0091',trs,trs.includes('o91'));
R('contagem baixa para 5',await p.evaluate(()=>document.querySelector('[data-pntab="eq"] b').innerText),await p.evaluate(()=>document.querySelector('[data-pntab="eq"] b').innerText)==='5');
await p.context().close();
// largura menor: o azul encurta e nao quebra linha
p=await abre(ADM,330);L=await linhas(p);
R('330 px: linhas (encurta sem quebrar)',L.map(x=>x.tag+' '+x.k.join(' ')),L.every(x=>x.cabe&&x.tagInteira&&x.alt===L[0].alt)&&L.some(x=>x.k[0]==='reg:Registrar'));
await p.screenshot({path:OUT+'/painel330.png'});await p.context().close();
// editor nao registra (como antes: sem OS a registrar)
p=await abre({uid:'co',papel:'consulta',nome:'Visita'});L=await linhas(p);
R('consulta: sem cartao azul (como antes)',L.map(x=>x.tag),L.every(x=>!x.k.some(k=>/^reg/.test(k))));await p.context().close();
R('sem erros',errs,errs.length===0);
console.log(`\n${nok} ok, ${nfa} falha(s)`);await b.close();process.exit(nfa?1:0)})();
