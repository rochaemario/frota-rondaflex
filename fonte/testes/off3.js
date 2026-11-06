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
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1500);console.log('1:',await sync());
// reabre sem internet e sem sessão nenhuma guardada
await p.evaluate(()=>sessionStorage.setItem('OFF','1'));await p.reload();await W(1500);
console.log('2 offline sem sessão:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent||'app aberto'),await sync());
await p.evaluate(()=>document.getElementById('sidehm').click());await W();await p.fill('.lr[data-id="PC-04"] .lr-in','470');await p.click('#lr-save');await W(800);console.log('3:',await sync());
await p.evaluate(()=>document.querySelector('#sheet [data-back]')?.click());await W();
await p.evaluate(()=>{window.__ON=true;window.__FAIL=false;sessionStorage.removeItem('OFF');dispatchEvent(new Event('online'))});await W(1200);
console.log('4 online:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent||'sem login'),await p.evaluate(()=>document.querySelector('#lg-x')?.textContent));
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(2500);
console.log('5 depois do login:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent||'app'),await sync(),await p.evaluate(()=>JSON.stringify(window.__calls.filter(c=>c[0]==='rpc'))));
console.log('ERR',errs);await b.close()})();
