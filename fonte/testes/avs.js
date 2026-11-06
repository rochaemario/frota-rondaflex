const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
await p.click('#fab');await W(500);
const CSS=`.sk-lab{font:700 13px system-ui;color:#fff;background:#0b2470;display:inline-block;padding:4px 10px;border-radius:8px;margin:0 0 10px}
.ib{display:flex;flex-direction:column;background:#fff;border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}
.ig{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:14px 4px 6px;display:flex;justify-content:space-between}
.ir{display:flex;gap:11px;align-items:center;padding:12px 13px;position:relative}.ir+.ir{box-shadow:inset 0 1px 0 var(--line)}
.ir.nv{background:#f1f5ff}.ir.nv::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:4px;border-radius:0 3px 3px 0;background:var(--accent)}
.ir .m{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.ir .l1{display:flex;justify-content:space-between;gap:8px}.ir b{font-size:14.5px}.ir.nv b{font-weight:800}
.ir em{font-style:normal;font-size:12px;color:var(--muted)}.ir.nv em{color:var(--accent);font-weight:700}
.ir .p{font-size:13.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ir.nv .p{color:var(--fg);font-weight:600}
.tg2{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:999px}
.tg2.nw{background:var(--accent);color:#fff}.tg2.rs{background:#e4e9f4;color:var(--accent)}.tg2.ok{background:#dff5e7;color:#127a3e}.tg2.vi{background:#eef1f6;color:var(--muted)}
.cnt2{min-width:22px;height:22px;border-radius:11px;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center;padding:0 6px}
.hd{background:#fff;border-radius:14px;padding:12px 13px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px}
.hd .r1{display:flex;align-items:center;gap:10px}.hd .r1 div{flex:1}.hd .r1 b{display:block;font-size:15px}.hd .r1 small{font-size:12.5px;color:var(--muted)}
.ps{display:flex;flex-wrap:wrap;gap:6px}.ps span{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:4px 10px 4px 4px;border-radius:999px;background:#eef1f6}.ps span i{font-style:normal;width:22px;height:22px;border-radius:50%;background:#e4e9f4;color:var(--accent);display:grid;place-items:center;font-size:10px;font-weight:700}
.ps .lv{color:#127a3e;font-weight:600}.ps .ln{color:#8a4b00;font-weight:600}
.cv{display:flex;flex-direction:column;gap:4px;margin-top:12px}
.bb{max-width:84%;background:#fff;border-radius:16px 16px 16px 4px;padding:10px 13px;font-size:15px;line-height:1.4;box-shadow:var(--shadow)}
.bb.me{align-self:flex-end;background:#e4e9f4;border-radius:16px 16px 4px 16px}
.bb.nw{box-shadow:0 0 0 2px var(--accent)}
.mt{font-size:11.5px;color:var(--muted);margin:0 6px 8px}.mt.r{align-self:flex-end}.mt b{color:var(--accent)}
.dv{display:flex;align-items:center;gap:10px;margin:8px 0;color:var(--accent);font-size:12.5px;font-weight:700}.dv::before,.dv::after{content:"";flex:1;height:2px;background:var(--accent);opacity:.35}
.tl{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.tc{background:#fff;border-radius:14px;padding:11px 13px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:6px;border-left:4px solid transparent}
.tc.nw{border-left-color:var(--accent);background:#f6f8ff}.tc .h{display:flex;align-items:center;gap:8px}.tc .h b{font-size:14px}.tc .h em{font-style:normal;font-size:12px;color:var(--muted);margin-left:auto}
.tc p{margin:0;font-size:15px;line-height:1.4}.tc small{font-size:12px;color:var(--muted)}
.jump{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--accent);color:#fff;border-radius:12px;padding:10px 13px;font-size:14px;font-weight:600;margin-top:12px}.jump span{background:rgba(255,255,255,.2);border-radius:8px;padding:4px 10px}`;
await p.addStyleTag({content:CSS});
const av=t=>`<span class="av-a">${t}</span>`;
const V={
L:['Avisos','3 novos',`<div class="sk-lab">Lista de avisos</div><div class="seg av-tabs"><button aria-pressed="true">Recebidos <b class="av-c">3</b></button><button aria-pressed="false">Enviados</button></div>
<div class="ig"><span>Nao lidos</span><span>3</span></div><div class="ib">
<div class="ir nv">${av('JS')}<div class="m"><div class="l1"><b>Joao Silva</b><em>14:32</em></div><div class="p">Filtro do CB-05 chegou faltando a vedacao</div><div><span class="tg2 nw">Novo</span></div></div></div>
<div class="ir nv">${av('PA')}<div class="m"><div class="l1"><b>Paulo</b><em>11:05</em></div><div class="p">Paulo: ja confirmei com a Sotreq, chega sexta</div><div><span class="tg2 rs">2 respostas novas</span></div></div><span class="cnt2">2</span></div>
<div class="ir nv">${av('MR')}<div class="m"><div class="l1"><b>Marcos</b><em>ontem</em></div><div class="p">Horimetro do PC-02 parado</div><div><span class="tg2 nw">Novo</span></div></div></div></div>
<div class="ig"><span>Lidos · em aberto</span><span>2</span></div><div class="ib">
<div class="ir">${av('JS')}<div class="m"><div class="l1"><b>Joao Silva</b><em>27/10</em></div><div class="p">Oleo 15W40 abaixo do minimo</div><div><span class="tg2 vi">Lido</span></div></div></div>
<div class="ir">${av('PA')}<div class="m"><div class="l1"><b>Paulo</b><em>25/10</em></div><div class="p">Conferir pneu do VL-03</div><div><span class="tg2 vi">Lido</span></div></div></div></div>
<div class="ig"><span>Resolvidos</span><span>8 ›</span></div>`],
A:['Aviso','De Paulo · 11:05',`<div class="sk-lab">A · Conversa</div><div class="hd"><div class="r1">${av('PA')}<div><b>Paulo</b><small>Para Mario, Joao Silva</small></div><span class="tg2 rs">Em aberto</span></div>
<div class="ps"><span><i>MA</i>Mario <em class="lv">✓✓ lido</em></span><span><i>JS</i>Joao <em class="ln">✓ nao lido</em></span></div></div>
<div class="cv"><div class="bb">Filtro separador do CB-05 acabou. Pode pedir 2?</div><div class="mt">Paulo · 09:12</div>
<div class="bb me">Pedi hoje cedo, ja esta na lista de compra.</div><div class="mt r">Voce · 09:40 · <b>✓✓ lido por Paulo</b></div>
<div class="dv">2 novas mensagens</div>
<div class="bb nw">Ja confirmei com a Sotreq, chega sexta.</div><div class="mt">Paulo · 11:02</div>
<div class="bb nw">Deixa separado o do CB-17 tambem.</div><div class="mt">Paulo · 11:05</div></div>`],
B:['Aviso','De Paulo · 11:05',`<div class="sk-lab">B · Linha do tempo</div><div class="hd"><div class="r1">${av('PA')}<div><b>Paulo</b><small>Para Mario, Joao Silva</small></div><span class="tg2 rs">Em aberto</span></div>
<div class="ps"><span><i>MA</i>Mario <em class="lv">lido 11:06</em></span><span><i>JS</i>Joao <em class="ln">nao lido</em></span></div></div>
<div class="jump">2 mensagens novas desde sua ultima visita <span>Ver ↓</span></div>
<div class="tl"><div class="tc"><div class="h">${av('PA').replace('av-a','av-a sm')}<b>Paulo</b><span class="tg2 vi">Lida</span><em>09:12</em></div><p>Filtro separador do CB-05 acabou. Pode pedir 2?</p></div>
<div class="tc"><div class="h">${av('MA').replace('av-a','av-a sm')}<b>Voce</b><span class="tg2 ok">Lida por Paulo</span><em>09:40</em></div><p>Pedi hoje cedo, ja esta na lista de compra.</p></div>
<div class="tc nw"><div class="h">${av('PA').replace('av-a','av-a sm')}<b>Paulo</b><span class="tg2 nw">Nova</span><em>11:02</em></div><p>Ja confirmei com a Sotreq, chega sexta.</p></div>
<div class="tc nw"><div class="h">${av('PA').replace('av-a','av-a sm')}<b>Paulo</b><span class="tg2 nw">Nova</span><em>11:05</em></div><p>Deixa separado o do CB-17 tambem.</p></div></div>`]};
for(const [k,[t,s,body]] of Object.entries(V)){await p.evaluate(([t,s,body])=>{const sh=document.getElementById('sheet');const h=sh.querySelector('h2');if(h)h.textContent=t;const sb=sh.querySelector('.sh-head p,.sh-head .sub,.sh-sub');if(sb)sb.textContent=s;const b=sh.querySelector('.sh-body');b.innerHTML=body;b.scrollTop=0;let f=sh.querySelector('.sh-foot');if(!f){f=document.createElement('div');f.className='sh-foot';b.after(f)}f.hidden=false;f.innerHTML=t==='Avisos'?'<button class="btn pri" style="flex:1">Escrever aviso</button>':'<button class="btn">Responder</button><button class="btn pri" style="flex:1">Marcar como resolvido</button>'},[t,s,body]);await W(300);await p.screenshot({path:'avs'+k+'.png'})}
await b.close()})();
