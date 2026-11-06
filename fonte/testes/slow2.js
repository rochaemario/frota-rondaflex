const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;if(sessionStorage.getItem('L'))window.__LOGGED=1;
  window.__ON=sessionStorage.getItem('OFF')?false:true;Object.defineProperty(Navigator.prototype,'onLine',{get:()=>window.__ON,configurable:true});if(!window.__ON)window.__FAIL=true;if(sessionStorage.getItem('SLOW'))window.__SLOW=6000},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
const W=ms=>p.waitForTimeout(ms||400);
await p.goto('http://localhost/');await W(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1500);
await p.evaluate(()=>{sessionStorage.setItem('L','1');sessionStorage.setItem('SLOW','1');localStorage.setItem('sb-x-auth-token',JSON.stringify({access_token:'a',user:{id:window.__frotaEu.uid,email:'mario@x.com'}}))});
const t0=Date.now();await p.reload();await p.waitForFunction(()=>{const a=document.getElementById('app');return (a&&a.innerHTML.length>2000)||document.getElementById('lg')},null,{timeout:20000,polling:50});
console.log('reaberto com rede lenta (6 s por consulta): app visivel em',Date.now()-t0,'ms | login?',!!(await p.$('#lg')),'| sync:',await p.textContent('#sync'));
await W(9000);console.log('depois:',await p.textContent('#sync'),'consultas',await p.evaluate(()=>window.__calls.length));
console.log('ERR',errs);await b.close()})();
