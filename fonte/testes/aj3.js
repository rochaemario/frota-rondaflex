const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=t=>pg.waitForTimeout(t||300);await W(700);
 await pg.click('#sideaj');await W();await pg.screenshot({path:'aj3-0.png'});
 for(const dir of ['entrada','saida']){
 await pg.click('#fab');await W();await pg.click(`[data-m="mv-${dir}"]`);await W();await pg.screenshot({path:`aj3-${dir}-1.png`});
 await pg.fill('#mv-c','273-5711');await W();await pg.click('[data-pk]');await W();await pg.fill('#mv-q','2');await W();await pg.screenshot({path:`aj3-${dir}-2.png`});
 await pg.click('#mv-go');await W(600);await pg.screenshot({path:`aj3-${dir}-3.png`});
 console.log(dir,await pg.evaluate(()=>JSON.stringify({qtd:window.__store['estoque/cat-273-5711'].qtd,movs:Object.entries(window.__store).filter(([k])=>k.startsWith('movs/')).map(([k,v])=>[v.tipo,v.qtd,v.saldo,v.ajuste])})));
 await pg.evaluate(()=>document.querySelector('header').click());await W()}
 console.log('ERR',errs);await b.close()})();
