const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.setContent('<!doctype html><html><head><meta charset=utf8><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);await p.click('[data-acc="frota"]');await p.waitForTimeout(300);await p.click('[data-fr="equip"]');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{const b=document.querySelector('[data-eq="TA-02"]');if(!b)return 'nao existe';const l=b.closest('.tsec-l');return [l.hidden,l.previousElementSibling.outerHTML.slice(0,120)]}));
await b.close()})();
