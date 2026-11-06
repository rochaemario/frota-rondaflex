const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||400);
const st=async id=>p.evaluate(async id=>(await window.__db.doc('estoque/'+id).get()).data().qtd,id);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc04');await W();await p.click('[data-eo]');await W();
await p.click('[data-iv="300"]');await W();
await p.fill('#t-q','273');await W();await p.screenshot({path:'ta1.png'});
const id=await p.getAttribute('#t-qh [data-tk]','data-tk');const q0=await st(id);
await p.click('#t-qh [data-tk]');await W();await p.fill('[data-xq="0"]','2');await p.screenshot({path:'ta2.png'});
await p.fill('#t-hm','460');
await p.click('button[form="ft"]');await W(1500);await p.screenshot({path:'ta3.png'});
const sk=await p.$('[data-skip]');if(sk){await sk.click();await W(1500)}
console.log(id,q0,'->',await st(id));
console.log(await p.evaluate(async()=>{const q=await window.__db.collection('trocas').get();const t=q.docs.map(d=>d.data()).filter(t=>t.equipId==='PC-04');return JSON.stringify(t.map(t=>[t.intervalo,t.itens]))}));
console.log('ERR',errs);await b.close()})();
