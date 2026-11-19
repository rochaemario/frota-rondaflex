// Itens 35 (repetido por mesmos litros no mesmo dia, conferencia do lote) e 36 (Importar dados sem abastecimentos).
// Uso: node item35_36.js (le /home/claude/pwa/dist, gerado pelo build.py)
const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm)=>['equipamentos/'+id,{codigo:id,tipo:'Escavadeira',alocacao:'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:'2026-11-01',status:'ativo',itens:[]}];
const ab=(id,x)=>['comb/2026-11/abast/'+id,x];
const seed=Object.fromEntries([eq('EH-06',6700),eq('CB-01',5000),eq('EH-08',600),
  ab('a1',{equipId:'EH-06',data:'2026-11-15',horimetro:6800,litros:226}),
  ab('a2',{equipId:'CB-01',data:'2026-11-15',horimetro:'',litros:150}),
  ab('a3',{equipId:'EH-06',data:'2026-11-10',horimetro:6750,litros:226})]);
fs.writeFileSync('/tmp/i35.csv','Data;TAG;Horimetro;Litros;Centro de custo\n15/11/2026;EH-06;6820;226;Planta\n15/11/2026;EH-08;650;226;Planta\n');
fs.writeFileSync('/tmp/i36_ab.json',JSON.stringify({abast:[{equip:'EH-06',data:'2026-11-16',horimetro:6900,litros:200}]}));
fs.writeFileSync('/tmp/i36_it.json',JSON.stringify({itens:[{ref:'ZZ-1',desc:'Filtro teste',marca:'X',tipo:'filtro'}]}));
const R=(k,v)=>console.log(k.padEnd(60),typeof v==='string'?v:JSON.stringify(v));
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__LOGGED=1},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1500);
const W=ms=>p.waitForTimeout(ms||300);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="comb"]');await W();await p.click('[data-cbx="cb"]');await W(500);
await p.click('#cbx-ab');await W(600);
const setDt=async d=>{await p.fill('#cbx-dt',d);await p.dispatchEvent('#cbx-dt','change');await W(400);if(await p.$('#cbx-ask [data-g]')){await p.click('#cbx-ask [data-g]')}await W(900)};
const msg=id=>p.evaluate(id=>{const el=document.querySelector(`[data-r="${id}"]`);return el?el.innerText.replace(/\s+/g,' ').trim():'(sem linha)'},id);
const fill=async(id,h,l)=>{await p.fill(`[data-r="${id}"] [data-h]`,String(h));await p.fill(`[data-r="${id}"] [data-l]`,String(l));await W(800)};
const tem=(t,s)=>t.includes(s);
await setDt('2026-11-15');
await fill('EH-06',6810,226);let t=await msg('EH-06');R('35 EH-06 15/11 226 L (ja lancado 226 L no dia)',tem(t,'Ja existe abastecimento igual (226 L em 15/11)')?'AMARELO litros':t);
await p.evaluate(()=>document.querySelector('[data-r="EH-06"]').scrollIntoView({block:'center'}));await p.screenshot({path:'/tmp/i35_litros.png'});
await fill('EH-06',6810,227);t=await msg('EH-06');R('35 EH-06 15/11 227 L',tem(t,'Ja existe')?'AVISO: '+t:'nada');
await fill('EH-06',6800,226);t=await msg('EH-06');R('35 EH-06 15/11 horimetro 6800 + 226 L (os dois)',(t.match(/Ja existe abastecimento igual/g)||[]).length+' aviso(s): '+(tem(t,'horimetro 6.800')?'o de horimetro':t));
await fill('EH-06',6800,200);t=await msg('EH-06');R('35 EH-06 15/11 horimetro 6800 (outro litro)',tem(t,'horimetro 6.800')?'AMARELO horimetro':t);
await fill('CB-01',5100,150);t=await msg('CB-01');R('35 CB-01 15/11 150 L (lancado sem horimetro)',tem(t,'(150 L em 15/11)')?'AMARELO litros':t);
await fill('EH-08',650,226);t=await msg('EH-08');R('35 EH-08 15/11 226 L (outra TAG)',tem(t,'Ja existe')?'AVISO: '+t:'nada');
await setDt('2026-11-16');await fill('EH-06',6850,226);t=await msg('EH-06');R('35 EH-06 16/11 226 L (outro dia)',tem(t,'Ja existe')?'AVISO: '+t:'nada');
await setDt('2026-11-15');t=await msg('EH-06');R('35 volta para 15/11 (rascunho 6800 h / 200 L)',tem(t,'horimetro 6.800')?'AMARELO horimetro':t.slice(0,90));R('35 data do lote',await p.inputValue('#cbx-dt'));
// Importar planilha
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.includes('r:'))localStorage.removeItem(k)});
await p.click('.cbx-mb');await W(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('.cbx-pop [data-cm="0"]')]);await fc.setFiles('/tmp/i35.csv');await W(1800);
R('35 importar: data do lote',await p.inputValue('#cbx-dt'));
t=await msg('EH-06');R('35 importar EH-06 15/11 6820 226 L',tem(t,'(226 L em 15/11)')?'AMARELO litros':t);
t=await msg('EH-08');R('35 importar EH-08 15/11 226 L',tem(t,'Ja existe')?'AVISO: '+t:'nada');
await p.evaluate(()=>document.querySelector('[data-r="EH-06"]').scrollIntoView({block:'center'}));await p.screenshot({path:'/tmp/i35_importar.png'});
// item 36: Importar dados
const nAb=()=>p.evaluate(async()=>{const r=await window.supabase&&null;return document.title});
await p.goto('http://frota.test/');await W(1500);
const abrirImp=async()=>{await p.click('#sync');await W(300);await p.click('#ac-imp');await W(400)};
await abrirImp();
const [f1]=await Promise.all([p.waitForEvent('filechooser'),p.click('label:has(#imp-f)')]);await f1.setFiles('/tmp/i36_ab.json');await W(900);
R('36 importar dados com abastecimentos',await p.evaluate(()=>document.querySelector('#imp-x')?.textContent||'(tela fechou)'));
R('36 tela lote nao abriu',await p.evaluate(()=>!document.body.innerText.includes('Folha de')));
await p.screenshot({path:'/tmp/i36_msg.png'});
const [f2]=await Promise.all([p.waitForEvent('filechooser'),p.click('label:has(#imp-f)')]);await f2.setFiles('/tmp/i36_it.json');await W(1200);
R('36 importar dados com itens do estoque',await p.evaluate(()=>document.body.innerText.includes('Itens para cadastrar')?'abre Itens para cadastrar':'NAO abriu'));
R('36 __frotaLote existe',await p.evaluate(()=>typeof window.__frotaLote));
R('erros',errs);await b.close()})();
