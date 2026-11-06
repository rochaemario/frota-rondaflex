const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[320,568],[390,844],[430,932],[800,1000]]){const pg=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(800);await pg.evaluate(()=>document.getElementById('scroller').scrollTo(0,9999));await pg.waitForTimeout(200);
 const r=await pg.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect();const l=q('.brandmark img'),c=q('#cartb'),f=q('#fab');return {logo:[l.left,l.right,l.bottom|0],cart:c.right,fab:f.left,vh:innerHeight}});
 console.log(w,h,JSON.stringify(r));await pg.screenshot({path:`lg-${w}.png`});
 if(w===390){await pg.click('[data-acc="equip"]');await pg.waitForTimeout(300);console.log('focus visible:',await pg.evaluate(()=>{const e=document.querySelector('.brandmark');return !!e&&getComputedStyle(e).display!=='none'}))}}
await b.close()})();
