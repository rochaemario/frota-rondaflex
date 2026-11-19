// Item 37: Importar planilha abre "Conferir planilha" com todos os dias e lanca de uma vez.
// Uso: node item37.js (le /home/claude/pwa/dist, gerado pelo build.py)
const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm,aloc)=>['equipamentos/'+id,{codigo:id,tipo:'Escavadeira',alocacao:aloc||'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:'2026-11-01',status:'ativo',itens:[]}];
const seed=Object.fromEntries([eq('EH-06',6700),eq('EH-08',600),eq('CB-01',5000),eq('TA-02',5,'PQ'),
  ['comb/2026-11/abast/a1',{equipId:'EH-06',data:'2026-11-15',horimetro:6800,litros:226}]]);
fs.writeFileSync('/tmp/i37.csv',['Data;TAG;Horimetro;Litros;Centro de custo','12/11/2026;EH-06;6710;200;Planta','13/11/2026;EH-06;6726;80;Planta','13/11/2026;EH-06;6720;210;Planta',
 '14/11/2026;EH-08;640;150;Planta','14/11/2026;CB-01;5050;120;Planta','15/11/2026;EH-06;6800;226;Planta','15/11/2026;EH-08;630;100;Planta','16/11/2026;EH-08;660;150;Planta',
 '16/11/2026;EH-08;665;150;Planta','16/11/2026;XYZ-9;100;50;Planta','16/11/2026;TA-02;10;50;Planta'].join('\n')+'\n');
let ok=0,fa=0;const R=(k,v,esp)=>{const b=esp===undefined||JSON.stringify(v)===JSON.stringify(esp);b?ok++:fa++;console.log((b?'ok ':'XX ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v),b?'':' (esperado '+JSON.stringify(esp)+')')};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(600);
const imp=async f=>{await p.click('.cbx-mb');await W(200);const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles(f);await W(2200)};
await imp('/tmp/i37.csv');
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const linhas=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].map(el=>{const c=el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-';return c+' '+el.querySelector('b').innerText+' '+(el.querySelector('.h')?.innerText||'')+' '+(el.querySelector('.l')?.innerText||'')}));
const dias=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-d')].map(x=>x.innerText.replace(/\s+/g,' ')));
const bot=()=>p.evaluate(()=>document.querySelector('#lt-go').getAttribute('aria-label'));
R('tela',await tt(),'Conferir planilha');
R('dias',await dias());
const L=await linhas();R('linhas (10 da planilha, sem XYZ-9)',L.length,10);console.log(L.join('\n'));
R('13/11 EH-06 duas linhas, em ordem de horimetro, sem vermelho',L.filter(x=>x.includes('EH-06 6.72')),['- EH-06 6.720 h 210 L','- EH-06 6.726 h 80 L']);
R('15/11 EH-06 igual a lancado (h e L) = ja lancado (item 38)',L.includes('J EH-06 6.800 h 226 L'),true);
R('15/11 EH-08 menor que dia anterior = vermelho',L.includes('V EH-08 630 h 100 L'),true);
R('16/11 EH-08 mesmos litros no dia = amarelo',L.includes('A EH-08 665 h 150 L'),true);
R('TA-02 em PQ = vermelho',L.some(x=>x.startsWith('V TA-02')),true);
R('botao',await bot(),'Lancar 7 abastecimentos');
R('resumo',await p.evaluate(()=>document.querySelector('.cpl-sm').innerText.replace(/\s+/g,' ')));
R('fora',await p.evaluate(()=>document.querySelector('.cpl-fo')?.innerText));
await p.screenshot({path:'/tmp/i37_1.png'});await p.screenshot({path:'/tmp/i37_1f.png',fullPage:true});
// Filtrar vermelhos
await p.click('[data-pf]');await W(400);R('Filtrar abriu',await tt(),'Filtrar');await p.click('[data-fs]');await W(150);await p.click('[data-fv="vm"]');await W(150);
R('contagem ao vivo',await p.evaluate(()=>document.querySelector('#cplf-n').innerText),'2 linhas');await p.screenshot({path:'/tmp/i37_filtrar.png'});
await p.click('#sheet .hd-pri');await W(800);R('com Filtrar vermelhos',(await linhas()).map(x=>x.slice(0,8)),['V EH-08 ','V TA-02 ']);
R('pilula',await p.evaluate(()=>document.querySelector('.cpl-pl')?.innerText),'Vermelhos ✕');
// corrigir EH-08 15/11
await p.click('.cpl-r[data-pr]:has-text("630")');await W(300);await p.fill('.cpl-r.ab [data-ph]','645');await W(900);
R('corrigido: sem vermelho',await p.evaluate(()=>!document.querySelector('.cpl-r.ab').classList.contains('er')),true);
await p.screenshot({path:'/tmp/i37_corrigir.png'});
await p.click('.cpl-r.ab [data-pok]');await W(500);R('botao depois de corrigir',await bot(),'Lancar 8 abastecimentos');
await p.click('[data-px="vm"]');await W(500);R('tirou o Filtrar',(await linhas()).length,10);
// tirar TA-02
await p.click('.cpl-r[data-pr]:has-text("TA-02")');await W(300);await p.click('.cpl-r.ab [data-pt]');await W(700);R('TA-02 tirada',(await linhas()).some(x=>x.includes('TA-02')),false);
// sair e voltar mantem
await p.click('#sheet [data-back]');await W(700);R('volta ao Abastecer com aviso',await p.evaluate(()=>document.querySelector('#cbx-pd')?.innerText.replace(/\s+/g,' ')));
await p.click('[data-ppl]');await W(1500);R('reabre com 9 linhas',(await linhas()).length,9);
// lancar
const nAb=()=>p.evaluate(async()=>{const r=await window.__sb.from('docs').select('*').like('path','comb/2026-11/abast/%');return (r.data||[]).map(x=>x.data).filter(x=>x&&x.equipId).map(x=>x.data+' '+x.equipId+' '+x.horimetro+' '+x.litros).sort()});
const antes=(await nAb()).length;
await p.click('#lt-go');await W(4000);
const dep=await nAb();R('lancados no banco',dep.length-antes,8);console.log(dep.join('\n'));
R('EH-06 13/11: as duas',dep.filter(x=>x.startsWith('2026-11-13 EH-06')),['2026-11-13 EH-06 6720 210','2026-11-13 EH-06 6726 80']);
R('tela depois de lancar',await tt());R('planilha guardada apagada',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('pl:')).length),0);
await p.screenshot({path:'/tmp/i37_fim.png'});
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
