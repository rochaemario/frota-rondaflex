// abre uma tela e tira print: node peek.js <html> <w> <role> <js a rodar> <saida.png> [scrollY] [clipH]
const {chromium}=require('playwright');const fs=require('fs');const {seed}=require('./item49_seed.js');
const [,,SRC,W,ROLE,JS,OUT,SY,CH]=process.argv;
let html=fs.readFileSync(SRC,'utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,goHome,closeSheet,NAV,openOS,osRegistrar,openMenu,abreCard});const OS_ON=true;');
const EU={admin:{uid:'adm',papel:'admin',nome:'Mario Eugenio Rocha'},mecanico:{uid:'mec-1',papel:'mecanico',nome:'Douglas Fernandes de Oliveira Junior'}};
const page=`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(EU[ROLE])}</script></head><body>${html}</body></html>`;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+W,height:780},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page}));await p.goto('http://app.test/');await p.waitForTimeout(1500);
for(const step of JS.split(';;')){await p.evaluate(step);await p.waitForTimeout(600)}
if(SY&&isNaN(+SY)){const bx=await p.evaluate(sel=>{const e=[...document.querySelectorAll(sel)].pop();e.scrollIntoView({block:'center'});const q=e.getBoundingClientRect();return {y:Math.max(0,q.top-60),h:q.height+120}},SY);await p.waitForTimeout(200);await p.screenshot({path:OUT,clip:{x:0,y:bx.y,width:+W,height:Math.min(bx.h,780-bx.y)}});if(errs.length)console.log(errs);await b.close();return}
if(SY)await p.evaluate(y=>{const sb=document.querySelector('#sheet .sh-body');if(sb&&!document.querySelector('#scrim').hidden)sb.scrollTop=+y;else scrollTo(0,+y)},SY);await p.waitForTimeout(300);
await p.screenshot({path:OUT,clip:CH?{x:0,y:0,width:+W,height:+CH}:undefined});if(errs.length)console.log(errs);await b.close()})();
