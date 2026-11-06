const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const papel=process.argv[2]||'admin';
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('C '+m.text())});
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp;const N=Date.now();
 window.__AVISOS=[{id:'a1',de:'u2',para:['u1'],texto:'Filtro separador do CB-05 acabou. Pode pedir 2?',anexos:[{t:'item',id:'cat-526-3121'}],ts:N-26*3600e3,estado:{u1:'visto'},lido_u1:N-25*3600e3,entr_u1:N-25*3600e3,
   resp:[{de:'u1',texto:'Vou ver o saldo.',ts:N-25*3600e3},{de:'u2',texto:'Ja confirmei com a Sotreq, chega sexta.',ts:N-3600e3},{de:'u2',texto:'Deixa separado o do CB-17 tambem.',ts:N-1800e3}]},
  {id:'a2',de:'u1',para:['u2','u3'],texto:'Horimetro do PC-02 parado',anexos:[],ts:N-5000e3,estado:{u2:'visto'},resp:[]}]},[seed,papel]);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
const W=ms=>p.waitForTimeout(ms||500);
await p.goto('http://frota.test/');await W(800);await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await W(1800);
console.log('sino:',await p.evaluate(()=>document.querySelector('#bell i')?.textContent),await p.evaluate(()=>!document.querySelector('#bell i')?.hidden));
await p.click('#bell');await W(700);await p.screenshot({path:'chat1.png'});
console.log('lista:',await p.$$eval('.av-r',a=>a.map(x=>x.innerText.replace(/\s+/g,' '))));
await p.click('[data-av="a1"]');await W(900);
const CSS=`.xa{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;width:260px}
.xa .h{display:flex;gap:10px;align-items:center;padding:10px}.xa .ph{flex:none;width:52px;height:52px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center;font-size:9px;color:var(--faint);text-align:center;background:#fff}
.xa .t{min-width:0;display:flex;flex-direction:column;gap:2px}.xa .t b{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xa .t small{font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xa .g{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line)}.xa .g div{padding:7px 8px;display:flex;flex-direction:column;gap:1px;min-width:0}.xa .g div+div{border-left:1px solid var(--line)}
.xa .g span{font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}.xa .g b{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--mono)}.xa .g b.bad{color:#c4001f}
.xa .ac{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}.xa .ac button{min-height:42px;border:0;background:#fff;font:inherit;font-size:13.5px;font-weight:600;color:var(--accent)}.xa .ac button+button{border-left:1px solid var(--line)}.xa .ac button.pri{background:var(--accent);color:#fff}
.xb{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:12px;width:260px;overflow:hidden}
.xb .r{display:flex;gap:10px;align-items:center;padding:10px}.xb .q{flex:none;width:52px;height:52px;border-radius:12px;background:#fbe3df;color:#a8231c;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}.xb .q b{font:600 19px var(--mono)}.xb .q small{font-size:11px;font-weight:600}
.xb .t{min-width:0;display:flex;flex-direction:column;gap:2px}.xb .t b{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xb .t small{font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap}
.xb .ff{display:flex;justify-content:space-between;gap:8px;padding:7px 10px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}.xb .ff b{color:var(--fg);font-weight:600}
.xb .ok{padding:7px 10px;border-top:1px solid var(--line);font-size:12.5px;font-weight:600;color:#127a3e;background:#f1faf4}
.sk-l{font:700 12px system-ui;color:#fff;background:#0b2470;display:inline-block;padding:3px 9px;border-radius:7px;margin:8px 0 4px}`;
await p.addStyleTag({content:CSS});
const A=`<div class="xa"><div class="h"><span class="ph">Foto</span><span class="t"><b>Filtro ar motor – externo</b><small>526-3121 · Cat</small></span></div><div class="g"><div><span>Saldo</span><b class="bad">1 un</b></div><div><span>Minimo</span><b>1 un</b></div><div><span>Encaixe</span><b>PC-02</b></div></div><div class="ac"><button class="pri">+ Lista de compra</button><button>Ver item</button></div></div>`;
const B=`<div class="xb"><div class="r"><span class="q"><b>1</b><small>un</small></span><span class="t"><b>Filtro ar motor – externo</b><small>526-3121 · Cat</small></span></div><div class="ff"><span>Minimo <b>1 un</b></span><span>Encaixe <b>PC-02</b></span></div><div class="ok">✓ Na lista de compra</div></div>`;
await p.evaluate(([A,B])=>{const ax=document.querySelector('.cb-ax');ax.querySelector('.cb-b').innerHTML='<span class="sk-l">A · Cartao com colunas (tocado: botoes)</span>'+A+'<span class="cb-t">21:43</span>';
  const c=ax.cloneNode(true);c.querySelector('.cb-b').innerHTML='<span class="sk-l">B · Padrao da lista do estoque (ja na lista)</span>'+B+'<span class="cb-t">21:43</span>';ax.after(c);ax.scrollIntoView({block:'start'})},[A,B]);await W(300);
await p.screenshot({path:'axsk.png'});await b.close()})();
