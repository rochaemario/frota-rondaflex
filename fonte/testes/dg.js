const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();
await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp},[seed,'admin']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto('http://frota.test/');await p.waitForTimeout(800);
await p.fill('#lg-m','mario@x.com');await p.fill('#lg-p','ok');await p.click('#lg-b');await p.waitForTimeout(1500);
const FP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11c0 3.5-.6 6.4-2 9"/><path d="M8.6 7.6A5 5 0 0 1 17 11c0 2-.2 3.8-.6 5.5"/><path d="M7 11a5 5 0 0 1 .4-2"/><path d="M15 12c0 2.6-.4 5-1.2 7"/><path d="M9 12.5c0 2-.3 3.8-.9 5.4"/><path d="M5.2 15.5c.5-1.4.8-2.9.8-4.5a6 6 0 0 1 9.8-4.6"/><path d="M18.8 8.5c.4.8.7 1.6.9 2.5"/><path d="M12 15c0 1.8-.2 3.5-.6 5"/></svg>';
await p.addStyleTag({content:`.dg-r{display:flex;align-items:center;gap:12px;padding:10px 0 2px;border-top:1px solid var(--line)}.dg-r div{flex:1}.dg-r b{display:block;font-size:14.5px}.dg-r small{font-size:12.5px;color:var(--muted)}
.sw{width:46px;height:28px;border-radius:14px;background:var(--accent,#0033a0);position:relative;flex:none}.sw:after{content:'';position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3)}.sw.off{background:#c9cfda}.sw.off:after{right:auto;left:3px}
.lk{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:0 24px 40px}
.lk-i{width:96px;height:96px;border-radius:50%;background:#e4e9f4;color:var(--accent,#0033a0);display:flex;align-items:center;justify-content:center}.lk-i svg{width:54px;height:54px}
.lk h1{font-family:var(--display);font-size:24px;text-transform:uppercase;letter-spacing:.02em;margin:6px 0 0}.lk p{margin:0;color:var(--muted);font-size:14px;max-width:280px}
.lk .btn{width:100%;max-width:320px;margin-top:10px}.lk-l{background:none;border:0;color:var(--accent);font:inherit;font-size:14px;font-weight:600;padding:6px}`});
// 1 popover
await p.evaluate(()=>document.getElementById('sync').click());await p.waitForTimeout(200);
await p.evaluate(()=>{const a=document.getElementById('acct');const r=document.createElement('div');r.className='dg-r';r.innerHTML='<div><b>Entrar com digital</b><small>Pede a digital ao abrir o app</small></div><span class="sw off"></span>';a.insertBefore(r,a.querySelector('#ac-out'))});
await p.screenshot({path:'dg1.png'});
// 2 ligar: confirmação
await p.evaluate(()=>{document.querySelector('.sw').classList.remove('off')});
await p.evaluate(()=>{const t=document.createElement('div');t.className='toast';t.innerHTML='<b class="toast-t">Digital ativada</b><span>O app vai pedir a digital ao abrir</span>';document.body.appendChild(t)});
await p.screenshot({path:'dg2.png'});
// 3 tela de bloqueio
await p.evaluate(FP=>{document.getElementById('acct')?.remove();document.querySelectorAll('.toast').forEach(t=>t.remove());const o=document.createElement('div');o.className='lg';o.innerHTML=`<div class="lg-top"><div class="brand"><i></i>Controle de Frota</div></div><div class="lk"><div class="lk-i">${FP}</div><h1>App bloqueado</h1><p>Use a digital para abrir o Controle de Frota.</p><button class="btn pri">Desbloquear</button><button class="lk-l">Entrar com e-mail e senha</button></div>`;document.body.appendChild(o)},FP);
await p.screenshot({path:'dg3.png'});
await b.close()})();
