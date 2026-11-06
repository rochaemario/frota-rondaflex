const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click('#sheet [data-m="est"]');await W();await p.click('#sheet [data-m="x:kit"]');await W();await p.click('#sheet [data-m="kit"]');await W();
await p.fill('#k-codigo','KIT-EH01-500');await p.fill('#k-desc','Preventiva 500 h · EH-01');
const S=`<style>.kb{position:relative;margin-top:10px}.kb .search{margin:0}.kb .search input{min-height:54px;font-size:16.5px;background:#fff;border:2px solid #0033a0;box-shadow:0 4px 14px rgba(11,36,112,.12);padding-left:44px}.kb .search svg{left:15px;width:20px;height:20px;color:#0033a0}
.ksg{position:absolute;left:0;right:0;top:62px;z-index:30;background:#fff;border:1px solid #d5dbe6;border-radius:14px;box-shadow:0 12px 30px rgba(10,21,16,.2);padding:6px}
.kl{background:var(--sunk);border-radius:14px;overflow:hidden;margin-top:12px}.kr{display:flex;align-items:center;gap:12px;padding:10px 12px}.kr+.kr{box-shadow:inset 0 1px 0 var(--line)}
.kr .n{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.kr .n b{font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kr .n small{font-family:var(--mono);font-size:12.5px;color:var(--muted)}
.kr input{width:64px;min-height:42px;text-align:right}.kr .u{font-size:13px;color:var(--muted);width:20px}.kr .x{width:30px;height:30px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:var(--muted);font-weight:700}
.kcad{display:block;padding:10px 12px;font-weight:600;color:#0033a0}</style>`;
const box=(q,sug,list)=>`${S}<div class="kb"><div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input value="${q}" placeholder="Codigo ou referencia do item"></div>${sug||''}</div>
<button type="button" class="btn block" style="margin-top:10px;border:1.5px solid #0033a0;color:#0033a0;background:#fff;display:flex;gap:8px;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>Adicionar item pela camera</button>${list||''}`;
const row=(n,c,q,u)=>`<div class="kr"><span class="n"><b>${n}</b><small>${c}</small></span><input value="${q}"><span class="u">${u}</span><span class="x">✕</span></div>`;
const set=async h=>{await p.evaluate(h=>{const f=[...document.querySelectorAll('#fk .fset')][1];f.innerHTML='<h3>Itens do kit</h3>'+h;f.scrollIntoView({block:'start'})},h);await W()};
await set(box('','',''));await p.screenshot({path:'km1.png'});
const sg=`<div class="ksg"><div class="tsec-l">${await p.evaluate(()=>'')}${['<b>Filtro oleo motor</b><br><small>322-3155 · saldo 0</small>','<b>Filtro combustivel - secundario</b><br><small>509-5694 · saldo 2</small>'].map((t,i)=>`<div class="es-r"><span class="es-b ${i?'ok':'bad'}"><b>${i?2:0}</b><small>un</small></span><span class="es-t"><span class="es-n">${i?'Filtro combustivel - secundario':'Filtro oleo motor'}</span><span class="es-c">${i?'509-5694':'322-3155'} · min 1</span></span></div>`).join('')}</div></div>`;
await set(box('322',sg,''));await p.screenshot({path:'km2.png'});
await set(box('',' ',`<div class="kl">${row('Filtro oleo motor','322-3155','1','un')}${row('Separador agua/combustivel','523-4987','1','un')}${row('Filtro ar motor - externo','479-8989','1','un')}${row('Oleo motor 15W-40','3E-9848','26','L')}</div>`));await p.screenshot({path:'km3.png'});
await set(box('7X-1234',`<div class="ksg"><div class="eqs-v" style="padding:12px;color:#556">Nenhum item encontrado no estoque.</div><span class="kcad">Cadastrar item 7X-1234</span></div>`,''));await p.screenshot({path:'km4.png'});
await b.close()})();
