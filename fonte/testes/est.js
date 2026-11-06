const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
await p.click('#fab');await W();for(const t of ['Estoque','Filtros e oleos','Editar']){await p.click('.mi:has-text("'+t+'")');await W(600)}
await p.fill('#pe-q','526-3121');await W();await p.click('[data-pe]');await W(800);
await p.fill('#s-desc','DESCRICAO EM EDICAO');await p.fill('#s-local','Prateleira 9');await p.evaluate(()=>document.querySelector('#sheet .sh-body').scrollTop=300);
console.log('antes:',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
console.log('guardado:',(await p.evaluate(()=>localStorage.getItem('frota.estado'))||'').slice(0,160));
const st=await p.evaluate(()=>localStorage.getItem('frota.estado'));
// recarrega como se o celular tivesse encerrado o app
await p.setContent(await p.content());
