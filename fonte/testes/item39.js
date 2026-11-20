// Item 39 (planilha so pelo Importar planilha do Abastecer; nao lancados; limpeza unica) sobre o item 37: Importar planilha abre "Conferir planilha" com todos os dias e lanca de uma vez.
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
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1;if(!sessionStorage.getItem('ini')){sessionStorage.setItem('ini',1);localStorage.setItem('cbx.r:c01:2026-11-15',JSON.stringify({'EH-06':{h:'6800',l:'226',c:'planta'}}));localStorage.setItem('cbx.r:c01:2026-11-16',JSON.stringify({'EH-08':{h:'700',l:'99',c:'planta'}}))}},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);await p.click('#cbx-ab');await W(600);
const tt=()=>p.evaluate(()=>document.querySelector('#sheet h2')?.innerText);
const linhas=()=>p.evaluate(()=>[...document.querySelectorAll('.cpl-r[data-pr]')].map(el=>{const c=el.classList.contains('ja')?'J':el.classList.contains('er')?'V':el.classList.contains('av')?'A':'-';return c+' '+el.querySelector('b').innerText+' '+(el.querySelector('.h')?.innerText||'')+' '+(el.querySelector('.l')?.innerText||'')}));
const menu=async()=>{await p.click('.cbx-mb');await W(200);const t=await p.evaluate(()=>document.querySelector('.cbx-pop [data-cm="0"]').innerText.replace(/\s+/g,' '));return t};
await W(800);
R('limpeza: so o rascunho manual diferente fica',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('r:c01:')).sort()),['cbx.r:c01:2026-11-16']);
R('faixa da tela Abastecer',await p.evaluate(()=>document.querySelector('#cbx-pd').innerText.replace(/\s+/g,' ')));
R('sem linha de planilha',await p.evaluate(()=>!document.querySelector('[data-ppl]')),true);
R('menu sem planilha',await menu(),'Importar planilha');
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles('/tmp/i37.csv');await W(2200);
R('tela',await tt(),'Conferir planilha');
// tira TA-02 e lanca
await p.click('.cpl-r[data-pr]:has-text("TA-02")');await W(300);await p.click('.cpl-r.ab [data-pt]');await W(700);
await p.click('#lt-go');await W(4000);
R('volta para Abastecer',await tt(),'Abastecer');
R('menu com nao lancados',await menu(),'Importar planilha 3 nao lancados');
await p.click('.cbx-pop [data-cm="0"]');await W(1500);
R('abre Nao lancados',await tt(),'Nao lancados');
R('linhas',await linhas(),['V EH-08 630 h 100 L']);
R('TA-02 em tiradas e XYZ-9 em TAG nao encontrada',await p.evaluate(()=>[...document.querySelectorAll('.cpl-r.ti b')].map(b=>b.innerText).sort()),['TA-02','XYZ-9']);
await p.screenshot({path:'/tmp/i39_nl.png',fullPage:true});
// excluir a vermelha com confirmacao
await p.click('.cpl-r[data-pr] [data-bt="x"]');await W(300);R('pede confirmacao',await p.evaluate(()=>document.querySelector('.cpl-dc .confirm')?.innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'/tmp/i39_conf.png'});
await p.click('.cpl-dc [data-yes]');await W(900);R('vermelha excluida',(await linhas()).length,0);
// excluir XYZ-9
await p.click('[data-fx="0"]');await W(300);await p.click('.cpl-dc [data-yes]');await W(700);
R('so TA-02 sobrou',await p.evaluate(()=>[...document.querySelectorAll('.cpl-r.ti b')].map(b=>b.innerText)),['TA-02']);
// Excluir todos
await p.click('#sheet .cbx-mb');await W(200);await p.click('.cbx-pop [data-cm="0"]');await W(300);await p.click('#cpl-ask [data-yes]');await W(1200);
R('Excluir todos volta para Abastecer',await tt(),'Abastecer');R('menu limpo',await menu(),'Importar planilha');
R('sem planilha guardada',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('pl:')).length),0);
const [fc2]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);R('sem sobra abre a escolha do arquivo',!!fc2,true);
R('limpeza nao repete (rascunho manual continua)',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('r:c01:')).length),1);
R('erros',errs,[]);console.log(`\n${ok} ok, ${fa} falhas`);await b.close()})();
