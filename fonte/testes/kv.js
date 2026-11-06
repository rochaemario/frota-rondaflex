const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// registrar preventiva PC-02 com o kit
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();
await p.evaluate(async()=>{await window.__db.doc('estoque/kit1').update({encaixe:['PC-02']})});await W(500);
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();
const kb=await p.$('#t-kits [data-kit]');console.log('kit compat',!!kb);await kb.click();await W();
await p.click('#t-extra .tr-h .main');await W(200);await p.click('#t-extra [data-kv]');await W(200);
console.log('lista',await p.evaluate(()=>document.querySelector('#t-extra .kv-w')?.innerText.replace(/\n/g,' | ')));
await p.evaluate(()=>document.querySelector('#t-extra .kv-w').scrollIntoView({block:'center'}));await p.screenshot({path:'kv1.png'});
await p.fill('#t-hm','2500');
await p.click('button[form="ft"]');await W(1200);for(const s of ['[data-skip]','#t-eqv [data-go]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
const t=await p.evaluate(async()=>{const s=await window.__db.collection('trocas').get();const t=s.docs.map(d=>({id:d.id,...d.data()})).filter(t=>t.equipId==='PC-02').sort((a,b)=>(b.ts||0)-(a.ts||0))[0];return {id:t.id,its:t.itens.map(i=>[i.desc,i.qtd,i.un]),inf:itensInforme(t).map(i=>[i.desc,i.qtd,i.un])}}).catch(e=>String(e));
console.log(JSON.stringify(t));
console.log('ERR',errs);await b.close()})();
