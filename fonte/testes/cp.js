const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(700);await pg.click('[data-acc="equip"]');await W();await pg.click('[data-eq="CB-06"]');await W(400);
 await pg.evaluate(()=>document.querySelector('[data-copy]').scrollIntoView({block:'center'}));await W();
 const bs=await pg.$$('[data-copy]');await bs[1].click();await W(200);await pg.screenshot({path:'cp.png'});
 console.log('toast',await pg.$eval('.toast',e=>e.textContent).catch(()=>'-'),'ERR',errs);await b.close()})();
