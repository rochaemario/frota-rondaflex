const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
// filtro de ar
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();
await p.click('[data-rg="ar"]');await W();await p.click('[data-ar="Motor"]');await W();
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();
await p.fill('#a-q','526-3125');await W();const s2=await p.$('#a-qh [data-ap2]');if(s2){await s2.click();await W()}
await p.click('[data-sv="Troca"]');await W();console.log('so troca nao desmarca',await p.getAttribute('[data-sv="Troca"]','aria-pressed'));
await p.click('[data-sv="Limpeza"]');await W();console.log('ambos',await p.$$eval('[data-sv]',a=>a.map(x=>x.getAttribute('aria-pressed'))),'lista visivel',await p.evaluate(()=>!document.querySelector('#a-stw').hidden));
await p.evaluate(()=>document.querySelector('.ar-seg').scrollIntoView({block:'center'}));await p.screenshot({path:'ar3.png'});
await p.click('button[form="fa"]');await W(1200);for(const s of ['[data-skip]','#a-hmg [data-go]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
console.log(await p.evaluate(async()=>{const q=await window.__db.collection('trocas').get();return q.docs.map(d=>d.data()).filter(t=>t.tipo==='filtro_ar').map(t=>t.servico+' '+t.itens.map(i=>i.desc+':'+i.qtd).join(','))}));
console.log('ERR',errs);await b.close()})();
