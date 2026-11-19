// Item 38 (vermelhos explicados e Ja lancado) sobre o item 37: Importar planilha abre "Conferir planilha" com todos os dias e lanca de uma vez.
// Uso: node item37.js (le /home/claude/pwa/dist, gerado pelo build.py)
const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm,aloc)=>['equipamentos/'+id,{codigo:id,tipo:'Escavadeira',alocacao:aloc||'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:'2026-11-01',status:'ativo',itens:[]}];
const seed=Object.fromEntries([eq('EH-06',6700),eq('EH-08',600),eq('TA-02',5,'PQ'),
  ['equipamentos/CB-01',{codigo:'CB-01',tipo:'Caminhao',alocacao:'DM1',area:'Planta',horimetro:5530.9,horimetroData:'2026-11-02',combBase:{h:5530.9,data:'2026-11-02',pend:0},combUltData:'2026-11-02',status:'ativo',itens:[]}],
  ['equipamentos/EH-01',{codigo:'EH-01',tipo:'Escavadeira',alocacao:'DM1',area:'Planta',horimetro:9314,horimetroData:'2026-11-01',combBase:{h:9314,data:'2026-11-01',pend:0},combUltData:'2026-11-01',status:'ativo',itens:[]}],
  ['comb/2026-11/abast/a1',{equipId:'EH-06',data:'2026-11-15',horimetro:6800,litros:226}],
  ['comb/2026-11/abast/b1',{equipId:'CB-01',data:'2026-11-02',horimetro:5530.9,litros:48}],
  ['comb/2026-11/abast/c1',{equipId:'EH-01',data:'2026-11-01',horimetro:9314,litros:210}]]);
fs.writeFileSync('/tmp/i38.csv',['Data;TAG;Horimetro;Litros;Centro de custo','02/11/2026;CB-01;5530,9;48;Planta','02/11/2026;EH-01;9314;221;Planta','14/11/2026;EH-08;640;150;Planta','15/11/2026;EH-08;630;100;Planta','16/11/2026;EH-08;660;150;Planta','16/11/2026;TA-02;10;50;Planta','17/11/2026;EH-06;6810;200;Planta'].join('\n')+'\n');
let ok=0,fa=0;const R=(k,v,esp)=>{const b=esp===undefined||JSON.stringify(v)===JSON.stringify(esp);b?ok++:fa++;console.log((b?'ok ':'XX ')+k.padEnd(58),typeof v==='string'?v:JSON.stringify(v),b?'':' (esperado '+JSON.stringify(esp)+')')};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(600);
const imp=async f=>{await p.click('.cbx-mb');await W(200);const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles(f);await W(2200)};
await imp('/tmp/i38.csv');
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const lin=k=>p.evaluate(k=>{const el=[...document.querySelectorAll('.cpl-r[data-pr]')].find(x=>x.innerText.includes(k));if(!el)return'(sem)';return (el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-')+' | '+el.innerText.replace(/\s+/g,' ').trim()},k);
const bot=()=>p.evaluate(()=>document.querySelector('#lt-go').getAttribute('aria-label'));
let x=await lin('5.530,9');R('CB-01 igual ao lancado = cinza Ja lancado',x.startsWith('J')&&x.includes('Ja lancado no app'),true);console.log(x);
x=await lin('9.314');R('EH-01 mesmo h, litros diferentes = vermelho com comparacao',x.startsWith('V')&&x.includes('litros diferentes')&&x.includes('No app 01/11 · 9.314 h 210 L'),true);console.log(x);
x=await lin('630 h');R('EH-08 menor que anterior com faixa esperada',x.startsWith('V')&&x.includes('Anterior 14/11 · 640 h linha da planilha')&&x.includes('Esperado entre 640 e 660 h'),true);console.log(x);
x=await lin('TA-02');R('TA-02 PQ com texto novo',x.includes('esta em PQ no cadastro')&&x.includes('Abrir equipamento'),true);
R('resumo com ja lancados',await p.evaluate(()=>document.querySelector('.cpl-sm').innerText.replace(/\s+/g,' ')));
R('botao (so EH-08 640, 660 e EH-06)',await bot(),'Lancar 3 abastecimentos');
await p.screenshot({path:'/tmp/i38_1.png',fullPage:true});
// Corrigir horimetro abre com foco
await p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].find(x=>x.innerText.includes('630 h')).querySelector('[data-bt="c"]').click());await W(400);
R('Corrigir abre a linha com foco no horimetro',await p.evaluate(()=>document.activeElement&&document.activeElement.matches('.cpl-r.ab [data-ph]')),true);
await p.click('.cpl-r.ab [data-pok]');await W(400);
// Tirar EH-01 pelo botao
await p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].find(x=>x.innerText.includes('9.314')).querySelector('[data-bt="t"]').click());await W(800);
R('EH-01 tirado',(await lin('9.314')),'(sem)');
// Abrir equipamento e voltar
await p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].find(x=>x.innerText.includes('TA-02')).querySelector('[data-bt="e"]').click());await W(800);
R('abre a ficha',(await tt()).startsWith('TA-02'),true);await p.click('#sheet [data-back]');await W(1200);R('volta para a conferencia',await tt(),'Conferir planilha');
// Filtrar ja lancados
await p.click('[data-pf]');await W(400);await p.click('[data-fs]');await W(150);await p.click('[data-fv="ja"]');await W(150);R('contagem ja lancados',await p.evaluate(()=>document.querySelector('#cplf-n').innerText),'1 linha');
await p.click('#sheet .hd-pri');await W(800);R('so ja lancados',await p.evaluate(()=>document.querySelectorAll('.cpl-r[data-pr]').length),1);
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
