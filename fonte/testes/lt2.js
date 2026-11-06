const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='frota.test'){const f='/home/claude/pwa/dist/'+(u.pathname.slice(1)||'index.html');return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'}):r.fulfill({status:404})}return r.abort()});
await p.goto('http://frota.test/leitor.html');await p.waitForTimeout(800);await p.click('#abrir');await p.waitForTimeout(3500);
await p.screenshot({path:'lt2.png'});console.log(await p.textContent('#dg'));console.log('ERR',errs);await b.close()})();
