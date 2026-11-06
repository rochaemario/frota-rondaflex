const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;if(sessionStorage.getItem('L'))window.__LOGGED=1;
  window.__ON=sessionStorage.getItem('OFF')?false:true;Object.defineProperty(Navigator.prototype,'onLine',{get:()=>window.__ON,configurable:true});if(!window.__ON)window.__FAIL=true},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
const W=ms=>p.waitForTimeout(ms||400);const sync=()=>p.textContent('#sync');
await p.goto('http://localhost/');await W(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1500);
console.log('1 online:',await sync());
// fica sem internet
await p.evaluate(()=>{window.__ON=false;window.__FAIL=true;dispatchEvent(new Event('offline'))});await W();
console.log('2 offline:',await sync());
await p.evaluate(()=>document.getElementById('sidehm').click());await W();
await p.fill('.lr[data-id="PC-04"] .lr-in','460');await p.click('#lr-save');await W(800);
console.log('3 após lançar:',await sync(),'|',await p.evaluate(()=>document.querySelector('.toast')?.textContent));
// reabre o app sem internet
await p.evaluate(()=>{sessionStorage.setItem('L','1');sessionStorage.setItem('OFF','1')});await p.reload();await W(2000);
console.log('4 reaberto offline:',await sync(),'| login?',!!(await p.$('#lg')));
await p.evaluate(()=>document.getElementById('sidehm').click());await W();
console.log('   PC-04:',await p.evaluate(()=>document.querySelector('.lr[data-id="PC-04"] .lr-p')?.textContent));
await p.screenshot({path:'off1.png'});
await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await W();
// volta a internet
const n0=await p.evaluate(()=>window.__calls.length);
await p.evaluate(()=>{window.__ON=true;window.__FAIL=false;sessionStorage.removeItem('OFF');dispatchEvent(new Event('online'))});await W(2500);
console.log('5 online de novo:',await sync(),'| envios:',await p.evaluate(n=>JSON.stringify(window.__calls.slice(n).filter(c=>c[1]!=='select')),n0));
await p.evaluate(()=>document.getElementById('sidehm').click());await W();console.log('6 PC-04 depois:',await p.evaluate(()=>document.querySelector('.lr[data-id="PC-04"] .lr-p')?.textContent));console.log('ERR',errs);await b.close()})();
