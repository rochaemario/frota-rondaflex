// Item 40: no mesmo dia e mesmo equipamento, Conferir planilha ordena pelo horimetro todos os registros do dia (linhas, lancados e leitura do horimetro).
// Vermelho so contra dia anterior ou seguinte. Uso: node item40.js (le /home/claude/pwa/dist)
const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm,hd,base,ult)=>['equipamentos/'+id,{codigo:id,tipo:'Caminhao',alocacao:'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:hd,status:'ativo',itens:[],combBase:base,combUltData:ult}];
const ab=(id,eqId,data,h,l,extra)=>['comb/2026-11/abast/'+id,{equipId:eqId,data,horimetro:h,litros:l,cheio:true,...(extra||{})}];
const seed=Object.fromEntries([
  eq('CB-06',58,'2026-11-16',{h:30,data:'2026-11-15',pend:0},'2026-11-15'),ab('c6a','CB-06','2026-11-15',30,40),
  eq('EH-08',660,'2026-11-16',{h:660,data:'2026-11-16',pend:0},'2026-11-16'),ab('e8a','EH-08','2026-11-15',640,90),ab('e8b','EH-08','2026-11-16',660,100,{horas:20,lh:5}),
  eq('CB-01',5100,'2026-11-17',{h:5100,data:'2026-11-17',pend:0},'2026-11-17'),ab('c1a','CB-01','2026-11-15',5000,100),ab('c1b','CB-01','2026-11-17',5100,100)]);
fs.writeFileSync('/tmp/i40.csv',['Data;TAG;Horimetro;Litros;Centro de custo','16/11/2026;CB-06;41,6;26;Planta','16/11/2026;CB-06;46;28;Planta',
 '16/11/2026;EH-08;650;50;Planta','16/11/2026;EH-08;635;30;Planta','16/11/2026;CB-01;5200;60;Planta'].join('\n')+'\n');
let ok=0,fa=0;const R=(k,v,esp)=>{const b=esp===undefined||JSON.stringify(v)===JSON.stringify(esp);b?ok++:fa++;console.log((b?'ok ':'XX ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v),b?'':' (esperado '+JSON.stringify(esp)+')')};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(900);
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const linhas=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].map(el=>{const c=el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-';return c+' '+el.querySelector('b').innerText+' '+(el.querySelector('.h')?.innerText||'')+' '+(el.querySelector('.l')?.innerText||'')}));
const msg=t=>p.evaluate(t=>{const el=[...document.querySelectorAll('.cpl-r[data-pr]')].find(e=>e.innerText.includes(t));return el?.querySelector('.ms')?.innerText.replace(/\s+/g,' ')||''},t);
await p.click('.cbx-mb');await W(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles('/tmp/i40.csv');await W(2500);
R('tela',await tt(),'Conferir planilha');
const L=await linhas();console.log(L);
R('CB-06 41,6 h sem alerta',L.find(x=>x.includes('CB-06 41,6')),'- CB-06 41,6 h 26 L');
R('CB-06 46 h sem alerta',L.find(x=>x.includes('CB-06 46')),'- CB-06 46 h 28 L');
R('EH-08 650 (antes do lancado 660 no dia) sem alerta',L.find(x=>x.includes('EH-08 650')),'- EH-08 650 h 50 L');
R('EH-08 635 (menor que 640 de 15/11) vermelho',L.find(x=>x.includes('EH-08 635')),'V EH-08 635 h 30 L');
R('mensagem 635',await msg('635'));
R('CB-01 5200 (maior que 5100 de 17/11) vermelho',L.find(x=>x.includes('CB-01 5')),'V CB-01 5.200 h 60 L');
R('mensagem 5200',await msg('5.200'));
R('botao Lancar 3',await p.evaluate(()=>document.querySelector('#lt-go').innerText),'Lancar 3');
await p.screenshot({path:'/tmp/i40_conf.png',fullPage:true});
await p.click('#lt-go');await W(5000);
R('volta para Abastecer',await tt(),'Abastecer');
const ab2=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','comb/2026-11/abast/%');return (r.data||[]).map(x=>x.data).filter(x=>x&&x.equipId&&x.data==='2026-11-16').map(x=>`${x.equipId} ${x.horimetro} ${x.litros} horas=${x.horas} lh=${x.lh}`).sort()});
console.log(ab2);
R('CB-06 41,6 gravado (11,6 h desde 30)',ab2.find(x=>x.startsWith('CB-06 41.6')),'CB-06 41.6 26 horas=11.6 lh=2.24');
R('CB-06 46 gravado (4,4 h)',ab2.find(x=>x.startsWith('CB-06 46')),'CB-06 46 28 horas=4.4 lh=6.36');
R('EH-08 650 gravado (10 h desde 640)',ab2.find(x=>x.startsWith('EH-08 650')),'EH-08 650 50 horas=10 lh=5');
R('EH-08 660 ja lancado recalculado (10 h)',ab2.find(x=>x.startsWith('EH-08 660')),'EH-08 660 100 horas=10 lh=10');
const eqs=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','equipamentos/%');return Object.fromEntries((r.data||[]).map(x=>[x.data.codigo,[x.data.horimetro,x.data.horimetroData,x.data.combBase&&x.data.combBase.h]]))});
R('CB-06 horimetro continua 58 · base 46',eqs['CB-06'],[58,'2026-11-16',46]);
R('EH-08 horimetro continua 660 · base 660',eqs['EH-08'],[660,'2026-11-16',660]);
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
