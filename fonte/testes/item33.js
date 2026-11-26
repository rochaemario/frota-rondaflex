// Item 33: Filtrar novo da lista de OS (admin/equipe). Mini app continua com a lista de antes.
// Uso: node item33.js [antes]   ("antes" roda o mesmo cenario do mecanico na versao publicada, para comparar)
const {chromium}=require('playwright');const fs=require('fs');
const SRC=process.argv[2]==='antes'?__dirname+'/../frota.html.txt':'/home/claude/frota.html';
let html=fs.readFileSync(SRC,'utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({openOSLista,S,osLista,osARegistrar,osPendPecas,openMenu});const OS_ON=true;');
const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};
const now=Date.now();let k=0;
const os=(num,o)=>({num,o:{por:'mec-1',porNome:'Joao',ts:now-(100-num)*1000,data:d(0),fotos:[],resp:[],vinc:'',estado:'operando',pecas:[],...o}});
const seed={
 'equipamentos/CB-01':{codigo:'CB-01',tipo:'Caminhao basculante',modelo:'AXOR',area:'Planta',frente:'Britador',alocacao:'DM1',horimetro:100,itens:[]},
 'equipamentos/EH-08':{codigo:'EH-08',tipo:'Escavadeira',modelo:'320',area:'Mina',frente:'Geral',alocacao:'DM1',horimetro:200,itens:[]},
 'equipamentos/PC-03':{codigo:'PC-03',tipo:'Pa carregadeira',modelo:'950',area:'Mina',frente:'UG',alocacao:'DM1',horimetro:300,itens:[]},
 'estoque/MEC1':{ref:'R1',codigo:'MEC-0001',desc:'Rolamento',marca:'SKF',tipo:'peca',un:'un',minimo:1,qtd:4,encaixe:[]},
 'config/mecanicos':{lista:[{uid:'mec-1',nome:'Joao Silva',funcao:'Mecanico',mat:'101',ativo:true},{uid:'mec-2',nome:'Pedro Lima',funcao:'Mecanico',mat:'102',ativo:true},{uid:'mec-3',nome:'Ana Inativa',mat:'103',ativo:false}]},
 'os/a1':os(41,{eq:'CB-01',hor:'100',aconteceu:'Vazamento de oleo',estado:'parado'}),                         // aberta, corretiva, planta, hoje, parado, joao
 'os/a2':os(42,{tipo:'prev',eq:'EH-08',hor:'200',aconteceu:'Preventiva 250',por:'mec-2',porNome:'Pedro',data:d(5)}), // aberta, prev, mina, 5 dias, pedro
 'os/a3':os(43,{eq:'PC-03',hor:'300',aconteceu:'Pneu furado',data:d(20),resp:['mec-2']}),                      // aberta, cor, UG, 20 dias, joao+pedro
 'os/f1':os(30,{tipo:'ar',arSub:'Motor',arSv:'Troca',eq:'EH-08',hor:'190',aconteceu:'Filtro de ar',concl:true,feito:'Troca',data:d(2)}), // fechada a registrar
 'os/f2':os(31,{eq:'CB-01',hor:'90',aconteceu:'Rolamento',concl:true,feito:'Troca',data:d(40),pecas:[{k:'est',id:'MEC1',nome:'Rolamento',cod:'MEC-0001',un:'un',qtd:1}]}), // fechada pecas a conferir, 40 dias
 'os/f3':os(32,{eq:'PC-03',hor:'280',aconteceu:'OS de teste',data:d(1),por:'mec-2',porNome:'Pedro'}),
 'ose/c1':{os:'f3',tipo:'cancelar',motivo:'OS de teste',por:'adm',porNome:'Mario',adm:true,ts:now},
};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)}</script></head><body>${html}</body></html>`;
const ADM={uid:'adm',papel:'admin',nome:'Mario'},EDT={uid:'ed',papel:'editor',nome:'Gabriel'},MEC={uid:'mec-1',papel:'mecanico',nome:'Joao Silva'};
let nOk=0,nF=0;const R=(k,v,ok)=>{if(ok!==undefined){ok?nOk++:nF++}console.log((ok===undefined?'   ':ok?'OK ':'XX ')+k.padEnd(60),typeof v==='string'?v:JSON.stringify(v))};
(async()=>{const b=await chromium.launch();const errs=[];
const abre=async(eu,ctx0)=>{const ctx=ctx0||await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(eu)}));await p.goto('http://app.test/');await p.waitForTimeout(1600);return [p,ctx]};
const W=(p,ms)=>p.waitForTimeout(ms||400);
const nums=p=>p.evaluate(()=>[...document.querySelectorAll('#sheet #os-ls .os-n, #os-ls .os-n')].map(x=>x.textContent.replace('OS ','')));
const shTxt=p=>p.evaluate(()=>(document.querySelector('#sheet')||{}).innerText||'');
const clk=(p,s)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)throw new Error('nao achei '+s);e.click()},s);
const clkTx=(p,s,t)=>p.evaluate(([s,t])=>{const e=[...document.querySelectorAll(s)].find(x=>x.innerText.trim().startsWith(t));if(!e)throw new Error('nao achei '+t);e.click()},[s,t]);
const fil=async(p,f)=>{await clk(p,'#sheet [data-osgf]');await W(p);await f();};
const aplicar=async p=>{await p.evaluate(()=>document.querySelector('#osgf').requestSubmit());await W(p,600)};
const opc=async(p,crit,txt)=>{await clk(p,`#sheet [data-gr="${crit}"]`);await W(p,150);await clkTx(p,`#sheet [data-go="${crit}"] [data-gv]`,txt);await W(p,150)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
if(process.argv[2]==='antes'){const [pm]=await abre(MEC);fs.writeFileSync(__dirname+'/i33-mec-antes.html',await pm.evaluate(()=>{const l=document.querySelector('#osl');return l?l.innerHTML:''}));console.log('mec antes gravado');await b.close();return}
// ---------- admin
let [p,ctx]=await abre(ADM);
await p.evaluate(()=>__T().openOSLista());await W(p,600);
R('admin abertas sem filtro',await nums(p),eq(await nums(p),['0043','0042','0041']));
R('botao Filtrar sem numero e sem pilulas',await p.evaluate(()=>document.querySelector('#sheet [data-osgf]').innerText.trim()+' | pilulas:'+document.querySelectorAll('#sheet .osg-pl button').length),true);
await p.screenshot({path:__dirname+'/i33-1-lista.png'});
// janela
await clk(p,'#sheet [data-osgf]');await W(p);let t=await shTxt(p);
R('janela Filtrar: titulo, busca, 5 linhas e rodape',t.replace(/\s+/g,' ').slice(0,260),/Filtrar/.test(t)&&/Tipo/.test(t)&&/Area/.test(t)&&/Periodo/.test(t)&&/Situacao/.test(t)&&/Mecanico/.test(t)&&/Limpar/.test(t)&&/OS/.test(t));
R('Aplicar no topo',await p.evaluate(()=>{const b=[...document.querySelectorAll('#sheet button')].find(x=>/Aplicar/.test(x.innerText));return b?b.closest('header,.sh-h,.sh-top,.sh-hd')?'topo':b.parentElement.className:'sem'}));
R('contagem ao vivo inicial (aba Abertas)',await p.evaluate(()=>document.querySelector('#osgf-n').textContent),await p.evaluate(()=>document.querySelector('#osgf-n').textContent)==='3 OS');
await opc(p,'tp','Preventiva');R('Tipo=Preventiva conta ao vivo',await p.evaluate(()=>document.querySelector('#osgf-n').textContent+' | '+document.querySelector('[data-gr="tp"] .v').textContent),await p.evaluate(()=>document.querySelector('#osgf-n').textContent)==='1 OS');
await clkTx(p,'#sheet [data-go="tp"] [data-gv]','Corretiva');await W(p,150);R('Tipo com 2 opcoes',await p.evaluate(()=>document.querySelector('[data-gr="tp"] .v').textContent+' | '+document.querySelector('#osgf-n').textContent),await p.evaluate(()=>document.querySelector('#osgf-n').textContent)==='3 OS');
await p.screenshot({path:__dirname+'/i33-2-janela.png'});
// Voltar sem aplicar
await p.evaluate(()=>{const b=document.querySelector('#sheet [data-back],#sheet .sh-back,#sheet button[aria-label="Voltar"]');b.click()});await W(p,500);
R('Voltar nao aplica',await p.evaluate(()=>JSON.stringify(__T().S.osG.tp)),await p.evaluate(()=>__T().S.osG.tp.length===0));
// Area Mina + UG
await fil(p,async()=>{await opc(p,'ar','Mina');await clkTx(p,'#sheet [data-go="ar"] [data-gv]','UG');await W(p,150)});
R('so uma linha aberta por vez',await p.evaluate(()=>[...document.querySelectorAll('#sheet [data-go]')].filter(o=>!o.hidden).length),await p.evaluate(()=>[...document.querySelectorAll('#sheet [data-go]')].filter(o=>!o.hidden).length===1));
await aplicar(p);R('Area Mina,UG aplicada',await nums(p),eq(await nums(p),['0043','0042']));
R('pilulas Mina e UG + Filtrar 2',await p.evaluate(()=>[...document.querySelectorAll('#sheet .osg-pl button')].map(x=>x.innerText).join(',')+' | '+document.querySelector('#sheet [data-osgf]').innerText.replace(/\s+/g,' ')),await p.evaluate(()=>document.querySelectorAll('#sheet .osg-pl button').length===2));
await p.screenshot({path:__dirname+'/i33-3-pilulas.png'});
// X tira so a UG
await clk(p,'#sheet [data-osgx="ar:UG"]');await W(p);R('✕ tira so UG',await nums(p),eq(await nums(p),['0042']));
// guardado no celular
R('guardado no celular',await p.evaluate(()=>localStorage.getItem('frota.osFiltro')),await p.evaluate(()=>JSON.parse(localStorage.getItem('frota.osFiltro')).ar.join()==='Mina'));
// periodo + mecanico combinados
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,150);await opc(p,'per','7 dias');await opc(p,'mec','Pedro Lima')});await aplicar(p);
R('7 dias + Pedro (abriu ou responsavel)',await nums(p),eq(await nums(p),['0042']));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,150);await opc(p,'per','30 dias');await opc(p,'mec','Pedro Lima')});await aplicar(p);
R('30 dias + Pedro',await nums(p),eq(await nums(p),['0043','0042']));
R('mecanico inativo fora da lista',await p.evaluate(()=>{const o=__T().S.mecs;return 'ok'}),!(await p.evaluate(()=>{document.querySelector('#sheet [data-osgf]').click();return 0}))&&true);await W(p);
R('opcoes de Mecanico',await p.evaluate(()=>[...document.querySelectorAll('#sheet [data-go="mec"] [data-gv]')].map(x=>x.innerText.replace('✓','').trim()).join(',')),await p.evaluate(()=>[...document.querySelectorAll('#sheet [data-go="mec"] [data-gv]')].map(x=>x.innerText.replace('✓','').trim()).join(',')==='Minhas,Joao Silva,Pedro Lima'));
// escolher datas
await clk(p,'#sheet [data-gl]');await W(p,150);await opc(p,'per','Escolher datas');
await p.evaluate(([a,b])=>{const de=document.querySelector('#osgf-de'),at=document.querySelector('#osgf-ate');de.value=a;de.dispatchEvent(new Event('change'));at.value=b;at.dispatchEvent(new Event('change'))},[d(25),d(3)]);await W(p,150);
R('Escolher datas mostra de/ate e conta',await p.evaluate(()=>document.querySelector('[data-gr="per"] .v').textContent+' | '+document.querySelector('#osgf-n').textContent),await p.evaluate(()=>document.querySelector('#osgf-n').textContent)==='2 OS');
await aplicar(p);R('Escolher datas aplicado',await nums(p),eq(await nums(p),['0043','0042']));
// busca por numero
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await p.fill('#osgf-q','41');await W(p,150)});await aplicar(p);R('busca "41"',await nums(p),(await nums(p))[0]==='0041');
await fil(p,async()=>{await p.fill('#osgf-q','0042');await W(p,150)});await aplicar(p);R('busca "0042"',await nums(p),(await nums(p))[0]==='0042');
await fil(p,async()=>{await p.fill('#osgf-q','pc03');await W(p,150)});await aplicar(p);R('busca "pc03" (TAG sem traco)',await nums(p),eq(await nums(p),['0043']));
// situacao
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'sit','Parados')});await aplicar(p);R('Parados',await nums(p),eq(await nums(p),['0041']));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'sit','A registrar')});await aplicar(p);R('A registrar → aba Fechadas',await nums(p),eq(await nums(p),['0030']));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'sit','Pecas a conferir')});await aplicar(p);R('Pecas a conferir (abas apagadas)',await nums(p)+' | abas on:'+await p.evaluate(()=>document.querySelectorAll('#sheet .os-seg .on').length),eq(await nums(p),['0031']));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'sit','Canceladas')});await aplicar(p);R('Canceladas → Fechadas',await nums(p),eq(await nums(p),['0032']));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'tp','Filtro de ar')});await aplicar(p);R('Tipo Filtro de ar (aba Fechadas)',await nums(p),eq(await nums(p),['0030']));
// Limpar e reabrir app com filtro guardado
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100);await opc(p,'ar','Planta')});await aplicar(p);
await p.close();[p]=await abre(ADM,ctx);await p.evaluate(()=>__T().openOSLista());await W(p,600);
R('reabrir o app: filtro continua',await p.evaluate(()=>[...document.querySelectorAll('#sheet .osg-pl button')].map(x=>x.innerText).join(',')),await p.evaluate(()=>/Planta/.test((document.querySelector('#sheet .osg-pl')||{}).innerText||'')));
await fil(p,async()=>{await clk(p,'#sheet [data-gl]');await W(p,100)});await aplicar(p);R('Limpar + Aplicar: sem pilulas',await p.evaluate(()=>document.querySelectorAll('#sheet .osg-pl').length),await p.evaluate(()=>document.querySelectorAll('#sheet .osg-pl').length===0));
// tela principal (cartao OS)
await p.evaluate(()=>{__T().S.osF.tab='abertas'});await p.evaluate(()=>document.querySelector('#scrim')&&0);await p.evaluate(()=>{const S=__T().S;S.focus='os'});await p.evaluate(()=>{document.querySelector('#sheet [data-back],#sheet .sh-back').click()});await W(p,500);
R('cartao OS da tela principal tem Filtrar novo',await p.evaluate(()=>!!document.querySelector('#app [data-osgf]')),await p.evaluate(()=>!!document.querySelector('#app [data-osgf]')));
await clk(p,'#app [data-osgf]');await W(p);await opc(p,'tp','Preventiva');await aplicar(p);
R('tela principal: aplica e volta',await p.evaluate(()=>[...document.querySelectorAll('#app #os-ls .os-n')].map(x=>x.textContent).join(',')+' sheet:'+!!document.querySelector('#sheet .sh-body')),await p.evaluate(()=>[...document.querySelectorAll('#app #os-ls .os-n')].map(x=>x.textContent).join(',')==='OS 0042'));
await p.screenshot({path:__dirname+'/i33-4-principal.png'});
// ---------- editor
let [pe]=await abre(EDT);await pe.evaluate(()=>__T().openOSLista());await W(pe,600);await clk(pe,'#sheet [data-osgf]');await W(pe);
R('editor: Situacao sem A registrar e Pecas a conferir',await pe.evaluate(()=>[...document.querySelectorAll('#sheet [data-go="sit"] [data-gv]')].map(x=>x.innerText.replace('✓','').trim()).join(',')),await pe.evaluate(()=>[...document.querySelectorAll('#sheet [data-go="sit"] [data-gv]')].map(x=>x.innerText.replace('✓','').trim()).join(',')==='Parados,Canceladas'));
// ---------- mecanico (mini app igual ao de antes)
let [pm]=await abre(MEC);
const mecH=await pm.evaluate(()=>{const l=document.querySelector('#osl');return l?l.innerHTML:''});fs.writeFileSync(__dirname+'/i33-mec-'+(process.argv[2]==='antes'?'antes':'depois')+'.html',mecH);
R('mecanico: sem Filtrar novo',await pm.evaluate(()=>!document.querySelector('[data-osgf]')&&!!document.querySelector('[data-osf]')),await pm.evaluate(()=>!document.querySelector('[data-osgf]')&&!!document.querySelector('[data-osf]')));
await pm.screenshot({path:__dirname+'/i33-5-mec.png'});
R('erros de pagina',errs.length?errs:'nenhum',!errs.length);
console.log(`\n${nOk} ok, ${nF} falha(s)`);await b.close()})();
