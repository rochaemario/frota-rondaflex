const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||400);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc04');await W();await p.click('[data-eo]');await W();await p.fill('#t-hm','470');await p.click('[data-iv="250"]');await p.fill('#t-resp','Zé');
await p.evaluate(()=>document.querySelector('.t-add').scrollIntoView({block:'center'}));await W();await p.screenshot({path:'cad0.png'});await p.fill('#t-q','3223155');await W();await p.screenshot({path:'cad1.png'});
await p.click('#t-cad');await W();console.log(await p.textContent('#sheet h2'),await p.inputValue('#s-ref'));
await p.fill('#s-desc','Filtro teste');await p.click('#sheet .sh-foot .btn.pri');await W(1500);
console.log(await p.textContent('#sheet h2'),'|',await p.inputValue('.eqs-in'),'|',await p.inputValue('#t-hm'),await p.inputValue('#t-resp'),await p.getAttribute('[data-iv="250"]','aria-pressed'));
console.log('extras',await p.$$eval('#t-extra .chk b',l=>l.map(x=>x.textContent)));
await p.screenshot({path:'cad2.png'});
// keyboard simulation
await p.setViewportSize({width:390,height:500});await W();console.log('kb',await p.evaluate(()=>document.body.classList.contains('kb')),await p.evaluate(()=>getComputedStyle(document.querySelector('.sh-foot')).display));
await p.setViewportSize({width:390,height:844});await W();console.log('kb',await p.evaluate(()=>document.body.classList.contains('kb')));
console.log('ERR',errs);await b.close()})();
