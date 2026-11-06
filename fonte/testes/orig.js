const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(700);
 const k=await pg.evaluate(()=>Object.keys(window.__store).find(k=>window.__store[k].codigo==='MT-01'));
 const eq=()=>pg.evaluate(k=>{const e=window.__store[k];return {hm:e.horimetro,its:e.itens.slice(0,3).map(i=>[i.ultimaH,i.proxH])}},k);
 // troca 3686 -> 5000 (relógio usado)
 await pg.click('#fab');await W();await pg.click('[data-m="novo"]');await W();await pg.click('[data-m="thm"]');await W();await pg.selectOption('#thm-eq','MT-01');await W();await pg.fill('#thm-b','5000');await W();
 await pg.click('#sheet button[form="fthm"]');await W();await pg.click('#thm-conf [data-yes]');await W();await pg.click('#thm-conf [data-yes]');await W(800);
 console.log('após troca',JSON.stringify(await eq()));
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('.pn-r .ia-h');await W();await pg.click('[data-pend]');await W();
 await pg.evaluate(()=>{document.querySelectorAll('#sheet [data-ia]').forEach((b,i)=>{if(i<1)b.click()})});await W();await pg.screenshot({path:'o1.png'});
 console.log('fatos',await pg.evaluate(()=>document.querySelector('#sheet .facts').innerText.replace(/\s+/g,' ')));
 // editor do plano: abrir e salvar sem mudar
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="editar"]');await W();await pg.click('[data-m="ed-eq"]');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet button')].find(x=>/MT-01/.test(x.textContent));b.click()});await W();
 console.log('editor ultimaH',await pg.evaluate(()=>[...document.querySelectorAll('[data-p="ultimaH"]')].slice(0,3).map(i=>i.value+'/'+i.dataset.dl)));
 await pg.click('#sheet .sh-foot .btn.pri');await W(700);console.log('após salvar editor',JSON.stringify(await eq()));
 console.log('ERR',errs);await b.close()})();
