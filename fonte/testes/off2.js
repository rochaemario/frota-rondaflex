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
// A) primeiro uso sem internet: sessão guardada mas sem dados locais
await p.goto('http://localhost/');await W(300);
await p.evaluate(()=>{localStorage.setItem('sb-x-auth-token',JSON.stringify({access_token:'a',user:{id:'u1',email:'mario@x.com'}}));localStorage.setItem('frota.perfil',JSON.stringify({user_id:'u1',email:'mario@x.com',nome:'Mario',papel:'admin'}));sessionStorage.setItem('OFF','1')});
await p.reload();await W(1500);console.log('A:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent));
// B) online, entra e baixa; depois offline com sessão só guardada
await p.evaluate(()=>{sessionStorage.removeItem('OFF')});await p.reload();await W(1500);console.log('B1:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent||'app'),await sync());
await p.evaluate(()=>sessionStorage.setItem('OFF','1'));await p.reload();await W(1500);console.log('B2 offline:',await p.evaluate(()=>document.querySelector('.lg-c h1')?.textContent||'app'),await sync());
// abastecimento offline + foto offline
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="comb"]');await W();await p.click('#sheet [data-m="abast"]');await W();
await p.fill('.eqs-in','pc04');await W();await p.click('[data-eo]');await W();await p.fill('#ab-hm','470');await p.fill('#ab-l','50');await p.click('button[form="fab-f"]');await W(1000);
const g=await p.$('#ab-g [data-go]');if(g){await g.click();await W(800)}
console.log('C abast:',await sync(),await p.evaluate(()=>document.querySelector('.toast')?.textContent));
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="est"]');await W();await p.click('#sheet [data-m="x:st"]');await W();await p.click('#sheet [data-m="ed-st"]');await W();await p.click('#sheet [data-pe]');await W();
await p.click('[data-pa]');await W();await p.screenshot({path:'pk.png'});const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-pk="gal"]')]);await fc.setFiles('foto-teste.jpg');await W(2500);
console.log('D foto:',await p.evaluate(()=>[...document.querySelectorAll('.ph-th img')].map(i=>i.src.slice(0,30)+' '+i.naturalWidth)));
await p.click('#sheet .sh-foot .btn.pri');await W(800);console.log('   ',await sync());
await p.evaluate(()=>{window.__ON=true;window.__FAIL=false;sessionStorage.removeItem('OFF');dispatchEvent(new Event('online'))});await W(3000);
console.log('E online:',await sync(),'| uploads:',await p.evaluate(()=>Object.keys(window.__upb||{}).length));
console.log('ERR',errs);await b.close()})();
