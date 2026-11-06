const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
const e0=await eq('PC-02');const H=Number(e0.horimetro)+10;console.log('PC-02 itens',e0.itens.length,'hm',e0.horimetro,'ivPrev',e0.intervaloPrev);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();await p.fill('#t-hm',String(H));
const ivs=await p.$$('[data-ivp]');console.log('seletores no plano:',ivs.length);
await ivs[0].selectOption('350');await ivs[1].selectOption('aval');
await p.evaluate(()=>document.querySelectorAll('[data-ivp]')[0].closest('.chk').scrollIntoView({block:'center'}));await p.screenshot({path:'iv1.png'});
await p.fill('#t-q','A550');await W();const tk=await p.$('#t-qh [data-tk]');if(tk){await tk.click();await W();const xv=await p.$('[data-xiv="0"]');if(xv){await xv.selectOption('300')}}
await p.evaluate(()=>document.querySelector('#t-extra').scrollIntoView({block:'center'}));await p.screenshot({path:'iv2.png'});
await p.click('button[form="ft"]');await W(1200);for(const s of ['[data-skip]','#t-eqv [data-go]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
const e1=await eq('PC-02');console.log(JSON.stringify(e1.itens.map(i=>[i.desc.slice(0,18),i.ivSel,i.proxH,i.ivDef])));
// extra em equipamento sem plano
await p.evaluate(()=>document.querySelector('#sheet [data-back]')&&0);
await p.evaluate(()=>{document.getElementById('scrim').click()});await W();
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc04');await W();await p.click('[data-eo="PC-04"]');await W();await p.fill('#t-hm','500');
await p.fill('#t-q','273');await W();await p.click('#t-qh [data-tk]');await W();await p.selectOption('[data-xiv="0"]','300');
await p.evaluate(()=>document.querySelector('#t-extra').scrollIntoView({block:'center'}));await p.screenshot({path:'iv2.png'});
await p.click('button[form="ft"]');await W(1200);for(const s of ['[data-skip]']){const x=await p.$(s);if(x){await x.click();await W(1000)}}
const e4=await eq('PC-04');console.log('PC-04:',JSON.stringify((e4.itens||[]).map(i=>[i.desc,i.ivSel,i.proxH,i.ultimaH])));
console.log('ERR',errs);await b.close()})();
