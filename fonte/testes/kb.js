const fs=require('fs');let s=fs.readFileSync('mm.js','utf8');
const j=s.indexOf("const top=");s=s.slice(0,j)+`
await p.evaluate(()=>window.__T().osNova());await W(600);await p.click('[data-eqp]');await W(600);
await p.evaluate(()=>{const vv=window.visualViewport;Object.defineProperty(vv,'height',{get:()=>430,configurable:true});vv.dispatchEvent(new Event('resize'))});
await p.click('[data-pest]');await W(400);await p.screenshot({path:'/tmp/claude-0/cx/kb.png'});
console.log(await p.evaluate(()=>{const r=document.querySelector('.os-mh').getBoundingClientRect();return [r.top,r.bottom]}));
console.log('ERR',errs);await b.close()})();`;
fs.writeFileSync('kb_run.js',s);
