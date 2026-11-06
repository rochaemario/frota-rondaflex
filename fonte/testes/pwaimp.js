const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__SEED={};window.__PAPEL='admin';window.__LOGGED=true});
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(1200);
console.log('equip antes:',await p.evaluate(()=>document.querySelectorAll('[data-acc]').length));
await p.evaluate(()=>document.getElementById('sync').click());await p.waitForTimeout(200);await p.click('#ac-imp');await p.waitForTimeout(200);
await p.setInputFiles('#imp-f',process.argv[2]);await p.waitForTimeout(2500);
console.log('msg:',await p.textContent('#imp-x'),'uploads:',await p.evaluate(()=>window.__up));
await p.click('#imp-ok');await p.waitForTimeout(800);
console.log('painel:',await p.evaluate(()=>document.querySelector('[data-acc="equip"]')?.closest('.card,section')?.textContent.replace(/\s+/g,' ').slice(0,80)));
await p.evaluate(()=>document.querySelector('[data-acc="equip"]').click());await p.waitForTimeout(400);
console.log('linhas equip:',await p.evaluate(()=>document.querySelectorAll('[data-eq]').length));
console.log('ERR',errs);await b.close()})();
