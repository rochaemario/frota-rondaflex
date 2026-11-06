const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const papel=process.argv[2]||'admin';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp},[seed,papel]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(800);
await p.screenshot({path:'pwa-login.png'});
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','errada');await p.click('#lg-b');await p.waitForTimeout(300);
console.log('erro:',await p.textContent('#lg-x'));
await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500);
console.log('login some:',!(await p.$('#lg')),'sync:',await p.textContent('#sync'));
console.log('equip count:',await p.evaluate(()=>document.querySelector('[data-acc="equip"]')?.textContent.replace(/\s+/g,' ').slice(0,60)));
console.log('fab visível:',await p.evaluate(()=>getComputedStyle(document.getElementById('fab')).display!=='none'&&!document.getElementById('fab').hidden));
await p.screenshot({path:'pwa-home.png'});
if(papel!=='consulta'){
 // salvar horímetro (rpc update)
 await p.evaluate(()=>document.getElementById('sidehm').click());await p.waitForTimeout(400);
 const before=await p.evaluate(()=>window.supabase&&0);
 await p.fill('.lr[data-id="PC-04"] .lr-in','455');await p.click('#lr-save');await p.waitForTimeout(800);
 console.log('toast:',await p.evaluate(()=>document.querySelector('.toast')?.textContent));
 console.log('PC-04 na tela:',await p.evaluate(()=>{document.getElementById('sidehm').click();return 1}));await p.waitForTimeout(400);
 console.log('PC-04 última:',await p.evaluate(()=>document.querySelector('.lr[data-id="PC-04"] .lr-p').textContent));
 await p.evaluate(()=>document.querySelector('#sheet [data-back]').click());await p.waitForTimeout(300);
 // estoque + movs query
 await p.evaluate(()=>document.querySelector('[data-acc="estoque"]').click());await p.waitForTimeout(300);await p.click('[data-estab="rel"]');await p.waitForTimeout(200);
 await p.evaluate(()=>document.querySelector('[data-mov="cat-273-5711"]').click());await p.waitForTimeout(800);
 console.log('movs:',await p.evaluate(()=>[...document.querySelectorAll('#sheet .r')].filter(r=>/Entrada|Saída|Preventiva/.test(r.textContent)).map(r=>r.textContent.trim().slice(0,40))));
 // backup
 await p.evaluate(()=>document.querySelector('header').click());await p.waitForTimeout(300);
}
// conta
await p.evaluate(()=>document.getElementById('sync').click());await p.waitForTimeout(200);
console.log('conta:',await p.evaluate(()=>document.getElementById('acct')?.innerText.replace(/\n/g,' | ')));
await p.screenshot({path:'pwa-acct-'+papel+'.png'});
console.log('blobUrl:',await p.evaluate(()=>window.__blobUrl('abc')));console.log('docUrl antigo:',await p.evaluate(()=>window.__docUrl('xyz')));console.log('docUrl privado:',await p.evaluate(async()=>{window.__privOk=1;return (await window.__docUrl('pqr')).slice(0,20)}));
console.log('ERR',errs);await b.close()})();
