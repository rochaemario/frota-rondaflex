const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const nomes=['João da Silva','Carlos Pereira','Antônio Souza de Albuquerque Neto','Raimundo Lima'];let n=0;
Object.keys(seed).filter(k=>k.startsWith('equipamentos/')).forEach(k=>{delete seed[k].motorista});{const k=Object.keys(seed).find(k=>seed[k].codigo==='MT-01');seed[k].motorista='Operadores MSE';seed[k].alocacao='DM1';seed[k].area='Mina';seed[k].frente='UG'}
(async()=>{const b=await chromium.launch();for(const [sc,w] of [['light',390],['dark',390],['light',320]]){const pg=await (await b.newContext({viewport:{width:w,height:844},colorScheme:sc})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.click('[data-acc="aloc"]');await pg.waitForTimeout(200);await pg.click('[data-site="DM1"]');await pg.waitForTimeout(300);await pg.screenshot({path:`mo4-${sc}-${w}-a.png`});await pg.click('[data-area="Mina"]').catch(()=>{});await pg.waitForTimeout(300);
 await pg.screenshot({path:`mo4-${sc}-${w}.png`});
 await pg.click('[data-site]').catch(()=>{});
 console.log(sc,w,'ERR',errs)}await b.close()})();
