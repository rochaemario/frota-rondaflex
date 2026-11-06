const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
await p.click('[data-acc="estoque"]');await W();await p.click('[data-estab="fil"]');await W(800);
const rows=await p.$$eval('#ef-res .es-r',a=>a.slice(0,4).map(x=>x.outerHTML).join(''));
const chev='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 6l6 6-6 6"/></svg>';
const down='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M6 9l6 6 6-6"/></svg>';
const sum=`<div class="ef-sum" style="margin-top:10px"><div><b class="num">9</b><span>Tipos de itens</span></div><div><b class="num">16 un</b><span>Em estoque</span></div><div class="w"><b class="num">5</b><span>Abaixo do minimo</span></div></div>`;
const CSS=`.xr{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 14px;background:#fff;border-bottom:1px solid var(--line)}.xr:last-child{border-bottom:0}.xr b{flex:1;font-size:15px;font-weight:600}.xr span{font-size:14px;color:var(--muted)}.xr span.on{color:var(--accent);font-weight:600}.xr svg{color:var(--muted)}
.xb{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:10px}.xo{padding:4px 14px 14px;background:#fff;border-bottom:1px solid var(--line)}
.qc{display:flex;gap:6px;overflow-x:auto;margin:10px -14px 0;padding:0 14px;scrollbar-width:none}.qc .ef-c{flex:0 0 auto}
.tg{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tg span{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 6px 0 12px;border-radius:999px;background:var(--accent);color:#fff;font-size:13.5px;font-weight:500}.tg span i{font-style:normal;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;font-size:13px}
.sl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.sl label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:var(--muted);font-weight:600}.sl select{min-height:44px;border-radius:12px;border:1px solid var(--line);background:#fff;padding:0 10px;font:inherit;font-size:14.5px;color:var(--fg)}
.mais{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;margin-top:10px;border-radius:12px;border:1px dashed var(--line-2,#c9d1de);color:var(--accent);font-weight:600;font-size:14.5px;background:#fff}
.lab{font:700 13px system-ui;color:#fff;background:#0b2470;display:inline-block;padding:4px 10px;border-radius:8px;margin:6px 0 2px}
.cnt{display:flex;justify-content:space-between;align-items:center;margin:12px 2px 6px;font-size:13.5px;color:var(--muted)}`;
await p.addStyleTag({content:CSS});
const res=`<div class="cnt"><span>5 itens encontrados</span><button class="btn sm">Limpar</button></div><div class="es-blk es-res"><div class="es-l">${rows}</div></div>`;
const V={
A:`<div class="lab">A · Linhas expansiveis</div>`+sum+`<div class="xb">
<div class="xr"><b>Categoria</b><span class="on">Filtro, Oleo</span>${down}</div>
<div class="xo"><div class="ef-cs"><button class="ef-c" aria-pressed="true">Filtro</button><button class="ef-c">Kits</button><button class="ef-c" aria-pressed="true">Oleo</button><button class="ef-c">Graxa</button><button class="ef-c">Correia</button><button class="ef-c">Outros</button></div></div>
<div class="xr"><b>Saldo</b><span class="on">Abaixo do minimo</span>${chev}</div>
<div class="xr"><b>Equipamento</b><span>Todos</span>${chev}</div>
<div class="xr"><b>Marca e local</b><span>Todos</span>${chev}</div>
<div class="xr"><b>Movimento</b><span>Todos</span>${chev}</div>
<div class="xr"><b>Cadastro incompleto</b><span>—</span>${chev}</div>
<div class="xr"><b>Ordenar</b><span>A–Z</span>${chev}</div></div>`+res,
B:`<div class="lab">B · Atalhos + Mais opcoes</div>`+sum+`<div class="qc"><button class="ef-c" aria-pressed="true">Abaixo do minimo</button><button class="ef-c">Zerados</button><button class="ef-c">Parados 90 dias</button><button class="ef-c">Mais usados</button><button class="ef-c">Sem foto</button></div>
<div class="sl"><label>Categoria<select><option>Todas</option></select></label><label>Ordenar<select><option>A–Z</option></select></label></div>
<div class="mais">Mais opcoes ${down}</div>`+res,
C:`<div class="lab">C · Botao abre selecao em tela propria</div>`+sum+`<div class="tg"><span>Oleo <i>✕</i></span><span>Abaixo do minimo <i>✕</i></span><span>CB-05 <i>✕</i></span></div>`+res};
for(const [k,h] of Object.entries(V)){await p.evaluate(h=>{const f=document.getElementById('es-fil');f.innerHTML=h;(document.getElementById('scroller')||window).scrollTo(0,0)},h);await W(200);await p.screenshot({path:'esb'+k+'.png'})}
// C sheet mock
await p.evaluate(h=>{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:rgba(10,20,40,.45);z-index:999;display:flex;align-items:flex-end';d.innerHTML=h;document.body.appendChild(d)},`<div style="background:#eef1f6;width:100%;border-radius:22px 22px 0 0;padding:14px 16px 16px;max-height:78vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:20px">Filtrar estoque</b><button class="btn sm">Limpar</button></div><div class="xb">
<div class="xr"><b>Categoria</b><span class="on">Oleo</span>${chev}</div><div class="xr"><b>Saldo</b><span class="on">Abaixo do minimo</span>${chev}</div><div class="xr"><b>Equipamento</b><span class="on">CB-05</span>${chev}</div><div class="xr"><b>Marca e local</b><span>Todos</span>${chev}</div><div class="xr"><b>Movimento</b><span>Todos</span>${chev}</div><div class="xr"><b>Cadastro incompleto</b><span>—</span>${chev}</div><div class="xr"><b>Situacao</b><span>Ativos</span>${chev}</div><div class="xr"><b>Ordenar</b><span>A–Z</span>${chev}</div></div>
<button class="btn pri block" style="margin-top:14px;min-height:50px">Ver 5 itens</button></div>`);await W(200);await p.screenshot({path:'esbC2.png'});
await b.close()})();
