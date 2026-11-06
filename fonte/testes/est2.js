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
await p.click('#fab');await W();for(const t of ['Estoque','Filtros e oleos','Editar']){await p.click('.mi:has-text("'+t+'")');await W(600)}
await p.fill('#pe-q','526-3121');await W();await p.click('[data-pe]');await W(800);
await p.fill('#s-desc','DESCRICAO EM EDICAO');await p.fill('#s-local','Prateleira 9');await p.evaluate(()=>document.querySelector('#sheet .sh-body').scrollTop=300);
console.log('antes:',await p.evaluate(()=>[document.querySelector('#sheet h2').textContent,NAV_KEYS=1]));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
console.log('errs',errs.filter(e=>!/ERR_FAILED/.test(e)));console.log('guardado nav:',JSON.parse(await p.evaluate(()=>localStorage.getItem('frota.estado'))).nav);
await p.evaluate(()=>{sessionStorage.setItem('L','1');localStorage.setItem('sb-x-auth-token',JSON.stringify({access_token:'a',user:{id:window.__frotaEu.uid,email:'mario@x.com'}}))});
await p.reload();await W(2500);
console.log('depois:',await p.evaluate(()=>[document.querySelector('#sheet h2')?.textContent,document.querySelector('#s-desc')?.value,document.querySelector('#s-local')?.value,document.querySelector('#sheet .sh-body')?.scrollTop]));
await p.click('#sheet [data-back]');await W(600);console.log('voltar leva a:',await p.evaluate(()=>document.querySelector('#sheet h2')?.textContent));
await p.screenshot({path:'est2.png'});
console.log('ERR',errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close()})();
