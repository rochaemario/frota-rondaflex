const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const nomes=['João da Silva','Carlos Pereira','Antônio Souza','Raimundo Lima','José Ferreira','Francisco Alves','Marcos Rocha'];let n=0;
Object.keys(seed).filter(k=>k.startsWith('equipamentos/')).sort().forEach((k,i)=>{if(i%3!==2)seed[k].motorista=nomes[(n++)%nomes.length]});
const V={
 1:`[data-alq]{position:relative}[data-alq].wm{min-height:58px}.mo{position:absolute;left:var(--mx);bottom:5px;font-size:10.5px;line-height:1;color:var(--accent-tx,var(--accent));opacity:.75}`,
 2:`[data-alq]{position:relative}[data-alq].wm{min-height:62px}.mo{position:absolute;left:var(--mx);bottom:6px;font-size:11px;line-height:1;color:var(--accent-tx,var(--accent));opacity:.8;display:flex;align-items:center;gap:3px}.mo svg{width:11px;height:11px}`,
 3:`[data-alq]{position:relative}[data-alq].wm{min-height:58px}.mo{position:absolute;right:38px;bottom:5px;font-size:10.5px;line-height:1;color:var(--accent-tx,var(--accent));opacity:.75}`,
 4:`[data-alq]{position:relative;min-height:58px}.mo{position:absolute;left:var(--mx);bottom:5px;font-size:10.5px;line-height:1;color:var(--accent-tx,var(--accent));opacity:.75}`};
const IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
(async()=>{const b=await chromium.launch();
for(const sc of ['light','dark'])for(const [k,css] of Object.entries(V)){const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:sc})).newPage();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForTimeout(700);await pg.click('[data-acc="aloc"]');await pg.waitForTimeout(200);await pg.click('[data-site="PQ"]');await pg.waitForTimeout(300);
 await pg.evaluate(([k,css,IC])=>{const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
   document.querySelectorAll('[data-alq]').forEach((b,i)=>{const m=b.querySelector('.tq-m');b.style.setProperty('--mx',(m.offsetLeft)+'px');
     if(i%3!==1){const names=['João da Silva','Carlos Pereira','Antônio Souza','Raimundo Lima','José Ferreira'];const nm=names[i%5];const s=document.createElement('span');s.className='mo';b.classList.add('wm');
       s.innerHTML=k==='2'?IC+nm:nm;b.appendChild(s)}})},[k,css,IC]);
 await pg.screenshot({path:`m2-${sc}-${k}.png`,clip:{x:0,y:90,width:390,height:330}});await pg.close()}
await b.close()})();
