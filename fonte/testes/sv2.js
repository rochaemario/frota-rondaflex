const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
const CHK='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const KB=`<div class="xkb">${['qwertyuiop','asdfghjkl','zxcvbnm'].map((r,i)=>`<div class="xr">${i==2?'<span class="k w">⇧</span>':''}${[...r].map(c=>`<span class="k">${c}</span>`).join('')}${i==2?'<span class="k w">⌫</span>':''}</div>`).join('')}<div class="xr"><span class="k w">?123</span><span class="k">,</span><span class="k sp"></span><span class="k">.</span><span class="k w ok">↵</span></div></div>`;
const CSS=`.xkb{position:fixed;left:0;right:0;bottom:0;background:#e3e6ec;padding:8px 4px 18px;z-index:99999;box-shadow:0 -1px 0 #cfd3da}
.xr{display:flex;gap:4px;background:none!important;box-shadow:none!important;padding:0!important;justify-content:center;margin:7px 0}.xr .k{flex:0 0 32px;height:42px;background:#fff;border-radius:6px;display:grid;place-items:center;font:400 19px Roboto,sans-serif;color:#1f2430;box-shadow:0 1px 0 #b9bec8}
.xr .k.w{flex:0 0 46px;background:#cdd2db;font-size:15px}.xr .k.sp{flex:0 0 170px}.xr .k.ok{background:#0033a0;color:#fff}
#sheet .sh-foot{display:none!important}
.va{margin-left:auto;display:inline-flex;align-items:center;gap:7px;background:var(--accent,#0033a0);color:#fff;border:0;border-radius:999px;padding:10px 16px 10px 13px;font:600 15px var(--body);box-shadow:0 4px 12px rgba(0,51,160,.28)}
.vb{display:flex;gap:10px;padding:2px 16px 12px}.vb button{border-radius:12px;font:600 15px var(--body);padding:12px;border:0}
.vb .c{background:#eef1f6;color:var(--ink,#0b2470);flex:0 0 auto;padding:12px 18px}.vb .s{flex:1;background:var(--accent,#0033a0);color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(0,51,160,.22)}
.vc{margin-left:auto;display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:none;font:600 11px var(--body);color:var(--accent,#0033a0)}.vc i{width:46px;height:46px;border-radius:50%;background:var(--accent,#0033a0);color:#fff;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,51,160,.3)}
.vd{margin-left:auto;border:0;background:none;color:var(--accent,#0033a0);font:700 17px var(--body);padding:10px 4px;display:inline-flex;align-items:center;gap:6px}.vd em{width:8px;height:8px;border-radius:50%;background:#e0a100;display:inline-block}`;
const V={a:`h.insertAdjacentHTML('beforeend','<button class="va">${CHK}Salvar</button>')`,
 b:`t.insertAdjacentHTML('beforeend','<div class="vb"><button class="c">Cancelar</button><button class="s">${CHK}Salvar equipamento</button></div>')`,
 c:`h.insertAdjacentHTML('beforeend','<button class="vc"><i>${CHK.replace('18','22').replace('18','22')}</i>Salvar</button>')`,
 d:`h.insertAdjacentHTML('beforeend','<button class="vd"><em></em>Salvar</button>')`};
(async()=>{const b=await chromium.launch();
for(const [k,js] of Object.entries(V)){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}'+CSS+'</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1400);await p.evaluate(()=>window.__al('fe:CB-08'));await p.waitForTimeout(900);
await p.evaluate(`(()=>{const h=document.querySelector('#sheet .sh-head'),t=document.querySelector('#sheet .sh-top');${js};const i=document.querySelector('#e-modelo')||document.querySelector('#sheet input');i&&i.focus();document.body.insertAdjacentHTML('beforeend',${JSON.stringify(KB)})})()`);
await p.waitForTimeout(400);await p.screenshot({path:'v'+k+'.png'});await p.close()}
await b.close()})();
