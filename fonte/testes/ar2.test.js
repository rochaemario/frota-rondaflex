const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// filtro de ar
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();
console.log(await p.$$eval('[data-rg]',x=>x.map(b=>b.dataset.rg)));
await p.click('[data-rg="ar"]');await W();await p.click('[data-ar="Motor"]');await W();
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();
console.log('lista inicial',await p.evaluate(()=>document.querySelector('#a-its').innerText.replace(/\n/g,' | ')));
console.log('sugestoes',await p.$$eval('#a-sug [data-as]',x=>x.length));
const s1=await p.$('#a-sug [data-as]');if(s1){await s1.click();await W()}
await p.fill('#a-q','526-3125');await W();const s2=await p.$('#a-qh [data-ap2]');if(s2){await s2.click();await W()}
console.log('lista',await p.evaluate(()=>document.querySelector('#a-its').innerText.replace(/\n/g,' | ')));
await p.evaluate(()=>document.querySelector('#a-stw').scrollIntoView({block:'start'}));await p.screenshot({path:'ar1.png'});
await p.click('button[form="fa"]');await W(1200);for(const s of ['[data-skip]','#a-hmg [data-go]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
const t=await p.evaluate(async()=>{const s=await window.__db.collection('trocas').get();const t=s.docs.map(d=>d.data()).filter(t=>t.equipId==='PC-02'&&t.tipo==='filtro_ar').sort((a,b)=>(b.ts||0)-(a.ts||0));return t.map(x=>x.itens.map(i=>[i.desc,i.qtd,i.estoqueId]))});console.log('troca ar',JSON.stringify(t));
// editar preventiva: adicionar item
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="ed"]');await W();
await p.fill('#pt-q','pc02');await W();await p.evaluate(()=>document.querySelector('[data-pt]').click());await W(700);
await p.fill('#et-add','360-8960');await W();await p.click('#et-addh [data-ea]');await W();
await p.fill('#et-add','273');await W();await p.click('#et-addh [data-ea]');await W();
console.log('itens',await p.$$eval('#et-l .et-n',x=>x.map(e=>e.innerText.replace(/\n/g,' '))));
await p.evaluate(()=>document.querySelector('#et-add').scrollIntoView({block:'center'}));await p.screenshot({path:'ar2.png'});
await p.click('button[form="fet"]');await W(900);
console.log('conf',await p.evaluate(()=>document.querySelector('#et-conf')?.innerText.slice(0,200)));
console.log('saldo antes',await p.evaluate(async()=>(await window.__db.doc('estoque/cat-360-8960').get()).data().qtd));for(let i=0;i<3;i++){const b=await p.$('#et-conf .btn.pri');if(!b)break;await b.click();await W(900)}
console.log('saldo 360',await p.evaluate(async()=>(await window.__db.doc('estoque/cat-360-8960').get()).data().qtd));
console.log('ERR',errs);await b.close()})();
