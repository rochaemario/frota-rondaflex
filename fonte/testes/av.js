const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const FOTO='data:image/png;base64,'+fs.readFileSync('foto.b64','utf8');
const CSS=`
.bell{position:relative;background:none;border:0;color:#fff;padding:6px;margin-right:6px;cursor:pointer;display:flex}.bell svg{width:22px;height:22px}
.bell i{position:absolute;top:0;right:-2px;min-width:17px;height:17px;border-radius:9px;background:#e8112d;color:#fff;font:700 11px/17px system-ui;text-align:center;font-style:normal;padding:0 4px;box-shadow:0 0 0 2px var(--ink,#0b2470)}
.top{gap:6px}.top .brand{margin-right:auto;white-space:nowrap;font-size:19px}
.av-tabs{display:grid;grid-template-columns:1fr 1fr;background:var(--sunk);border:1px solid var(--line);border-radius:12px;padding:3px;gap:3px;margin-bottom:12px}
.av-tabs b{min-height:38px;display:flex;align-items:center;justify-content:center;border-radius:9px;font-size:14.5px;color:var(--muted);font-weight:600}.av-tabs b.on{background:var(--surface);color:var(--fg);box-shadow:var(--shadow)}
.av-r{display:flex;gap:12px;align-items:center;padding:12px 13px;position:relative}.av-r+.av-r{box-shadow:inset 0 1px 0 var(--line)}
.av-a{flex:none;width:40px;height:40px;border-radius:50%;background:#e4e9f4;color:#0033a0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.av-m{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.av-m .l1{display:flex;justify-content:space-between;gap:8px}.av-m b{font-size:14.5px}.av-m em{font-style:normal;font-size:12px;color:var(--muted)}
.av-m span{font-size:13.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.av-r.nv .av-m span{color:var(--fg);font-weight:500}
.av-t{flex:none;width:40px;height:40px;border-radius:8px;border:1px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}.av-t img{max-width:34px;max-height:34px}
.av-dot{position:absolute;left:4px;top:50%;width:7px;height:7px;border-radius:50%;background:#0033a0;transform:translateY(-50%)}
.pl{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:999px;white-space:nowrap}.pl.n{background:#e4e9f4;color:#0033a0}.pl.v{background:#fff3cc;color:#8a6400}.pl.r{background:#dff5e7;color:#127a3e}
.av-h{display:flex;align-items:center;gap:12px;margin-bottom:12px}.av-h div{display:flex;flex-direction:column}.av-h b{font-size:15px}.av-h small{font-size:12.5px;color:var(--muted)}
.bub{background:var(--surface);border-radius:16px 16px 16px 4px;padding:13px 14px;font-size:15px;line-height:1.45;box-shadow:var(--shadow)}
.bub.me{border-radius:16px 16px 4px 16px;background:#e4e9f4;margin-left:40px}
.icard{display:flex;gap:12px;align-items:center;background:var(--surface);border-radius:14px;padding:12px;margin-top:10px;border:1px solid var(--line)}
.icard .ph{flex:none;width:64px;height:64px;border-radius:10px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;background:#fff}.icard .ph img{max-width:56px;max-height:56px}
.icard .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.icard b{font-size:14.5px}.icard small{font-size:12.5px;color:var(--muted)}.icard .num{font-family:var(--mono)}
.icard .sd{display:flex;gap:10px;font-size:12.5px}.icard .sd b{font-size:12.5px;color:#d6002e}
.thr{display:flex;flex-direction:column;gap:8px;margin-top:14px}.thr small{font-size:11.5px;color:var(--muted);text-align:right}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{display:flex;align-items:center;gap:7px;padding:7px 12px 7px 7px;border-radius:999px;background:var(--sunk);border:1px solid var(--line);font-size:14px;font-weight:500}
.chip.on{background:#0033a0;color:#fff;border-color:#0033a0}.chip .av-a{width:26px;height:26px;font-size:11px}.chip.on .av-a{background:#fff}
.sidetab-av{position:fixed;right:0;top:470px;z-index:15;writing-mode:vertical-rl;transform:rotate(180deg);background:#fff;border:1px solid var(--line);border-right:0;border-radius:12px 0 0 12px;padding:14px 8px;font-weight:700;font-size:14px;color:var(--fg);display:flex;align-items:center;gap:8px;box-shadow:var(--shadow)}
.sidetab-av i{writing-mode:horizontal-tb;transform:rotate(180deg);background:#e8112d;color:#fff;font-style:normal;font-size:11px;border-radius:9px;min-width:18px;height:18px;line-height:18px;text-align:center}
.lbl2{font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:16px 2px 8px}
`;
const BELL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);await p.addStyleTag({content:CSS});
const shot=async n=>{await p.waitForTimeout(700);await p.screenshot({path:'av-'+n+'.png'})};
const sheet=(title,sub,body,foot)=>p.evaluate(([t,s,bd,f])=>{const sh=document.getElementById('sheet');sh.innerHTML=`<div class="sh-top"><div class="grab"></div><div class="sh-head"><button class="backbtn">‹</button><div class="sh-tt"><h2><span class="tt-x">${t}</span></h2><div class="sub">${s}</div></div></div></div><div class="sh-body">${bd}</div>${f?`<div class="sh-foot">${f}</div>`:''}`;document.getElementById('scrim').hidden=false;
  const bb=sh.querySelector('.backbtn');bb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><path d="M15 6l-6 6 6 6"/></svg>'},[title,sub,body,foot]);
const close=()=>p.evaluate(()=>{document.getElementById('scrim').hidden=true;document.getElementById('sheet').innerHTML=''});
// A: sino no topo
await p.evaluate(B=>{const s=document.getElementById('sync');const x=document.createElement('button');x.className='bell';x.innerHTML=B+'<i>2</i>';s.before(x)},BELL);
await shot('A1-home');
const card=`<div class="icard"><div class="ph"><img src="${FOTO}"></div><div class="tx"><b>Filtro óleo motor</b><small class="num">322-3155 · Cat</small><div class="sd"><span>Saldo <b>0 un</b></span><span>Mínimo 1</span><span>EH-01</span></div></div></div>`;
const row=(ini,nm,msg,t,st,nv,thumb)=>`<div class="av-r${nv?' nv':''}">${nv?'<span class="av-dot"></span>':''}<span class="av-a">${ini}</span><span class="av-m"><span class="l1"><b>${nm}</b><em>${t}</em></span><span>${msg}</span><span style="margin-top:3px"><span class="pl ${st[0]}">${st[1]}</span></span></span>${thumb?`<span class="av-t"><img src="${FOTO}"></span>`:''}</div>`;
await sheet('Avisos','2 novos',`<div class="av-tabs"><b class="on">Recebidos</b><b>Enviados</b></div><div class="list">${row('MR','Mario','Comprar 322-3155 · Filtro óleo motor, saldo 0','16:40',['n','Novo'],1,1)}${row('AL','Ana · Almoxarifado','Chegaram os filtros da PC-03, já dei entrada','14:12',['n','Novo'],1,0)}${row('CJ','Carlos · Compras','Lista de compra · 5 itens','ontem',['v','Visto'],0,1)}${row('MR','Mario','Óleo 15W-40 acabando, ver cotação','20/10',['r','Resolvido'],0,0)}</div>`);
await shot('A2-lista');
await sheet('Aviso','De Mario · hoje 16:40',`<div class="av-h"><span class="av-a">MR</span><div><b>Mario</b><small>Para Carlos · Compras</small></div><span class="pl n" style="margin-left:auto">Novo</span></div><div class="bub">Carlos, o filtro de óleo da EH-01 zerou. Compra 2 unidades, por favor. A preventiva vence em 40 h.</div>${card}
  <div class="thr"><div class="bub me">Pedido feito, chega sexta.</div><small>Carlos · 16:52</small></div>`,`<button class="btn">Responder</button><button class="btn pri" style="flex:1">Marcar como resolvido</button>`);
await shot('A3-aberta');
await sheet('Avisar','Filtro óleo motor · 322-3155',`<div class="lbl2" style="margin-top:4px">Para</div><div class="chips"><span class="chip on"><span class="av-a">CJ</span>Carlos · Compras</span><span class="chip"><span class="av-a">AL</span>Ana · Almoxarifado</span><span class="chip"><span class="av-a">PS</span>Pedro · Oficina</span></div>
  <div class="lbl2">Mensagem</div><div class="fset"><textarea style="min-height:110px">Comprar 322-3155 · Filtro óleo motor. Saldo 0, mínimo 1.</textarea></div><div class="lbl2">Anexado</div>${card}`,`<button class="btn pri" style="flex:1">Enviar aviso</button>`);
await shot('A4-escrever');
await close();
// B: aba lateral
await p.evaluate(()=>document.querySelector('.bell').remove());
await p.evaluate(()=>{const t=document.createElement('div');t.className='sidetab-av';t.innerHTML='<i>2</i>Avisos';document.body.appendChild(t)});
await shot('B1-aba');
await p.evaluate(()=>document.querySelector('.sidetab-av').remove());
// C: no painel
await p.evaluate(()=>{const tabs=document.querySelector('.pnb')?.parentElement?.querySelector('.seg, [role=tablist], .pn-tabs');return !!tabs});
await p.evaluate(()=>{const pn=document.querySelector('.pnb');if(!pn)return;const card=pn.parentElement;const tb=[...card.querySelectorAll('button')].find(b=>/Estoque/.test(b.textContent));if(tb){const n=tb.cloneNode(true);n.innerHTML='Avisos <b style="color:#e8112d;margin-left:6px">2</b>';tb.parentElement.style.gridTemplateColumns='1fr 1fr 1fr';tb.after(n)}});
await shot('C1-painel');
await b.close()})();
