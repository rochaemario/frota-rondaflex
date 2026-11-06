const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
await p.waitForTimeout(600);
const MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>';
await p.addStyleTag({content:`.mic{position:relative;background:none;border:0;color:#fff;padding:6px;margin:0 2px 0 auto;display:flex;flex:none}.mic svg{width:22px;height:22px}.bell{margin-left:0!important}
.mic.on{background:#e8112d;border-radius:50%;animation:pu 1.2s infinite}@keyframes pu{0%{box-shadow:0 0 0 0 rgba(232,17,45,.6)}100%{box-shadow:0 0 0 10px rgba(232,17,45,0)}}
.vband{position:fixed;left:0;right:0;z-index:30;background:#fff;border-bottom:1px solid #d6dbe4;box-shadow:0 6px 16px rgba(10,30,80,.12);padding:10px 16px;display:flex;gap:10px;align-items:center;font:15px system-ui}
.vband .dot{width:10px;height:10px;border-radius:50%;background:#e8112d;flex:none;animation:pu 1.2s infinite}.vband .tx{flex:1;min-width:0}.vband .tx b{display:block;font-size:12px;letter-spacing:.06em;color:#6b7486;font-weight:700}.vband .tx span{color:#0b1530}.vband .tx em{color:#9aa3b3;font-style:normal}
.vband .x{border:1px solid #d6dbe4;background:#fff;border-radius:50%;width:34px;height:34px;font-size:16px;color:#333}
.vband.ok .dot{background:#1b9a4b;animation:none}
.mic2{position:fixed;z-index:8;right:96px;bottom:28px;width:50px;height:50px;border-radius:50%;border:0;background:#fff;color:#0b2470;box-shadow:0 6px 16px rgba(10,30,80,.25);display:grid;place-items:center}.mic2 svg{width:24px;height:24px}`});
const setMic=async(on,band)=>p.evaluate(([MIC,on,band])=>{document.querySelectorAll('.mic,.vband,.mic2').forEach(x=>x.remove());const bell=document.getElementById('bell');bell.hidden=false;
 const m=document.createElement('button');m.className='mic'+(on?' on':'');m.innerHTML=MIC;bell.before(m);
 if(band){const top=document.querySelector('.top').getBoundingClientRect().bottom;const d=document.createElement('div');d.className='vband'+(band.ok?' ok':'');d.style.top=top+'px';d.innerHTML=`<span class="dot"></span><div class="tx"><b>${band.t}</b><span>${band.s}</span></div><button class="x">✕</button>`;document.body.append(d)}},[MIC,on,band]);
await setMic(false);await p.screenshot({path:'voz1.png'});
await setMic(true,{t:'OUVINDO',s:'abastecer CB07 120 litros <em>horimetro…</em>'});await p.screenshot({path:'voz2.png'});
// abre abastecimento para o estado de confirmacao
await p.evaluate(()=>document.getElementById('fab').click());await p.waitForTimeout(400);await p.click('#sheet [data-m="comb"]');await p.waitForTimeout(400);console.log(await p.$$eval('#sheet [data-m]',x=>x.map(b=>b.dataset.m)));await p.click('#sheet [data-m="abast"]');await p.waitForTimeout(600);
await p.fill('#ab-eq, #sheet .eqs-in','cb07').catch(()=>{});await p.waitForTimeout(400);const o=await p.$('[data-eo="CB-07"]');if(o){await o.click();await p.waitForTimeout(400)}
await p.evaluate(()=>{const i=document.querySelector('#sheet .eqs-in,#sheet input');if(i)i.value='CB-07 · Caminhao basculante'});await p.fill('#ab-hm','6200').catch(()=>{});await p.fill('#ab-l','120').catch(()=>{});
await setMic(true,{t:'ENTENDI · DIGA SALVAR',s:'CB-07 · 120 L · horimetro 6200',ok:1});
await p.screenshot({path:'voz3.png'});
await p.evaluate(()=>document.getElementById('scrim').click());await p.waitForTimeout(500);
await p.evaluate(MIC=>{document.querySelectorAll('.mic,.vband').forEach(x=>x.remove());const m=document.createElement('button');m.className='mic2';m.innerHTML=MIC;document.body.append(m)},MIC);await p.screenshot({path:'voz4.png'});
await b.close()})();
