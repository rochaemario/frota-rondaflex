const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||500);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();await p.screenshot({path:'s1.png'});
console.log(await p.$$eval('[data-eqt]',l=>l.map(x=>x.dataset.eqt).join(' | ')));
// abre uma categoria la embaixo
const hs=await p.$$('[data-eqt]');await hs[9].click();await W(900);await p.screenshot({path:'s2.png'});
await hs[0].click();await W(900);await p.screenshot({path:'s2b.png'});
await p.click('.tsec-l:not([hidden]) [data-eq]');await W(800);
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();
// MT-01
await p.evaluate(()=>{});const mt=await p.$('[data-eqt="Manipulador telescópico"],[data-eqt="Manipulador telescopico"]');await mt.click();await W(900);await p.click('[data-eq="MT-01"]');await W(900);
await p.evaluate(()=>{const r=[...document.querySelectorAll('#sheet .r')].find(x=>/Situacao/.test(x.textContent));r&&r.scrollIntoView({block:'start'})});await W();await p.screenshot({path:'s3.png'});
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();await p.click('[data-a="up"]');await W();await p.click('[data-a="up"]');await W();
await p.click('[data-acc="estoque"]');await W();await p.click('#es-rel');await W();await p.screenshot({path:'s4.png'});
console.log('ERR',errs);await b.close()})();
