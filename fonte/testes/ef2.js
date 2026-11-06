const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
await p.click('[data-acc="estoque"]');await W();await p.click('[data-estab="fil"]');await W(800);await p.screenshot({path:'ef4.png'});
// editar item: muda para Graxa
await p.click('#fab');await W();await p.screenshot({path:'ef5.png'});
for(const t of ['Estoque','Filtros e oleos','Editar']){await p.click('.mi:has-text("'+t+'")');await W(700)}
await p.click('[data-pe]');await W(800);
console.log('opts',await p.$$eval('#s-tipo option',a=>a.map(o=>o.value+'='+o.textContent)));
await p.selectOption('#s-tipo','Graxa');console.log('un',await p.inputValue('#s-un'));
await p.click('.sh-foot .btn.pri');await W(1200);
const d=await p.evaluate(async()=>{const q=await window.__db.collection('estoque').get();return q.docs.map(x=>x.data()).filter(x=>x.tipo==='Graxa').map(x=>x.desc+' '+x.un)});console.log('graxa',d);
for(let i=0;i<4;i++){await p.keyboard.press('Escape');await W(250)}await p.click('#fab');await W();await p.click('.mi:has-text("Ajustes do app")');await W(600);await p.click('.mi:has-text("Categorias de itens")');await W(700);
await p.screenshot({path:'ef6.png'});await p.fill('#l-v','Pneu');await p.selectOption('#l-u','un');await p.click('#fl .btn.pri');await W(900);
console.log('cfg',await p.evaluate(async()=>JSON.stringify((await window.__db.doc('config/listas').get()).data().cats)));
await p.click('.lst-row:has-text("Graxa")');await W(300);await p.screenshot({path:'ef7.png'});
console.log('ERR',errs);await b.close()})();
