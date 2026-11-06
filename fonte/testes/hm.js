const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');const seedCode=src.slice(src.indexOf('const L='),src.indexOf('const OUT'));
eval(seedCode.replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();
for(const [name,mut] of [['zero',x=>x],['um',x=>{const k=Object.keys(x).find(k=>k.startsWith('equipamentos/'));x[k].horimetroData=new Date().toISOString().slice(0,10)}],['todos',x=>Object.keys(x).filter(k=>k.startsWith('equipamentos/')).forEach(k=>x[k].horimetroData=new Date(Date.now()-4*3600e3).toISOString().slice(0,10))]]){
 for(const scheme of ['light','dark']){const sd=JSON.parse(JSON.stringify(seed));mut(sd);
 const pg=await (await b.newContext({viewport:{width:390,height:844},colorScheme:scheme})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(sd)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(800);const el=await pg.$('#sidehm');console.log(name,scheme,await pg.$eval('.sh-n',e=>e.textContent+' '+e.className));await el.screenshot({path:`hm-${name}-${scheme}.png`})}}
await b.close()})();
