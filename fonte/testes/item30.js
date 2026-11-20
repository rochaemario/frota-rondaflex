// Item 30: versao do app e "Procurar atualizacao" no rodape do menu (admin) e do menu da conta (mecanico).
// Uso: node item30.js  (le /tmp/vA = build atual e /tmp/vB = build com FROTA_V=v999; service worker registrado a mao em http://localhost)
const {chromium}=require('playwright');const fs=require('fs'),http=require('http'),path=require('path');
let mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
mock=mock.replace('then(res,rej){return run().then(res,rej)}',"then(res,rej){return (async()=>{while(window.__SBHOLD&&op!=='select')await new Promise(o=>setTimeout(o,100));return run()})().then(res,rej)}");
let DIR='/tmp/vA',hits=[];
const srv=http.createServer((q,r)=>{const u=new URL(q.url,'http://x');hits.push(u.pathname+u.search);
  if(u.pathname==='/sb.js'){r.setHeader('content-type','text/javascript');return r.end(mock)}
  let f=u.pathname==='/'?'/index.html':u.pathname;const fp=path.join(DIR,f);if(!fs.existsSync(fp)){r.statusCode=404;return r.end()}
  if(u.searchParams.has('vchk'))return setTimeout(()=>{let body=String(fs.readFileSync(fp));r.setHeader('content-type','text/html; charset=utf-8');r.end(body)},500);let body=fs.readFileSync(fp);if(f.endsWith('.html'))body=String(body).replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]+/,'/sb.js');
  r.setHeader('content-type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.webmanifest')?'application/manifest+json':'application/octet-stream');r.setHeader('cache-control','no-cache');r.end(body)}).listen(8702);
const seed={'equipamentos/EH-06':{codigo:'EH-06',tipo:'Escavadeira',alocacao:'DM1',area:'Planta',horimetro:6700,status:'ativo',itens:[]},'config/mecanicos':{lista:[{uid:'u1',nome:'Joao Silva',funcao:'Mecanico',mat:'101',ativo:true}]}};
let ok=0,bad=0;const R=(k,v,exp)=>{const pass=exp===undefined||JSON.stringify(v)===JSON.stringify(exp);pass?ok++:bad++;console.log((pass?'ok  ':'FALHA ')+k.padEnd(56),JSON.stringify(v))};
const OUTD='/home/claude/i30';fs.mkdirSync(OUTD,{recursive:true});
(async()=>{const b=await chromium.launch();
async function abre(papel){const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await ctx.addInitScript(([s,pp])=>{window.__SEED=s;window.__LOGGED=1;window.__PAPEL=pp;try{localStorage.setItem('frota.pinOk','u1')}catch(e){}},[seed,papel]);
  await p.goto('http://localhost:8702/');await p.waitForTimeout(1500);
  await p.evaluate(()=>navigator.serviceWorker.register('sw.js'));await p.waitForTimeout(800);await p.reload();await p.waitForTimeout(1800);
  return {ctx,p,errs}}
const linha=(p,s)=>p.evaluate(s=>{const e=document.querySelector(s);return e?{cls:e.className,t:e.innerText.replace(/\s+/g,' ').trim()}:null},s);
// ---------- admin
DIR='/tmp/vA';let {ctx,p,errs}=await abre('admin');
R('controlado pelo service worker',await p.evaluate(()=>!!navigator.serviceWorker.controller),true);
hits=[];await p.reload();await p.waitForTimeout(1800);const abriu=hits.filter(h=>/vchk/.test(h));R('abrir o app nao confere versao (nenhuma consulta a mais)',abriu.length,0);
await p.click('#fab');await p.waitForTimeout(500);
let L=await linha(p,'#vrl');R('menu: linha normal',L&&L.t,'v424 · Sincronizado Procurar atualizacao');
await p.screenshot({path:OUTD+'/1-menu.png'});
await p.click('#vrl [data-vp]');await p.waitForTimeout(60);R('tocar: Procurando...',(await linha(p,'#vrl')).t,'Procurando...');
await p.waitForTimeout(900);L=await linha(p,'#vrl');R('sem versao nova: Atualizado (verde)',[L.t,/vrl-ok/.test(L.cls)],['✓ Atualizado',true]);
await p.screenshot({path:OUTD+'/2-atualizado.png'});
await p.waitForTimeout(3200);R('volta ao normal',(await linha(p,'#vrl')).t,'v424 · Sincronizado Procurar atualizacao');
// sem internet
await ctx.setOffline(true);await p.waitForTimeout(300);await p.click('#vrl [data-vp]');await p.waitForTimeout(200);L=await linha(p,'#vrl');
R('sem internet: Sem internet (laranja)',[L.t,/vrl-off/.test(L.cls)],['Sem internet',true]);await p.screenshot({path:OUTD+'/3-sem-internet.png'});
await ctx.setOffline(false);await p.waitForTimeout(3300);
// versao nova com algo a enviar
DIR='/tmp/vB';await p.evaluate(()=>{window.__SBHOLD=true});
await p.evaluate(async()=>{const db=await window.claude.use('db');await db.doc('equipamentos/EH-07').set({codigo:'EH-07',tipo:'Escavadeira',status:'ativo',itens:[]})});await p.waitForTimeout(600);
L=await linha(p,'#vrl');R('com 1 a enviar: linha mostra a enviar',L.t,'v424 · 1 a enviar Procurar atualizacao');
await p.click('#vrl [data-vp]');await p.waitForTimeout(6000);L=await linha(p,'#vrl');
R('versao nova + pendente: amarelo sem botao',[L.t,/vrl-ag/.test(L.cls),await p.$('#vrl [data-vu]')===null],['v999 disponivel · aguarde sincronizar',true,true]);
R('sem aviso flutuante duplicado (#upd)',await p.$('#upd')===null,true);
R('menu continua aberto (nao reabriu)',await p.evaluate(()=>!!document.querySelector('#vrl')),true);
await p.screenshot({path:OUTD+'/4-aguarde.png'});
await p.evaluate(()=>{window.__SBHOLD=false});await p.waitForTimeout(2500);L=await linha(p,'#vrl');
R('depois de sincronizar: botao Atualizar aparece sozinho',[L.t,/vrl-nv/.test(L.cls)],['v999 disponivel ✓ Atualizar',true]);
await p.screenshot({path:OUTD+'/5-disponivel.png'});
await p.click('#vrl [data-vu]');await p.waitForTimeout(2500);
if(!await p.$('#vrl')){await p.click('#fab');await p.waitForTimeout(500)}R('reabriu na versao nova',(await linha(p,'#vrl')).t,'v999 · Sincronizado Procurar atualizacao');
R('erros (admin)',errs.length?errs.slice(0,3):'nenhum','nenhum');await ctx.close();
// ---------- mecanico (menu da conta: tocar em Sincronizado)
DIR='/tmp/vA';({ctx,p,errs}=await abre('mecanico'));
R('mecanico: mini app',await p.evaluate(()=>!!document.querySelector('.mc-h')),true);
await p.click('#sync');await p.waitForTimeout(500);L=await linha(p,'#vrl-m');R('mecanico: linha no rodape do menu da conta',L&&L.t,'v424 · Sincronizado Procurar atualizacao');
await p.screenshot({path:OUTD+'/6-mecanico.png'});
await p.click('#vrl-m [data-vp]');await p.waitForTimeout(800);R('mecanico: Atualizado',(await linha(p,'#vrl-m')).t,'✓ Atualizado');
R('erros (mecanico)',errs.length?errs.slice(0,3):'nenhum','nenhum');await ctx.close();
// ---------- editor: menu do + tambem tem a linha (menu principal)
({ctx,p,errs}=await abre('editor'));await p.click('#fab');await p.waitForTimeout(500);R('editor: linha no menu',(await linha(p,'#vrl'))?.t,'v424 · Sincronizado Procurar atualizacao');
R('submenu (Frota) sem a linha',await (async()=>{await p.click('[data-m="frota"]');await p.waitForTimeout(400);return await p.$('#vrl')===null})(),true);
await ctx.close();
console.log(`\n${ok} ok, ${bad} falhas`);await b.close();srv.close()})();
