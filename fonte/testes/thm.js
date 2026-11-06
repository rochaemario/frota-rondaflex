const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark']){const pg=await (await b.newContext({viewport:{width:390,height:844},colorScheme:sc})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(700);
 const eq=()=>pg.evaluate(()=>{const e=Object.values(window.__store).find(x=>x.codigo==='MT-01');return {hm:e.horimetro,its:e.itens.slice(0,3).map(i=>[i.desc,i.ultimaH,i.proxH])}});
 console.log(sc,'antes',JSON.stringify(await eq()));
 await pg.click('#sidehm');await W();
 await pg.evaluate(()=>{const r=document.querySelector('.lr[data-id="MT-01"] .lr-in');r.value='12';r.dispatchEvent(new Event('input'));r.closest('.lr').scrollIntoView({block:'center'})});await W();await pg.screenshot({path:`thm-${sc}-1.png`});
 await pg.click('.lr[data-id="MT-01"] [data-thm]');await W(400);await pg.screenshot({path:`thm-${sc}-2.png`});
 await pg.click('#sheet button[form="fthm"]');await W(400);await pg.screenshot({path:`thm-${sc}-3.png`});
 await pg.click('#thm-conf [data-yes]');await W(300);await pg.screenshot({path:`thm-${sc}-3b.png`});await pg.click('#thm-conf [data-yes]');await W(800);await pg.screenshot({path:`thm-${sc}-4.png`});
 console.log(sc,'depois',JSON.stringify(await eq()));
 if(sc==='light'){await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('[data-acc="manut"]');await W();await pg.click('[data-hist="MT-01"]');await W();await pg.screenshot({path:'thm-5.png'});
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet [data-tr]')].find(x=>/horímetro/.test(x.textContent));b&&b.click()});await W();await pg.screenshot({path:'thm-6.png'});
  await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="excluir"]');await W();await pg.click('[data-m="dl-tr"]');await W();
  console.log('no Excluir aparece?',await pg.evaluate(()=>[...document.querySelectorAll('#pd-l [data-pd]')].some(x=>/horímetro/.test(x.textContent))));
  await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="novo"]');await W();await pg.screenshot({path:'thm-7.png'});await pg.click('[data-m="thm-x"]');await W();
  await pg.click('#sheet [data-ia]');await W();await pg.click('[data-ux]');await W();await pg.screenshot({path:'thm-8.png'});await pg.click('[data-uxc] [data-yes]');await W();await pg.screenshot({path:'thm-9.png'});await pg.click('[data-uxc] [data-yes]');await W(800);
  console.log('após desfazer',JSON.stringify(await eq()))}
 console.log('ERR',errs)}
await b.close()})();
