const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const papel=process.argv[2]||'admin';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;if(sessionStorage.getItem('L'))window.__LOGGED=1},[seed,papel]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
const W=ms=>p.waitForTimeout(ms||500);
await p.goto('http://frota.test/');await W(800);await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1800);
await p.click('[data-acc="estoque"]');await W();await p.click('[data-estab="rel"]');await W();await p.evaluate(()=>{const s=document.getElementById('scroller')||document.scrollingElement;s.scrollTop=400});await W(200);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.evaluate(()=>{sessionStorage.setItem('L','1');localStorage.setItem('sb-x-auth-token',JSON.stringify({access_token:'a',user:{id:window.__frotaEu.uid,email:'mario@x.com'}}))});
await p.reload();await W(2500);
console.log('tela principal:',await p.evaluate(()=>[!!document.querySelector('[data-estab="rel"][aria-pressed="true"]'),(document.getElementById('scroller')||document.scrollingElement).scrollTop]));
// mais de 30 min
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));const e=JSON.parse(localStorage.getItem('frota.estado'));e.t-=31*60000;localStorage.setItem('frota.estado',JSON.stringify(e))});
await p.reload();await W(2500);console.log('depois de 31 min, relatorio aberto?',await p.evaluate(()=>!!document.querySelector('[data-estab="rel"][aria-pressed="true"]')));
console.log('ERR',errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close()})();
