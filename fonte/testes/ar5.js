const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// filtro de ar
const op=async s=>{await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="ar"]');await W();await p.click(`[data-ar="${s}"]`);await W()};
await op('Motor');console.log('motor: botoes servico',await p.$$eval('[data-sv]',a=>a.length),'|',await p.textContent('#sheet .sub'));
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();
await p.fill('#a-q','526-3125');await W();const s2=await p.$('#a-qh [data-ap2]');if(s2){await s2.click();await W()}
await p.click('button[form="fa"]');await W(1200);for(const s of ['[data-skip]','#a-hmg [data-go]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
console.log(await p.evaluate(async()=>{const q=await window.__db.collection('trocas').get();return q.docs.map(d=>d.data()).filter(t=>t.tipo==='filtro_ar').map(t=>t.sub+' '+t.servico)}));
for(let i=0;i<4;i++){await p.keyboard.press('Escape');await W(200)}
await p.click('[data-acc="frota"]');await W();await p.click('[data-fr="equip"]');await W();
await p.evaluate(()=>{const b=document.querySelector('[data-eq="PC-02"]');const l=b.closest('.tsec-l');if(l&&l.hidden)l.previousElementSibling.click()});await W();await p.click('[data-eq="PC-02"]');await W(800);
await p.evaluate(()=>{const b=document.querySelector('#sheet .sh-body');b.scrollTop=b.scrollHeight});await W(3500);await p.screenshot({path:'arh.png'});
const r=await p.$('#sheet .ia-h.hh:has(.ar-ico)');console.log('linha ar:',!!r);if(r){await r.click();await W(700);await p.screenshot({path:'aro.png'});await p.click('#t-card');await W(2000);
 const src=await p.evaluate(()=>document.querySelector('#sheet img.card-prev')?.src||'');if(src)require('fs').writeFileSync('arcard.png',Buffer.from(src.split(',')[1],'base64'))}
for(let i=0;i<6;i++){await p.keyboard.press('Escape');await W(200)}
await op('Ar condicionado').catch(e=>console.log('ac?',e.message.slice(0,60)));console.log('ar cond: botoes',await p.$$eval('[data-sv]',a=>a.length));
console.log('ERR',errs);await b.close()})();
