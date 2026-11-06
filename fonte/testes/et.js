const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const T=seed['trocas/inf-CB-03-2026-09-30'];T.ajuste=false;const SIDS=Object.keys(seed).filter(k=>/^estoque\//.test(k)&&!seed[k].comps);const SID=SIDS[0],S2=SIDS[1];console.log('s2',S2,seed[S2].qtd,seed[S2].codigo);T.itens[0].estoqueId=SID.split('/')[1];T.itens[1].estoqueId=SID.split('/')[1];console.log('sid',SID,seed[SID].qtd);const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||400);
const snap=()=>p.evaluate(async()=>{const st=await window.__db.collection('estoque').get();const o={};st.docs.forEach(d=>o[d.id]=d.data().qtd);const mv=await window.__db.collection('movs').get();return {st:o,mv:mv.docs.length}});
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="frota"]');await W();await p.screenshot({path:'et0.png'});
await p.click('#sheet [data-m="ed-tr"]');await W();await p.screenshot({path:'et1.png'});
// pick first with estoque-linked items
const n=await p.$$eval('[data-pt]',l=>l.length);console.log('regs',n);
await p.fill('#pt-q','CB-03');await W();await p.click('[data-pt] .tq-c');await W();await p.screenshot({path:'et2.png',fullPage:false});
const s0=await snap();

await p.click('[data-fd="hm"]');await W();await p.screenshot({path:'et9.png'});await p.fill('#ef-v','6070');await p.click('#ef-ok');await W();await p.click('[data-fd="obs"]');await W();await p.screenshot({path:'et10.png'});await p.fill('#ef-v','Corrigido');await p.click('#ef-ok');await W();await p.screenshot({path:'et11.png'});await p.click('.et-h[data-k="0"]');await W();await p.screenshot({path:'et5.png'});await p.click('[data-md="sb"]');await W();await p.fill('#et-sq','353');await W();await p.screenshot({path:'et6.png'});await p.click('#et-sh [data-pk="cat-353-5058"]');await W();
await p.click('.et-h[data-k="1"]');await W();await p.click('[data-md="ed"]');await W();await p.screenshot({path:'et7.png'});await p.fill('#et-qv','0');await p.click('#et-ok');await W();await p.screenshot({path:'et8.png'});
await p.click('#sheet .foot .btn.pri, #sheet button[form="fet"]');await W(600);await p.screenshot({path:'et3.png'});
await p.click('[data-y]');await W(500);await p.screenshot({path:'et4.png'});await p.click('[data-y]');
await W(1200);const s1=await snap();
const diff={};for(const k in s1.st)if(s0.st[k]!==s1.st[k])diff[k]=[s0.st[k],s1.st[k]];console.log(JSON.stringify({diff,mv:[s0.mv,s1.mv]}));
console.log(await p.evaluate(async()=>{const e=(await window.__db.doc('equipamentos/CB-03').get()).data();const t=(await window.__db.doc('trocas/inf-CB-03-2026-09-30').get()).data();return JSON.stringify([e.itens.slice(0,3).map(i=>[i.ultimaH,i.proxH]),t.horimetro,t.itens.map(i=>i.qtd)])}));
console.log('ERR',errs);await b.close()})();
