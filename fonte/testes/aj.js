const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark']){const pg=await (await b.newContext({viewport:{width:390,height:844},colorScheme:sc})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.click('#sideaj');await pg.waitForTimeout(300);await pg.screenshot({path:`aj-${sc}-1.png`});await pg.waitForTimeout(6300);await pg.click('#sideaj');await pg.waitForTimeout(300);await pg.screenshot({path:`aj-${sc}-0.png`});await pg.click('#sideaj');await pg.waitForTimeout(6300);
 await pg.click('[data-acc="manut"]');await pg.waitForTimeout(200);await pg.click('[data-a="new-tr"]');await pg.waitForTimeout(200);await pg.click('[data-rg="prev"]');await pg.waitForTimeout(300);await pg.screenshot({path:`aj-${sc}-2.png`})}
await b.close()})();
