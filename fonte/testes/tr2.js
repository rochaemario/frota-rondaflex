const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
const st=()=>p.evaluate(()=>({vis:[...document.querySelectorAll('#t-items [data-row]')].filter(r=>!r.hidden).map(r=>r.querySelector('b').textContent.slice(0,22)),x:[...document.querySelectorAll('#t-extra [data-xrow] b')].map(b=>b.textContent.slice(0,22)),none:!document.querySelector('#t-none')?.hidden}));
const e0=await eq('PC-02');const H=Number(e0.horimetro)+10;
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.click('#sheet [data-m="reg"]');await W();await p.click('[data-rg="prev"]');await W();
await p.fill('.eqs-in','pc02');await W();await p.click('[data-eo="PC-02"]');await W();await p.fill('#t-hm',String(H));
console.log('inicio',JSON.stringify(await st()));
await p.screenshot({path:'tr0.png'});await p.fill('#t-q','360-8960');await W();await p.click('#t-qh [data-tk]');await W();console.log('apos pesquisa plano',JSON.stringify(await st()));
await p.fill('#t-q','273');await W();await p.click('#t-qh [data-tk]');await W();console.log('apos extra',JSON.stringify(await st()));
await p.click('#t-extra .tr-h .main');await W(200);await p.selectOption('#t-extra [data-xiv]','300');await p.evaluate(()=>document.querySelector('#t-extra').scrollIntoView({block:'center'}));await p.screenshot({path:'tr3.png'});
await p.click('button[form="ft"]');await W(1200);for(const s of ['[data-skip]','#t-eqv [data-go]']){const x=await p.$(s);if(x){console.log('pergunta',s);await x.click();await W(1000)}}
const e1=await eq('PC-02');console.log(JSON.stringify(e1.itens.map(i=>[i.desc.slice(0,18),i.ivSel??null,i.ultimaH,i.proxH])));
const tro=await p.evaluate(async()=>{const s=await window.__db.collection('trocas').get();const t=s.docs.map(d=>d.data()).filter(t=>t.equipId==='PC-02').sort((a,b)=>(b.ts||0)-(a.ts||0))[0];return t.itens.map(i=>[i.desc.slice(0,18),i.qtd])});console.log('troca',JSON.stringify(tro));
console.log('ERR',errs);await b.close()})();
