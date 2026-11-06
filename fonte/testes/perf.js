const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const N=+process.argv[2]||1;// fator
// 100 equipamentos
const eqs=Object.keys(seed).filter(k=>k.startsWith('equipamentos/'));let c=0;
while(Object.keys(seed).filter(k=>k.startsWith('equipamentos/')).length<100){const b=seed[eqs[c%eqs.length]];const id='X'+(++c);seed['equipamentos/'+id]={...JSON.parse(JSON.stringify(b)),codigo:'X-'+String(c).padStart(2,'0')}}
const ids=Object.keys(seed).filter(k=>k.startsWith('equipamentos/')).map(k=>k.split('/')[1]);const st=Object.keys(seed).filter(k=>k.startsWith('estoque/')).map(k=>k.split('/')[1]);
const day=i=>{const d=new Date(2025,0,1);d.setDate(d.getDate()+i%650);return d.toISOString().slice(0,10)};
for(let i=0;i<2000*N;i++){const e=ids[i%ids.length];seed['trocas/t'+i]={equipId:e,data:day(i),horimetro:1000+i,resp:'',obs:'',proximaH:'',itens:[{pid:'p1',desc:'Filtro óleo motor',espec:'462-1171',qtd:1,un:'un',estoqueId:st[i%st.length]},{pid:'p2',desc:'Óleo do motor',espec:'15W40',qtd:16,un:'L'}]}}
for(let i=0;i<14000*N;i++){seed['movs/m'+i]={estoqueId:st[i%st.length],tipo:i%5?'saida':'entrada',qtd:1,data:day(i),obs:'',equipId:ids[i%ids.length],origem:'preventiva',saldo:3,ts:i}}
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/*fonts.googleapis.com*',r=>r.abort());const cdp=await pg.context().newCDPSession(pg);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const t0=Date.now();
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 await pg.waitForSelector('#sec-painel',{timeout:60000});console.log('abrir app (ms)',Date.now()-t0);
 const T=async(lbl,fn,sel)=>{const s=Date.now();await fn();if(sel)await pg.waitForSelector(sel);await pg.waitForTimeout(50);console.log(lbl,Date.now()-s-50)};
 await pg.evaluate(()=>{window.__rt=[];const r=window.render;});
 await T('abrir Equipamentos',()=>pg.click('[data-acc="equip"]'),'[data-eq]');
 await T('ficha equipamento',()=>pg.click('[data-eq]'),'#sheet');
 await pg.evaluate(()=>document.querySelector('header').click());
 await T('abrir Preventivas',()=>pg.click('[data-acc="manut"]'),'[data-hist]');
 await T('histórico eq',()=>pg.click('[data-hist]'),'#sheet');
 await pg.evaluate(()=>document.querySelector('header').click());
 await T('abrir Estoque',()=>pg.click('[data-acc="estoque"]'),'[data-mov]');
 await T('item estoque',()=>pg.click('[data-mov]'),'#sheet');
 await pg.evaluate(()=>document.querySelector('header').click());
 await T('Horímetros',()=>pg.click('#sidehm'),'.lr');
 await pg.evaluate(()=>document.querySelector('header').click());
 // cpu: tempo de um render completo
 const rt=await pg.evaluate(()=>{const a=performance.now();for(let i=0;i<5;i++)document.querySelector('header').click();return (performance.now()-a)/5});console.log('render home (ms)',Math.round(rt));
 console.log('ERR',errs.length);await b.close()})();
