const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const FOTO='data:image/png;base64,'+fs.readFileSync('foto.b64','utf8');
const CSS2=`
.anx{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.anx b{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border-radius:12px;background:var(--surface);border:1px dashed #9fb0d6;color:#0033a0;font-size:13.5px;font-weight:600}.anx svg{width:22px;height:22px}
.icard{position:relative}.icard .x{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;background:var(--sunk);display:flex;align-items:center;justify-content:center;color:var(--muted);font-weight:700}
.ecard .ph{background:#e4e9f4;color:#0033a0;font:700 15px var(--mono)}
.srch2{position:relative}.srch2 input{min-height:54px;font-size:16.5px;background:#fff;border:2px solid #0033a0;box-shadow:0 4px 14px rgba(11,36,112,.12);padding-left:44px;width:100%;border-radius:14px}
.srch2 svg{position:absolute;left:15px;top:17px;width:20px;height:20px;color:#0033a0}
.sugx{position:absolute;left:0;right:0;top:62px;z-index:30;background:#fff;border:1px solid var(--line-2);border-radius:14px;box-shadow:0 12px 30px rgba(10,21,16,.2);padding:6px}
.sgr{display:flex;align-items:center;gap:12px;padding:9px 8px;border-radius:10px}.sgr+.sgr{box-shadow:inset 0 1px 0 var(--line)}.sgr .ph{width:44px;height:44px;border-radius:8px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center}.sgr img{max-width:38px;max-height:38px}
.sgr div{flex:1;min-width:0;display:flex;flex-direction:column}.sgr b{font-size:14.5px}.sgr small{font-size:12.5px;color:var(--muted);font-family:var(--mono)}
.camb svg{width:20px;height:20px}.camb{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border:1.5px solid #0033a0;border-radius:14px;color:#0033a0;font-weight:600;background:#fff;margin-top:10px}
.hbtn{margin-left:auto;display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:#e4e9f4;color:#0033a0;font-weight:600;font-size:13.5px}.hbtn svg{width:18px;height:18px}
.tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:#0033a0;color:#fff;border-radius:6px;padding:3px 8px;margin-bottom:8px}
`;
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

await p.addStyleTag({content:CSS2});
await p.evaluate(B=>{const s=document.getElementById('sync');const x=document.createElement('button');x.className='bell';x.innerHTML=B+'<i>2</i>';s.before(x)},BELL);
const IC={it:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
 eq:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h13l3-5h-6l-2-4H6z"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>',
 ft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 se:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'};
const card=(x)=>`<div class="icard"><div class="ph"><img src="${FOTO}"></div><div class="tx"><b>Filtro óleo motor</b><small class="num">322-3155 · Cat</small><div class="sd"><span>Saldo <b>0 un</b></span><span>Mínimo 1</span><span>EH-01</span></div></div>${x?'<span class="x">✕</span>':''}</div>`;
const ecard=`<div class="icard ecard"><div class="ph">EH-01</div><div class="tx"><b>Escavadeira hidráulica</b><small>Caterpillar 320GX · SYW01032</small><div class="sd" style="color:var(--muted)"><span>Última leitura 8.463 h · 22/10</span></div></div><span class="x">✕</span></div>`;
const row=(ini,nm,msg,t,st,nv,thumb)=>`<div class="av-r${nv?' nv':''}">${nv?'<span class="av-dot"></span>':''}<span class="av-a">${ini}</span><span class="av-m"><span class="l1"><b>${nm}</b><em>${t}</em></span><span>${msg}</span><span style="margin-top:3px"><span class="pl ${st[0]}">${st[1]}</span></span></span>${thumb?`<span class="av-t"><img src="${FOTO}"></span>`:''}</div>`;
const chips=on=>`<div class="lbl2" style="margin-top:4px">Para</div><div class="chips"><span class="chip${on?' on':''}"><span class="av-a">CJ</span>Carlos · Compras</span><span class="chip"><span class="av-a">AL</span>Ana · Almoxarifado</span><span class="chip"><span class="av-a">PS</span>Pedro · Oficina</span></div>`;
const anx=`<div class="anx"><b>${IC.it}Item</b><b>${IC.eq}Equipamento</b><b>${IC.ft}Foto</b></div>`;
// 1 lista com botão escrever
await sheet('Avisos','2 novos',`<div class="av-tabs"><b class="on">Recebidos</b><b>Enviados</b></div><div class="list">${row('MR','Mario','Comprar 322-3155 · Filtro óleo motor, saldo 0','16:40',['n','Novo'],1,1)}${row('AL','Ana · Almoxarifado','Chegaram os filtros da PC-03, já dei entrada','14:12',['n','Novo'],1,0)}${row('CJ','Carlos · Compras','Lista de compra · 5 itens','ontem',['v','Visto'],0,1)}</div>`,`<button class="btn pri" style="flex:1">Escrever aviso</button>`);
await shot('E1-lista');
// 2 escrever em branco
await sheet('Novo aviso','Mensagem para a equipe',`${chips(0)}<div class="lbl2">Mensagem</div><div class="fset"><textarea style="min-height:110px" placeholder="Escreva o aviso"></textarea></div><div class="lbl2">Anexar (opcional)</div>${anx}`,`<button class="btn pri" style="flex:1;opacity:.45">Enviar aviso</button>`);
await shot('E2-novo');
// 3 anexar item: busca no lugar
await sheet('Novo aviso','Mensagem para a equipe',`${chips(1)}<div class="lbl2">Mensagem</div><div class="fset"><textarea style="min-height:80px">Carlos, precisamos destes para a preventiva da EH-01.</textarea></div><div class="lbl2">Anexar item</div>
  <div class="srch2">${IC.se}<input value="322"><div class="sugx"><div class="sgr"><span class="ph"><img src="${FOTO}"></span><div><b>Filtro óleo motor</b><small>322-3155 · saldo 0</small></div></div><div class="sgr"><span class="ph"><img src="${FOTO}"></span><div><b>Filtro combustível</b><small>322-3156 · saldo 3</small></div></div></div></div>
  <div class="camb" style="margin-top:156px">${IC.ft}Anexar item pela câmera</div>`,`<button class="btn pri" style="flex:1">Enviar aviso</button>`);
await shot('E3-anexar');
// 4 pronto com 2 anexos
await sheet('Novo aviso','Mensagem para a equipe',`${chips(1)}<div class="lbl2">Mensagem</div><div class="fset"><textarea style="min-height:80px">Carlos, precisamos destes para a preventiva da EH-01.</textarea></div><div class="lbl2">Anexados · 2</div>${card(1)}${ecard}<div class="lbl2">Anexar mais</div>${anx}`,`<button class="btn pri" style="flex:1">Enviar aviso</button>`);
await shot('E4-pronto');
// 5 item: botão Avisar no cabeçalho
await close();await p.waitForTimeout(300);
await p.click('[data-acc="estoque"]');await p.waitForTimeout(400);await p.click('#es-rel');await p.waitForTimeout(300);
await p.evaluate(()=>document.querySelector('[data-mov]').click());await p.waitForTimeout(800);
await p.evaluate(BL=>{const h=document.querySelector('#sheet .sh-head');const b=document.createElement('span');b.className='hbtn';b.innerHTML=BL+'Avisar';h.appendChild(b)},BELL);
await shot('E5-item-topo');
await p.evaluate(()=>{document.querySelector('#sheet .hbtn').remove();const sh=document.getElementById('sheet');const f=document.createElement('div');f.className='sh-foot';f.innerHTML='<button class="btn" style="flex:1;border:1.5px solid #0033a0;color:#0033a0;background:#fff">Avisar sobre este item</button>';sh.appendChild(f)});
await shot('E6-item-rodape');
await b.close()})();
