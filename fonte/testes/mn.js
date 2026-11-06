const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||350);
const open=async(path)=>{await p.evaluate(()=>document.querySelector('header').click());await W(300);await p.evaluate(()=>document.getElementById('fab').click());await W(300);for(const m of path){await p.click(`#sheet [data-m="${m}"]`);await W(400)}return p.evaluate(()=>document.querySelector('#sheet h2')?.textContent)};
for(const [nm,path] of [['menu',[]],['frota',['frota']],['est',['est']],['comb',['comb']],['aj',['aj']],['geq',['frota','g:eq']],['gst',['est','g:st']]]){await open(path);await p.screenshot({path:'mn-'+nm+'.png'})}
const tests=[['frota','reg'],['frota','g:eq'],['frota','thm'],['frota','thm-x'],['frota','dl-tr'],['est','mv-entrada'],['est','mv-saida'],['est','g:st'],['est','g:kit'],['est','cart'],['comb','abast'],['comb','dl-ab'],['aj','l:tipos']];
for(const t of tests)console.log(t.join(' › '),'=>',await open(t));
await open(['frota','g:eq']);await p.click('#gr-new');await W(400);console.log('novo eq =>',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
await open(['est','g:st']);await p.click('#sheet [data-ge]');await W(400);console.log('editar st =>',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
await open(['est','g:st']);await p.click('#sheet [data-gx]');await W(400);console.log('excluir st =>',await p.evaluate(()=>document.querySelector('#sheet h2').textContent+' | '+document.querySelector('#sheet .sh-body').innerText.slice(0,80).replace(/\n/g,' ')));
await open(['aj','l:tipos']);await p.click('#sheet [data-sel="0"]');await W(200);console.log('lista tudo:',!!(await p.$('#fl')),await p.evaluate(()=>document.querySelector('.lst-act:not([hidden])')?.innerText.replace(/\n/g,' ')));
console.log('ERR',errs);await b.close()})();
