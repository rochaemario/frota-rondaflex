const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');await p.waitForTimeout(1200);
await p.evaluate(()=>document.querySelector('[data-acc="estoque"]').click());await p.waitForTimeout(400);
await p.screenshot({path:'es-0.png'});
const cnt=()=>p.evaluate(()=>[...document.querySelectorAll('.es-r[data-q]')].filter(r=>!r.hidden).length);
console.log('total',await cnt());
for(const q of ['pc02','pc-02','oleo','filtro ar','462','xyz']){await p.fill('#esq',q);await p.waitForTimeout(100);console.log(q,await cnt(),await p.evaluate(()=>[...document.querySelectorAll('.es-r[data-q]')].filter(r=>!r.hidden).slice(0,4).map(r=>r.querySelector('.es-n').textContent).join(' | ')));if(q==='filtro ar')await p.screenshot({path:'es-1.png'})}
console.log(await p.evaluate(()=>[...document.querySelectorAll('.es-r[data-q]')].map(r=>r.dataset.q.slice(-60)).join('\n')));await p.fill('#esq','oleo');await p.evaluate(()=>window.dispatchEvent(new Event('x')));await p.waitForTimeout(100);console.log('after render',await cnt(),await p.inputValue('#esq'),await p.evaluate(()=>document.activeElement.id));
console.log('ERR',errs);await b.close()})();
