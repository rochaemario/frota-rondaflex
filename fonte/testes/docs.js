const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const mock=`window.__blobs={};const AS={upload:async(b)=>{const id='a'+Math.random().toString(36).slice(2,10);window.__blobs[id]=b;return {id,url:'/_blob/'+id}},delete:async id=>{window.__del=(window.__del||[]).concat(id)},list:async()=>({assets:[]})};
const DL={save:async o=>{window.__saved={filename:o.filename,size:o.data.size,type:o.data.type};return {status:'saved'}}};
window.claude={use:async n=>n==='db'?window.__db:n==='assets'?AS:n==='downloads'?DL:null};
const _f=window.fetch;window.fetch=async u=>{const m=String(u).match(/_blob\\/(.+)$/);if(m&&window.__blobs[m[1]])return new Response(window.__blobs[m[1]]);return _f(u)};`;
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');'+mock+'</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(800);
 await pg.click('#fab');await W();await pg.click('[data-m="editar"]');await W();await pg.click('[data-m="ed-eq"]');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet button')].find(x=>/CB-06/.test(x.textContent));b.click()});await W();
 await pg.evaluate(()=>document.querySelector('#e-docs').scrollIntoView({block:'center'}));await W();await pg.screenshot({path:'d1.png'});
 for(const [i,f] of [[0,'files/crlv.pdf'],[1,'files/nf.jpg']]){const [fc]=await Promise.all([pg.waitForEvent('filechooser'),pg.evaluate(i=>document.querySelectorAll('#e-docs [data-dt]')[i].click(),i)]);await fc.setFiles(f);await W(700)}
 await pg.evaluate(()=>document.querySelector('#e-docs').scrollIntoView({block:'center'}));await W();await pg.screenshot({path:'d2.png'});
 await pg.click('#sheet .sh-foot .btn.pri');await W(800);
 console.log('salvo',await pg.evaluate(()=>JSON.stringify([window.__store['equipamentos/CB-06'].docVeiculo,window.__store['equipamentos/CB-06'].notaFiscal])));
 await pg.evaluate(()=>{const d=document.querySelector('.doc-r');d&&d.scrollIntoView({block:'center'})});await W();await pg.screenshot({path:'d3.png'});
 await pg.click('[data-dl="docVeiculo"]');await W(500);console.log('baixado',await pg.evaluate(()=>JSON.stringify(window.__saved)));
 await pg.click('[data-dl="notaFiscal"]');await W(500);console.log('baixado',await pg.evaluate(()=>JSON.stringify(window.__saved)));
 // trocar e remover: remove nota fiscal
 await pg.evaluate(()=>document.querySelector('header').click());await W();await pg.click('#fab');await W();await pg.click('[data-m="editar"]');await W();await pg.click('[data-m="ed-eq"]');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet button')].find(x=>/CB-06/.test(x.textContent));b.click()});await W();
 await pg.click('#e-docs [data-dr="notaFiscal"]');await W();await pg.click('#sheet .sh-foot .btn.pri');await W(800);
 console.log('após remover',await pg.evaluate(()=>JSON.stringify([!!window.__store['equipamentos/CB-06'].docVeiculo,window.__store['equipamentos/CB-06'].notaFiscal,window.__del])));
 console.log('ERR',errs);await b.close()})();
