const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(([s])=>{window.__SEED=s;window.__PAPEL='admin';window.__LOGGED=true;window.BarcodeDetector=class{static async getSupportedFormats(){return []}async detect(){return []}};
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{throw new Error('x')}}})},[seed]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='localhost'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://localhost/');await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||350);
const fab=async m=>{await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click(`[data-m="${m}"]`);await W(400)};
await fab('mv-entrada');await p.fill('#mv-c','filtro');await W(500);await p.screenshot({path:'s1.png'});
await p.fill('#mv-c','zz9');await W(500);await p.screenshot({path:'s2.png'});
await p.fill('#mv-c','');await p.fill('#mv-c','462');await W(200);await p.click('#mv-hit [data-pk]');await W(300);console.log('pick ok',await p.evaluate(()=>!!document.querySelector('#mv-card')));
await fab('novo');await p.click('[data-m="st"]');await W(400);await p.fill('#s-idq','filtro ar');await W(500);await p.screenshot({path:'s3.png'});
await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.getElementById('cartb').click());await W(400);await p.evaluate(()=>document.querySelector('#sheet .ct-add').click());await W(300);await p.fill('#sheet .ct-c','filtro');await W(500);await p.screenshot({path:'s4.png'});
console.log('ERR',errs);await b.close()})();
