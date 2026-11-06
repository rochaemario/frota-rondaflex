const fs=require('fs');let s=fs.readFileSync('enc2.js','utf8');
const i=s.indexOf("await p.setContent(");
s=s.slice(0,i)+`const INIT=("window.__CALLS=[];window.__frotaMec=async(a,d)=>{__CALLS.push([a,d]);return a==='criar'?{uid:'11111111-2222-3333-4444-555555555555',codigo:'abcdefghijkmnpqrstuvwxyz'}:a==='codigo'?{codigo:'zzzzzzzzzzzzzzzzzzzzzzzz'}:{ok:true}};");
`+s.slice(i);
s=s.slice(0,s.indexOf("await p.click('[data-tb=\"mecs\"]')"))+`
await p.evaluate(INIT);await p.addScriptTag({path:'/tmp/claude-0/qr/r/js/qrcode.js'});await p.click('[data-tb="mecs"]');await W(600);await p.screenshot({path:'mq0.png'});
await p.fill('#mc-n','Pedro Alves');await p.click('[form="mcf"]');await W(1200);await p.screenshot({path:'mq1.png'});
console.log(await p.evaluate(()=>JSON.stringify([__CALLS,window.__T().S.mecs.slice(-1)])));
await p.click('.os-scr [data-x]');await W(400);await p.click('[data-mx="11111111-2222-3333-4444-555555555555"]');await W(400);await p.screenshot({path:'mq2.png'});
await p.click('[data-mqr]');await W(300);await p.screenshot({path:'mq3.png'});await p.click('#nq-ok');await W(800);
await p.click('.os-scr [data-x]');await W(300);await p.click('#mc-at',{force:true});await p.click('[data-msv]');await W(900);
console.log(await p.evaluate(()=>JSON.stringify([__CALLS.slice(1),window.__T().S.mecs.slice(-1)])));
console.log('ERR',errs);await b.close()})();`;
fs.writeFileSync('mq_run.js',s);
