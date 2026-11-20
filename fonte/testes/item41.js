// Item 41: Lancar da planilha mostra o motivo de cada erro; conferencia faz as verificacoes do abastOp (sem gravar);
// abastecimento esquecido entra em periodo fechado (admin e editor). Uso: node item41.js [editor|consulta]
const {chromium}=require('playwright');const fs=require('fs');
const PAPEL=process.argv[2]||'admin';
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm,hd,base,ult)=>['equipamentos/'+id,{codigo:id,tipo:'Caminhao',alocacao:'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:hd,status:'ativo',itens:[],combBase:base,combUltData:ult}];
const ab=(id,m,eqId,data,h,l)=>[`comb/${m}/abast/${id}`,{equipId:eqId,data,horimetro:h,litros:l,cheio:true,comboio:'c01'}];
const seed=Object.fromEntries([
  ['config/combFech',{c01:[{corte:'2026-09-30',saldo:1000,calc:null,ts:1},{corte:'2026-10-31',saldo:500,calc:520,ts:2}]}],
  eq('CB-07',2750,'2026-11-10',{h:2720,data:'2026-11-05',pend:0},'2026-11-05'),ab('c7a','2026-10','CB-07','2026-10-25',2670,100),ab('c7b','2026-11','CB-07','2026-11-05',2720,90),
  eq('EH-08',700,'2026-11-15',{h:700,data:'2026-11-15',pend:0},'2026-11-15'),ab('e8a','2026-11','EH-08','2026-11-10',600,80),ab('e8b','2026-11','EH-08','2026-11-15',700,90)]);
fs.writeFileSync('/tmp/i41.csv',['Data;TAG;Horimetro;Litros;Centro de custo','29/10/2026;CB-07;2681,8;155;Planta','29/10/2026;CB-07;2687,3;80;Planta','30/10/2026;CB-07;2697,4;128;Planta',
 '12/11/2026;EH-08;650;600;Planta'].join('\n')+'\n');
let ok=0,fa=0;const R=(k,v,esp)=>{const b=esp===undefined||JSON.stringify(v)===JSON.stringify(esp);b?ok++:fa++;console.log((b?'ok ':'XX ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v),b?'':' (esperado '+JSON.stringify(esp)+')')};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__LOGGED=1;window.__PAPEL=pp},[seed,PAPEL]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(900);
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const linhas=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].map(el=>{const c=el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-';return c+' '+el.querySelector('b').innerText+' '+(el.querySelector('.h')?.innerText||'')}));
const msg=t=>p.evaluate(t=>{const el=[...document.querySelectorAll('.cpl-r[data-pr]')].find(e=>e.innerText.includes(t));return el?.querySelector('.ms')?.innerText.replace(/\s+/g,' ')||''},t);
await p.click('.cbx-mb');await W(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles('/tmp/i41.csv');await W(3000);
const L=await linhas();console.log(L);
if(PAPEL==='consulta'){R('consulta: periodo fechado continua vermelho',L.filter(x=>x.startsWith('V CB-07')).length,3);R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close();return}
R('CB-07 3 linhas amarelas (periodo fechado)',L.filter(x=>x.startsWith('A CB-07')).length,3);
R('mensagem CB-07',await msg('2.681,8'));
R('EH-08 sem saldo vermelho na conferencia',L.find(x=>x.includes('EH-08')),'V EH-08 650 h');
R('mensagem EH-08',await msg('EH-08'));
R('botao Lancar 3',await p.evaluate(()=>document.querySelector('#lt-go').innerText),'Lancar 3');
await p.screenshot({path:'/tmp/i41_conf.png',fullPage:true});
await p.click('#lt-go');await W(6000);
R('volta para Abastecer',await tt(),'Abastecer');
const abs=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','comb/%/abast/%');return (r.data||[]).map(x=>x.data).filter(x=>x&&x.equipId==='CB-07').map(x=>`${x.data} ${x.horimetro} ${x.litros} h=${x.horas}${x.posFech?' esquecido':''}`).sort()});
console.log(abs);
R('CB-07 gravados em ordem com consumo',abs,['2026-10-25 2670 100 h=null','2026-10-29 2681.8 155 h=11.8 esquecido','2026-10-29 2687.3 80 h=5.5 esquecido','2026-10-30 2697.4 128 h=10.1 esquecido','2026-11-05 2720 90 h=22.6']);
const fch=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').eq('path','config/combFech');const d=(r.data||[])[0].data.c01[1];return [d.saldo,d.calc,(d.pos||[]).length]});
R('fechamento 31/10: saldo conferido igual, calculado refeito, 3 depois',fch,[500,157,3]);
const eqc=await p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').eq('path','equipamentos/CB-07');const x=r.data[0].data;return [x.horimetro,x.combBase.h,x.combUltData]});
R('CB-07 equipamento nao muda',eqc,[2750,2720,'2026-11-05']);
// Nao lancados: EH-08 com o motivo
await p.click('.cbx-mb');await W(200);await p.click('.cbx-pop [data-cm="0"]');await W(2000);
R('Nao lancados',await tt(),'Nao lancados');R('EH-08 vermelho',await linhas(),['V EH-08 650 h']);
// falha guardada aparece; OK limpa
await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.includes('pl:c01'));const P=JSON.parse(localStorage.getItem(k));P.rows[0].falha='Falha ao gravar (teste).';localStorage.setItem(k,JSON.stringify(P))});
await p.click('#sheet .sh-back, #sheet [data-back]').catch(()=>{});await W(600);
await p.click('.cbx-mb');await W(200);await p.click('.cbx-pop [data-cm="0"]');await W(2000);
R('falha do Lancar aparece com o motivo',await msg('EH-08'));
await p.click('.cpl-r[data-pr]:has-text("EH-08")');await W(300);await p.click('.cpl-r.ab [data-pok]');await W(1500);
R('OK limpa a falha e confere de novo',(await msg('EH-08')).includes('Sem saldo'),true);
// tela Fechar mes mostra o aviso
await p.evaluate(()=>history.back());await W(800);
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
