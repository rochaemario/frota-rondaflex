const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><style>[hidden]{display:none!important}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);await p.evaluate(()=>document.getElementById('fab').click());await p.waitForTimeout(300);await p.click('#sheet [data-m="comb"]');await p.waitForTimeout(300);await p.click('#sheet [data-m="abast"]');await p.waitForTimeout(300);
await p.type('#ab-o','Óleo da máquina, ação');console.log(await p.inputValue('#ab-o'));console.log('ERR',errs);await b.close()})();
