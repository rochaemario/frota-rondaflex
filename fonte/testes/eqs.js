const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||400);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','cb1');await W();await p.screenshot({path:'eqs1.png'});
await p.click('[data-eo]');await W();await p.screenshot({path:'eqs2.png'});
console.log(await p.inputValue('.eqs-in'),'| itens:',await p.$$eval('#t-items .chk',l=>l.length),'hm',await p.inputValue('#t-hm'));
await p.fill('.eqs-in','carreg');await W();console.log(await p.$$eval('[data-eo]',l=>l.map(x=>x.textContent)));
await p.fill('.eqs-in','xx');await W();await p.click('button[form="ft"]');await W();console.log('validity',await p.evaluate(()=>document.querySelector('.eqs-in').validationMessage));
// abast
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();
await p.click('#sheet [data-m="comb"]');await W();await p.click('#sheet [data-m="abast"]');await W();await p.fill('.eqs-in','pc');await W();await p.click('[data-eo]');await W();await p.screenshot({path:'eqs3.png'});
console.log('ERR',errs);await b.close()})();
