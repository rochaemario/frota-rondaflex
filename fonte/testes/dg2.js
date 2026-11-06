const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const cdp=await ctx.newCDPSession(p);await cdp.send('WebAuthn.enable');const {authenticatorId}=await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;if(sessionStorage.getItem('L'))window.__LOGGED=1},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://localhost/');await p.waitForTimeout(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500);
await p.evaluate(()=>document.getElementById('sync').click());await p.waitForTimeout(400);
console.log('toggle visível',await p.evaluate(()=>!document.getElementById('ac-dg').hidden));
await p.click('#ac-dg .sw');await p.waitForTimeout(800);await p.screenshot({path:'dgt1.png'});
console.log('ligado',await p.getAttribute('#ac-dg .sw','aria-checked'),await p.evaluate(()=>localStorage.getItem('frota.dg')));
await p.evaluate(()=>sessionStorage.setItem('L','1'));await p.reload();await p.waitForTimeout(1500);
console.log('após abrir: lock?',!!(await p.$('.lk')),'app pronto?',await p.evaluate(()=>!document.getElementById('lg')));
await p.screenshot({path:'dgt2.png'});
// recusa
await cdp.send('WebAuthn.setUserVerified',{authenticatorId,isUserVerified:false});
await p.evaluate(()=>sessionStorage.setItem('L','1'));await p.reload();await p.waitForTimeout(1500);console.log('recusa: lock?',!!(await p.$('.lk')),'msg',await p.evaluate(()=>document.getElementById('lk-x')?.textContent));await p.screenshot({path:'dgt3.png'});
await cdp.send('WebAuthn.setUserVerified',{authenticatorId,isUserVerified:true});await p.click('#lk-b');await p.waitForTimeout(1200);
console.log('desbloqueou?',await p.evaluate(()=>!document.getElementById('lg')));
console.log('ERR',errs);await b.close()})();
