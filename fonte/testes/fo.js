const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();
await p.evaluate(q=>{const b=document.querySelector(q);const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()},'[data-eq="PC-02"]');await W();await p.click('[data-eq="PC-02"]');await W(800);
const V={
 A:`.lbl-x{background:#fff!important;border-radius:14px;min-height:50px;padding:0 14px!important;margin:12px 0 8px!important;width:100%!important;box-shadow:0 1px 2px rgba(10,30,80,.08);font-size:12.5px!important;color:var(--fg)!important}`,
 B:`.lbl-x{border:1.5px solid var(--line-2,#c9d0dc)!important;border-radius:14px;min-height:50px;padding:0 14px!important;margin:12px 0 8px!important;width:100%!important;font-size:12.5px!important;color:var(--fg)!important}`,
 C:`.lbl-x{background:#e2e6ee!important;border-radius:14px;min-height:50px;padding:0 14px!important;margin:12px 0 8px!important;width:100%!important;font-size:15px!important;text-transform:none!important;letter-spacing:0!important;font-weight:600!important;color:var(--fg)!important}`};
for(const [k,css] of Object.entries(V)){await p.evaluate(()=>{const s=document.getElementById('vx');if(s)s.remove()});await p.evaluate(css=>{const s=document.createElement('style');s.id='vx';s.textContent=css+'.lbl-x>svg{width:18px!important;height:18px!important}';document.head.append(s)},css);
 await p.evaluate(()=>document.querySelector('#sheet [data-lx]').scrollIntoView({block:'center'}));await W(200);await p.screenshot({path:'fo'+k+'.png',clip:{x:0,y:420,width:390,height:330}})}
await b.close()})();
