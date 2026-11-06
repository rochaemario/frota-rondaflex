const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'');if(!f||f.endsWith('/'))f+='index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':'application/octet-stream'});return r.fulfill({status:404,body:''})}
  return r.abort()});
await p.goto('http://frota.test/teste/');await p.waitForTimeout(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500);
console.log('teste vazio? equip:',await p.evaluate(()=>document.querySelector('[data-acc="equip"]')?.textContent.replace(/\s+/g,' ').slice(0,60)),'barra:',await p.evaluate(()=>document.querySelector('.os-tb')?.innerText));
await p.screenshot({path:'pwat1.png'});
await p.click('[data-tb="cop"]');await p.waitForTimeout(300);await p.click('#cp-ok');await p.waitForTimeout(2500);
console.log('apos copia equip:',await p.evaluate(()=>document.querySelector('[data-acc="equip"]')?.textContent.replace(/\s+/g,' ').slice(0,60)),await p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).pop()));
const rows=await p.evaluate(()=>window.__mockRows?window.__mockRows('docs').map(r=>r.path).slice(0,5):null);console.log('rows',rows);
await p.screenshot({path:'pwat2.png'});
console.log('ERR',errs);await b.close()})();
