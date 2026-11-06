const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://localhost/');await p.waitForTimeout(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500);
await p.evaluate(()=>document.getElementById('sync').click());await p.waitForTimeout(300);await p.click('#ac-imp');await p.waitForTimeout(300);
await p.setInputFiles('#imp-f','/tmp/claude-0/-home-claude/dbad109e-5d58-56dd-bea8-514c5cf703f7/scratchpad/abastecimentos-22-23-out.json');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>document.querySelector('#sheet h2')?.textContent+' | '+document.querySelector('#sheet .sh-sub, #sheet h2 + *')?.textContent));
await p.screenshot({path:'lt1.png',fullPage:false});
await p.evaluate(()=>document.querySelector('.lt-r.fo').scrollIntoView());await p.waitForTimeout(200);await p.screenshot({path:'lt2.png'});
console.log(await p.textContent('#lt-go'));await p.click('[data-lt="1"]');console.log(await p.textContent('#lt-go'));await p.click('[data-lt="1"]');await p.click('#lt-go');await p.waitForTimeout(2500);console.log(await p.evaluate(()=>document.querySelector('.toast')?.textContent));
console.log('ERR',errs);await b.close()})();
