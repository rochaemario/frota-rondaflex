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
const W=ms=>p.waitForTimeout(ms||400);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="est"]');await W();await p.click('#sheet [data-m="x:st"]');await W();await p.click('#sheet [data-m="ed-st"]');await W();
await p.click('#sheet [data-pe]');await W();
await p.click('[data-pa]');await W();await p.screenshot({path:'pk.png'});const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-pk="gal"]')]);await fc.setFiles('foto-teste.jpg');await W(2500);
console.log(await p.evaluate(async()=>{const ids=Object.keys(window.__upb||{});if(!ids.length)return 'nada enviado';const bl=window.__upb[ids[0]];const bm=await createImageBitmap(bl);return JSON.stringify({type:bl.type,size:bl.size,w:bm.width,h:bm.height})}));
await p.screenshot({path:'ph1.png'});const b64=await p.evaluate(async()=>{const bl=Object.values(window.__upb)[0];const a=new Uint8Array(await bl.arrayBuffer());let s='';for(const x of a)s+=String.fromCharCode(x);return btoa(s)});fs.writeFileSync('ph-out.png',Buffer.from(b64,'base64'));
console.log('ERR',errs);await b.close()})();
