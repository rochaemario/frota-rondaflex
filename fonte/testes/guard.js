const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
// cenário do exercício: PC-02 troca de relógio em 2026-10-20: 2435 -> 50
const k=Object.keys(seed).find(k=>k.startsWith('equipamentos/')&&seed[k].codigo==='PC-02');const E=seed[k];const d=50-2435;
E.horimetro=50;E.horimetroData='2026-10-20';E.itens=E.itens.map(i=>({...i,ultimaH:i.ultimaH===''||i.ultimaH==null?i.ultimaH:i.ultimaH+d,proxH:i.proxH===''||i.proxH==null?i.proxH:i.proxH+d}));
seed['trocas/hm1']={tipo:'hmtroca',ts:Date.now(),equipId:k.split('/')[1],data:'2026-10-20',horimetro:50,antigo:2435,delta:d,itens:[]};
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(700);
 const eq=()=>pg.evaluate(k=>{const e=window.__store[k];return {hm:e.horimetro,its:e.itens.map(i=>[i.desc.slice(0,14),i.ultimaH,i.proxH])}},k);
 const openPrev=async()=>{await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('[data-acc="manut"]');await W();await pg.click('[data-a="new-tr"]');await W();await pg.click('[data-rg="prev"]');await W();await pg.selectOption('#t-eq','PC-02');await W()};
 // 1) preventiva hoje com 30 h (< 50) -> bloqueia
 await openPrev();await pg.fill('#t-hm','30');await pg.evaluate(()=>{document.querySelectorAll('#t-items input[type=checkbox]').forEach(c=>{if(!c.checked)c.click()})});
 await pg.click('#sheet button[form="ft"]');await W(500);await pg.screenshot({path:'g1.png'});console.log('1 bloqueio:',await pg.evaluate(()=>!!document.querySelector('#t-eqv .eqv-ask')&&document.querySelector('#t-eqv').innerText.slice(0,40)));
 // 2) preventiva retroativa 15/10 com 2400 (relógio antigo) -> pede conversão -> 2400-2385 = 15
 await pg.fill('#t-dt','2026-10-15');await pg.fill('#t-hm','2400');await pg.click('#sheet button[form="ft"]');await W(500);await pg.screenshot({path:'g2.png'});
 console.log('2 pede conversão:',await pg.evaluate(()=>document.querySelector('#t-eqv').innerText.replace(/\s+/g,' ').slice(0,200)));
 await pg.click('#t-eqv [data-go]');await W(600);
 for(let i=0;i<3;i++){const sk=await pg.$('#t-eqv [data-skip]');if(sk){await sk.click();await W(600)}const eg=await pg.$$('#t-eqv [data-eq="eq"]');if(eg.length){for(const x of eg)await x.click();await pg.click('#t-eqv [data-go]');await W(600)}}
 console.log('2 depois',JSON.stringify(await eq()));
 console.log('2 registro',await pg.evaluate(()=>JSON.stringify(Object.values(window.__store).filter(t=>t.data==='2026-10-15'&&t.horimetro===2400).map(t=>[t.horimetro,t.hmConv,t.proximaH]))));
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('[data-acc="manut"]');await W();await pg.click('[data-hist="PC-02"]');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet [data-tr]')].find(x=>/15\/10/.test(x.textContent));b&&b.click()});await W();await pg.screenshot({path:'g5.png'});
 await pg.click('#t-card');await W(1500);await pg.screenshot({path:'g6.png'});
 await pg.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();await pg.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet [data-tr]')].find(x=>!/15\/10|horímetro/.test(x.textContent));b&&b.click()});await W();await pg.screenshot({path:'g7.png'});await pg.click('#t-card');await W(1500);await pg.screenshot({path:'g8.png'});
 // 3) leituras com data anterior à troca
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#sidehm');await W();
 await pg.fill('#lr-dt','2026-10-19');await W();await pg.evaluate(()=>{const r=document.querySelector('.lr[data-id="PC-02"] .lr-in');r.value='2440';r.dispatchEvent(new Event('input'))});await W();
 console.log('3 aviso',await pg.evaluate(()=>document.querySelector('.lr[data-id="PC-02"] .lr-w').textContent));
 await pg.click('#lr-save');await W(700);console.log('3 salvo',JSON.stringify((await eq()).hm));
 // 4) editar equipamento com horímetro menor
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="editar"]');await W();await pg.click('[data-m="ed-eq"]');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet [data-pd],#sheet [data-pe],#sheet button')].find(x=>/PC-02/.test(x.textContent));b.click()});await W();
 await pg.fill('#e-horimetro','20');await pg.click('#sheet .sh-foot .btn.pri');await W(500);console.log('4 bloqueio',await pg.evaluate(()=>{const b=document.querySelector('#e-hmg');return b?b.innerText.slice(0,30):'nada'}),JSON.stringify((await eq()).hm));
 await pg.evaluate(()=>document.querySelector('#e-hmg').scrollIntoView({block:'center'}));await pg.screenshot({path:'g4.png'});
 console.log('ERR',errs);await b.close()})();
