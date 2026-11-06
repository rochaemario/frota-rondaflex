const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
const IMG='data:image/jpeg;base64,'+fs.readFileSync('cb10.jpg').toString('base64');
await p.evaluate(async()=>{await window.__db.doc('equipamentos/CB-10').update({foto:'cb10foto'})});await W(500);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();
await p.evaluate(q=>{const b=document.querySelector(q);const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()},'[data-eq="CB-10"]');await W();await p.click('[data-eq="CB-10"]');await W(800);
await p.evaluate(IMG=>document.querySelectorAll('#sheet .ph-full button').forEach(b=>b.innerHTML=`<img src="${IMG}" alt="Foto">`),IMG);await W(400);
// hoje: rola ate a foto
await p.evaluate(()=>document.querySelector('#sheet .ph-full').scrollIntoView({block:'center'}));await W(300);await p.screenshot({path:'h0.png'});
// proposta: foto como topo da ficha, bordas dissolvendo na tela
await p.addStyleTag({content:`.hero{position:relative;margin:-14px -16px 6px;height:300px;overflow:hidden;background:var(--bg)}
.hero img{width:100%;height:100%;object-fit:cover;object-position:50% 60%;display:block;
 -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 14%,#000 55%,transparent 100%),linear-gradient(to right,transparent 0,#000 12%,#000 88%,transparent 100%);
 -webkit-mask-composite:source-in;mask-image:linear-gradient(to bottom,transparent 0,#000 14%,#000 55%,transparent 100%),linear-gradient(to right,transparent 0,#000 12%,#000 88%,transparent 100%);mask-composite:intersect}
.hero .cap{position:absolute;left:18px;right:18px;bottom:16px}
.hero .cap b{display:block;font:800 30px var(--display,system-ui);color:var(--fg,#111);letter-spacing:.02em}
.hero .cap span{font-size:14px;color:var(--muted)}`});
await p.evaluate(IMG=>{const b=document.querySelector('#sheet .sh-body');const ph=b.querySelector('.ph-full');if(ph)ph.remove();
  const h=document.createElement('div');h.className='hero';h.style.background=getComputedStyle(document.querySelector('#sheet')).backgroundColor;h.innerHTML=`<img src="${IMG}">`;b.prepend(h);b.scrollTop=0},IMG);await W(400);
await p.screenshot({path:'h1.png'});
console.log('ERR',errs);await b.close()})();
