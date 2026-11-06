const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
for(const [k,v] of Object.entries(seed)){if(k==='estoque/kit1'){v.kit=Object.assign(v.kit||{},{encaixe:['PC-02']});v.encaixe=['PC-02']}}
console.log('kit1',JSON.stringify(seed['estoque/kit1']).slice(0,300));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const toastT=()=>p.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.textContent).pop()||'');
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W(600);
const prev=await p.$('[data-rg="prev"],.mi:has-text("Preventiva")');if(prev){await prev.click();await W(700)}
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W(600);
const vis=()=>p.evaluate(()=>[...document.querySelectorAll('#t-items [data-row]:not([hidden]) b,#t-extra .tr-i b')].map(x=>x.textContent));
console.log('inicio:',await vis(),'| vazio:',await p.evaluate(()=>!document.getElementById('t-none').hidden));
console.log('plano atalhos:',await p.$$eval('#t-plan [data-tp]',a=>a.length),'| kits:',await p.$$eval('#t-kits [data-kit]',a=>a.map(x=>x.textContent.slice(0,40))));
await p.click('#t-kits [data-kit]');await W(500);console.log('apos kit:',await vis(),'|',await toastT());
await p.click('#t-kits [data-kit]');await W(400);console.log('kit de novo:',await toastT());
const tp=await p.$('#t-plan [data-tp]');if(tp){const t=await tp.textContent();await tp.click();await W(400);console.log('plano add:',t.slice(0,30),'|',await toastT())}
await p.fill('#t-q','526-3125');await W(400);const r=await p.$('#t-qh [data-tk]');if(r){await r.click();await W(400);console.log('busca 526-3125:',await toastT())}
await p.fill('#t-q','526-3125');await W(400);const r2=await p.$('#t-qh [data-tk]');if(r2){await r2.click();await W(400);console.log('busca de novo:',await toastT())}
const s0=await p.evaluate(async()=>{const q=await window.__db.collection('estoque').get();const o={};q.docs.forEach(d=>o[d.id]=d.data().qtd);return o});
await p.evaluate(()=>document.querySelector('.lbl:has(+#t-kits),#t-kits').scrollIntoView({block:'start'}));await W(300);await p.screenshot({path:'rg1.png'});
console.log('kit on:',await p.evaluate(()=>document.querySelector('#t-kits [data-kit]').className));await p.click('button[form="ft"]');await W(1200);await p.screenshot({path:'rg2.png'});console.log('apos salvar:',await toastT(),await p.evaluate(()=>document.querySelector('#t-eqv')?.innerText.slice(0,200)));for(const s of ['[data-skip]','#t-eqv [data-go]','[data-skip]']){const x=await p.$(s);if(x){await x.click();await W(900)}}
const tr=await p.evaluate(async()=>{const q=await window.__db.collection('trocas').get();const l=q.docs.map(d=>d.data()).filter(t=>t.equipId==='PC-02'&&t.data===new Date().toISOString().slice(0,10));return l.length+' hoje: '+JSON.stringify(l[0]&&l[0].itens.map(i=>i.desc+'|'+i.estoqueId+'|'+i.qtd))});console.log('registro:',tr);
const s1=await p.evaluate(async()=>{const q=await window.__db.collection('estoque').get();const o={};q.docs.forEach(d=>o[d.id]=d.data().qtd);return o});
console.log('baixas:',Object.keys(s1).filter(k=>s1[k]!==s0[k]).map(k=>k+':'+s0[k]+'->'+s1[k]));

for(let i=0;i<4;i++){await p.keyboard.press('Escape');await W(200)}
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="ed"]');await W();
await p.fill('#pt-q','pc02');await W();await p.evaluate(()=>document.querySelector('[data-pt]').click());await W(700);
console.log('faixa:',await p.evaluate(()=>document.getElementById('et-ajb').innerText.replace(/\s+/g,' ')));
await p.click('#et-aj');await W(400);console.log('pergunta:',await p.evaluate(()=>document.getElementById('et-ajq').innerText.replace(/\s+/g,' ')));
await p.click('#et-ajq [data-go]');await W(1200);
const s2=await p.evaluate(async()=>{const q=await window.__db.collection('estoque').get();const o={};q.docs.forEach(d=>o[d.id]=d.data().qtd);return o});
console.log('estoque voltou:',Object.keys(s2).filter(k=>s2[k]!==s1[k]).map(k=>k+':'+s1[k]+'->'+s2[k]));
console.log('faixa depois:',await p.evaluate(()=>document.getElementById('et-ajb').innerText.replace(/\s+/g,' ')));
await p.click('#et-aj');await W(400);await p.click('#et-ajq [data-go]');await W(1200);
const s3=await p.evaluate(async()=>{const q=await window.__db.collection('estoque').get();const o={};q.docs.forEach(d=>o[d.id]=d.data().qtd);return o});
console.log('baixado de novo:',Object.keys(s3).filter(k=>s3[k]!==s2[k]).map(k=>k+':'+s2[k]+'->'+s3[k]));
console.log('ERR',errs);await b.close()})();
