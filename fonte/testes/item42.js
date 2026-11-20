// Item 42: abastecimento com data errada (CB-07 30/07): achar pela TAG em Abastecimentos (qualquer mes), editar (inclusive esquecido em periodo fechado);
// importacao: data fora do periodo da planilha fica vermelha (Corrigir data / Data certa). Uso: node item42.js [fech]
const {chromium}=require('playwright');const fs=require('fs');
const FECH=process.argv[2]==='fech';
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm,hd,base,ult)=>['equipamentos/'+id,{codigo:id,tipo:'Caminhao',alocacao:'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:hd,status:'ativo',itens:[],combBase:base,combUltData:ult}];
const ab=(id,m,eqId,data,h,l,x)=>[`comb/${m}/abast/${id}`,{equipId:eqId,data,horimetro:h,litros:l,cheio:true,comboio:'c01',custo:'mina',...(x||{})}];
const seed=Object.fromEntries([
  ...(FECH?[['config/combFech',{c01:[{corte:'2026-06-30',saldo:900,calc:null,ts:1},{corte:'2026-09-30',saldo:2000,calc:465,ts:2,pos:[{eq:'CB-07',equipId:'CB-07',data:'2026-07-30',litros:35,mes:'2026-07',id:'c7x',por:'Mario',em:1}]}]}]]:[]),
  eq('CB-07',2750,'2026-11-10',{h:2720,data:'2026-11-05',pend:0},'2026-11-05'),
  ab('c7o','2026-08','CB-07','2026-08-10',2600,50),ab('c7x','2026-07','CB-07','2026-07-30',2702.2,35,FECH?{posFech:{corte:'2026-09-30',em:1,por:'Mario'}}:{}),
  ab('c7a','2026-10','CB-07','2026-10-25',2670,100),ab('c7b','2026-11','CB-07','2026-11-05',2720,90),
  ['comb/2026-08',{eq:{'CB-07':{lt:50,n:1,l:0,h:0}},dia:{'10':50},cbDia:{c01:{'10':50}},cus:{mina:50}}],['comb/2026-10',{}],['comb/2026-11',{}],
  ['comb/2026-07',{eq:{'CB-07':{lt:35,n:1,l:0,h:0}},dia:{'30':35},cbDia:{c01:{'30':35}},cus:{mina:35}}],
  eq('CB-01',5000,'2026-11-01',{h:5000,data:'2026-11-01',pend:0},'2026-11-01')]);
fs.writeFileSync('/tmp/i42.csv',['Data;TAG;Horimetro;Litros;Centro de custo','29/10/2026;CB-07;2681,8;155;Mina','29/10/2026;CB-07;2687,3;80;Mina','30/10/2026;CB-07;2697,4;128;Mina',
 '15/06/2026;CB-01;5050;100;Planta','16/11/2026;CB-01;5080;90;Planta'].join('\n')+'\n');
let ok=0,fa=0;const R=(k,v,esp)=>{const b=esp===undefined||JSON.stringify(v)===JSON.stringify(esp);b?ok++:fa++;console.log((b?'ok ':'XX ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v),b?'':' (esperado '+JSON.stringify(esp)+')')};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp)){let body=fs.readFileSync(fp);if(f==='index.html')body=body.toString().replace('async function openDelAbast(){','window.__oda=()=>openDelAbast();async function openDelAbast(){');return r.fulfill({body,contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'})}return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const linhas=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].map(el=>{const c=el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-';return c+' '+el.querySelector('b').innerText+' '+(el.querySelector('.h')?.innerText||'')}));
const msg=t=>p.evaluate(t=>{const el=[...document.querySelectorAll('.cpl-r[data-pr]')].find(e=>e.innerText.includes(t));return el?.querySelector('.ms')?.innerText.replace(/\s+/g,' ')||''},t);
const abrePl=async()=>{await p.click('.cbx-mb');await W(200);await p.click('.cbx-pop [data-cm="0"]');await W(2500)};
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(900);
await p.click('.cbx-mb');await W(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles('/tmp/i42.csv');await W(3000);
console.log(await linhas());
R('CB-07 29/10 vermelho pelo 30/07',await msg('2.681,8'));
R('CB-01 15/06 vermelho data fora',(await msg('5.050')).startsWith('Data fora do periodo da planilha (15/06/2026; demais linhas 29/10 a 16/11)'),true);
R('botoes Corrigir data / Data certa',await p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].find(e=>e.innerText.includes('5.050')).querySelectorAll('[data-bt="d"],[data-bt="k"]').length),2);
// Corrigir data na propria linha
await p.click('.cpl-r[data-pr]:has-text("5.050") [data-bt="d"]');await W(400);
R('campo data com foco',await p.evaluate(()=>document.activeElement&&document.activeElement.matches('[data-pdt]')),true);
await p.evaluate(()=>{const i=document.querySelector('.cpl-r.ab [data-pdt]');i.value='2026-11-14';i.dispatchEvent(new Event('change',{bubbles:true}))});await W(2500);
R('CB-01 agora em 14/11 sem vermelho',await p.evaluate(()=>{const el=document.querySelector('.cpl-r.ab');return el.classList.contains('er')+' '+(el.closest('.cpl-rows').querySelector('[data-pd="2026-11-14"]').nextElementSibling.dataset.pr===el.dataset.pr)}),'false true');
console.log('msg 5.080:',await msg('5.080'));
R('grupo 14/11 existe',await p.evaluate(()=>!!document.querySelector('[data-pd="2026-11-14"]')),true);
await p.screenshot({path:'/tmp/i42_conf.png',fullPage:true});
// sai e vai em Abastecimentos
await p.evaluate(()=>window.__oda());await W(1500);
await p.fill('#ab-q','CB-07');await W(1500);
R('secao Antes de 01/10 · CB-07',await p.evaluate(()=>document.querySelector('#ab-ant .lbl')?.innerText),'ANTES DE 01/10 · CB-07');
R('itens antigos',await p.evaluate(()=>[...document.querySelectorAll('#ab-ant [data-ab]')].map(x=>x.querySelector('.cb-dd').innerText+(x.classList.contains('ro')?' ro':''))),FECH?['10/08/2026 ro','30/07/2026']:['10/08/2026','30/07/2026']);
await p.screenshot({path:'/tmp/i42_ab.png',fullPage:true});
await p.click('#ab-ant [data-ab="2026-07/c7x"] [data-ia]');await W(300);await p.click('#ab-ant [data-ab="2026-07/c7x"] [data-abe]');await W(300);
await p.evaluate(()=>{const i=document.querySelector('#ab-ant [data-ab="2026-07/c7x"] [data-ed="d"]');i.value='2026-10-30'});
await p.click('#ab-ant [data-ab="2026-07/c7x"] [data-eds]');await W(3000);
const rec=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','comb/%/abast/c7x');return (r.data||[]).map(x=>x.path+' '+x.data.data+' '+x.data.horimetro+' '+x.data.litros+' '+(x.data.posFech?'esq':'')+' hist='+(x.data.hist||[]).length)});
R('lancamento movido para 30/10 com historico',rec,['comb/2026-10/abast/c7x 2026-10-30 2702.2 35  hist=1']);
const jul=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').eq('path','comb/2026-07');const d=r.data[0].data;return [d.eq['CB-07']||null,d.cbDia.c01['30']||0]});
R('resumo de julho sem o CB-07',jul,[null,0]);
if(FECH){const f=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').eq('path','config/combFech');const d=r.data[0].data.c01[1];return [d.saldo,d.calc,(d.pos||[]).length]});R('fechamento 30/09: calculado volta (465+35), sai da lista',f,[2000,500,0])}
// Nao lancados: agora o CB-07 lanca
R('erros ate aqui',errs,[]);
for(let i=0;i<6&&await p.evaluate(()=>!!document.querySelector('#sheet h2'));i++){await p.evaluate(()=>history.back());await W(600)}
if(await p.$('[data-acc="frota"]')){await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W()}
if(await p.$('[data-cbx="cb"]')){await p.click('[data-cbx="cb"]');await W(500)}await p.click('#cbx-ab');await W(900);
await abrePl();console.log(await linhas());
R('CB-07 sem vermelho',(await linhas()).filter(x=>x.includes('CB-07')&&!x.startsWith('-')&&!x.startsWith('A')),[]);
R('Lancar 5',await p.evaluate(()=>document.querySelector('#lt-go').innerText),'Lancar 5');
await p.click('#lt-go');await W(7000);R('volta para Abastecer',await tt(),'Abastecer');
const abs=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','comb/%/abast/%');return (r.data||[]).map(x=>x.data).filter(x=>x&&x.equipId==='CB-07'&&x.data>='2026-10-29').map(x=>`${x.data} ${x.horimetro} h=${x.horas}`).sort()});
R('CB-07 em ordem',abs,['2026-10-29 2681.8 h=11.8','2026-10-29 2687.3 h=5.5','2026-10-30 2697.4 h=10.1','2026-10-30 2702.2 h=4.8','2026-11-05 2720 h=17.8']);
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
