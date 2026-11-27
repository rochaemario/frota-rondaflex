// Item 49: varredura de enquadramento. Uso: node item49.js <frota.html> <saida.json> [larguras 360,390] [papeis admin,mecanico]  (SHOTS=<pasta> grava recortes; DEP/MAX = profundidade e limite de telas)
// Percorre telas (cartoes, menu +, Painel, OS, mini app) e detecta: texto sobreposto, rolagem lateral, texto cortado sem reticencias, botao que quebra linha.
const {chromium}=require('playwright');const fs=require('fs');const {seed}=require('./item49_seed.js');
const SRC=process.argv[2]||'/home/claude/frota.html',OUT=process.argv[3]||'/tmp/sweep.json',WS=(process.argv[4]||'360,390').split(',').map(Number),ROLES=(process.argv[5]||'admin,mecanico').split(',');
const SHOTS=process.env.SHOTS||'';if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
let html=fs.readFileSync(SRC,'utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('const OS_ON=true;','window.__T=()=>({S,render,goHome,closeSheet,NAV,openOS,osRegistrar,openMenu,openEq:typeof openEq==="function"?openEq:null});const OS_ON=true;');
const EU={admin:{uid:'adm',papel:'admin',nome:'Mario Eugenio Rocha'},mecanico:{uid:'mec-1',papel:'mecanico',nome:'Douglas Fernandes de Oliveira Junior'}};
const page=eu=>`<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>${fake};window.__db=__mkdb(${JSON.stringify(seed)});window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu=${JSON.stringify(eu)};window.print=()=>{};window.open=()=>null;navigator.share=undefined;</script></head><body>${html}</body></html>`;

// ---- detectores (rodam na pagina) ----
const DETECT=()=>{
  document.querySelectorAll('*').forEach(x=>{if(x.scrollTop)x.scrollTop=0;if(x.scrollLeft)x.scrollLeft=0});scrollTo(0,0);
  const vw=innerWidth;const out=[];window.__isu=[];const push=(o,el)=>{out.push(o);window.__isu.push(el)};
  const layer=(()=>{const o=[...document.querySelectorAll('.os-scr,.docv,.rdr')].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed');if(o.length)return o[o.length-1];
    const sh=document.querySelector('#sheet');if(sh&&!document.querySelector('#scrim').hidden&&sh.getBoundingClientRect().height>50)return sh;return document.querySelector('#app')})();
  const vis=e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false;if(x.hidden)return false}return true};
  const nm=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;const c=[...e.classList].slice(0,3);if(c.length)s+='.'+c.join('.');return s};
  const path=e=>{const p=[];for(let x=e;x&&x!==layer&&p.length<4;x=x.parentElement)p.unshift(nm(x));return p.join(' > ')};
  const txt=e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50);
  const clipX=e=>{for(let x=e.parentElement;x&&x!==document.documentElement;x=x.parentElement){const c=getComputedStyle(x);if(['auto','scroll'].includes(c.overflowX))return 'scroll';if(c.overflowX==='hidden'||c.overflowX==='clip')return x}return null};
  // 1) rolagem lateral
  const scrs=[document.scrollingElement,...layer.querySelectorAll('*')].filter(e=>e&&(e===document.scrollingElement||(['auto','scroll'].includes(getComputedStyle(e).overflowX)&&getComputedStyle(e).overflowY!=='visible'&&e.scrollHeight>=e.clientHeight)));
  const lat=[];
  for(const e of layer.querySelectorAll('*')){if(!vis(e))continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
    if(r.right>vw+1||r.left<-1){const cx=clipX(e);if(cx==='scroll'){const sc=(()=>{for(let x=e.parentElement;x;x=x.parentElement){const c=getComputedStyle(x);if(['auto','scroll'].includes(c.overflowX))return x}})();if(sc&&sc.getBoundingClientRect().right<=vw+1&&!sc.matches('.sh-body,#sheet,#app'))continue}
      if(cx&&cx!=='scroll'){const cr=cx.getBoundingClientRect();if(cr.right<=vw+1&&cr.left>=-1)continue}
      if(getComputedStyle(e).position==='fixed'&&r.left>=vw)continue;
      lat.push({el:path(e),t:txt(e),r:[Math.round(r.left),Math.round(r.right)],e})}}
  // so os mais externos
  const latTop=lat.filter(a=>!lat.some(b=>b!==a&&a.el.startsWith(b.el+' >')));
  latTop.slice(0,6).forEach(x=>push({k:'lateral',el:x.el,t:x.t,r:x.r},x.e));
  const de=document.scrollingElement;if(de.scrollWidth>vw+1)push({k:'lateral',el:'pagina',t:'scrollWidth '+de.scrollWidth},null);
  // 2) textos: linhas de cada texto
  const tn=[];const w=document.createTreeWalker(layer,NodeFilter.SHOW_TEXT);let t;
  while(t=w.nextNode()){if(!t.data.trim())continue;const e=t.parentElement;if(!e||['SCRIPT','STYLE','OPTION','TEXTAREA'].includes(e.tagName))continue;if(!vis(e))continue;
    const rg=document.createRange();rg.selectNodeContents(t);const raw=[...rg.getClientRects()].filter(r=>r.width>1&&r.height>1);if(!raw.length)continue;
    let cl={l:-1e9,t:-1e9,r:1e9,b:1e9},stk=false,sc=null,scR=null;for(let x=e;x&&x!==document.documentElement;x=x.parentElement){const c=getComputedStyle(x);if(x!==layer&&layer.contains(x)&&(c.position==='sticky'||c.position==='fixed'))stk=true;
      const ox=c.overflowX,oy=c.overflowY,scr=/auto|scroll/.test(ox+oy);if(scr&&!sc){sc=x;const q=x.getBoundingClientRect();scR={l:q.left,t:q.top,r:q.right,b:q.bottom}}
      if(!scr&&(ox!=='visible'||oy!=='visible')){const q=x.getBoundingClientRect();cl={l:Math.max(cl.l,q.left),t:Math.max(cl.t,q.top),r:Math.min(cl.r,q.right),b:Math.min(cl.b,q.bottom)}}}
    const CL=(rr,c)=>rr.map(r=>({left:Math.max(r.left,c.l),right:Math.min(r.right,c.r),top:Math.max(r.top,c.t),bottom:Math.min(r.bottom,c.b),height:r.height})).filter(r=>r.right-r.left>1&&r.bottom-r.top>1);
    const rs=CL(raw,cl);tn.push({e,t,rs,raw,stk,sc,scR})}
  // 2a) sobreposicao entre textos de elementos diferentes
  const ov=[];
  for(let i=0;i<tn.length;i++)for(let j=i+1;j<tn.length;j++){const A=tn[i],B=tn[j];if(A.e===B.e)continue;
    let ar=A.rs,br=B.rs;if(A.sc!==B.sc){const ca=A.scR,cb=B.scR;const CL=(rr,c)=>c?rr.map(r=>({left:Math.max(r.left,c.l),right:Math.min(r.right,c.r),top:Math.max(r.top,c.t),bottom:Math.min(r.bottom,c.b),height:r.height})).filter(r=>r.right-r.left>1&&r.bottom-r.top>1):rr;ar=CL(CL(ar,ca),cb);br=CL(CL(br,ca),cb)}
    for(const a of ar)for(const b of br){const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left),iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
      if(A.stk!==B.stk)continue;if(ix>2&&iy>Math.min(a.height,b.height)*0.35){const fa=getComputedStyle(A.e).position==='fixed'||A.e.closest('.toast,#fab'),fb=getComputedStyle(B.e).position==='fixed'||B.e.closest('.toast,#fab');if(fa||fb)continue;
        ov.push({k:'sobreposto',el:path(A.e),t:A.t.data.trim().slice(0,30)+' | '+B.t.data.trim().slice(0,30),el2:path(B.e),e:A.e});break}}}
  const seen=new Set();ov.forEach(o=>{const k=o.el+'|'+o.el2;if(!seen.has(k)&&seen.size<8){seen.add(k);const e=o.e;delete o.e;push(o,e)}});
  // 2b) texto cortado sem reticencias
  const cut=new Map();
  for(const {e,t,raw:rs} of tn){const c=getComputedStyle(e);
    if((c.overflowX!=='visible'||c.overflow!=='visible')&&e.scrollWidth>e.clientWidth+1&&c.textOverflow!=='ellipsis'&&!(c.webkitLineClamp&&c.webkitLineClamp!=='none')&&e.clientWidth>0){if(!cut.has(path(e))){cut.set(path(e),[{k:'cortado',el:path(e),t:txt(e)},e])}continue}
    for(let x=e.parentElement;x&&x!==layer.parentElement;x=x.parentElement){const cx=getComputedStyle(x);if(cx.overflowX==='hidden'||cx.overflowX==='clip'||cx.overflow==='hidden'){const xr=x.getBoundingClientRect();
        if(rs.some(r=>r.right>xr.right+1.5||r.left<xr.left-1.5)){const ell=[e,...(()=>{const a=[];for(let y=e.parentElement;y&&y!==x.parentElement;y=y.parentElement)a.push(y);return a})()].some(y=>{const g=getComputedStyle(y);return g.textOverflow==='ellipsis'||(g.webkitLineClamp&&g.webkitLineClamp!=='none')});
          if(!ell&&!cut.has(path(e)))cut.set(path(e),[{k:'cortado',el:path(e),t:t.data.trim().slice(0,40),em:nm(x)},e])}break}}}
  [...cut.values()].slice(0,8).forEach(([o,e])=>push(o,e));
  // 3) botao que quebra linha / apertado
  const bts=[...layer.querySelectorAll('button,.btn,[role=button],a.btn,label.btn,.pill,.chip')].filter(vis);
  for(const b of bts){const r=b.getBoundingClientRect();if(!r.width)continue;
    const own=[...b.childNodes].filter(n=>n.nodeType===3&&n.data.trim());const tx=(b.innerText||'').trim();
    const inner=tn.filter(x=>b.contains(x.e));
    // um texto curto de botao (ate 28 letras) em mais de uma linha
    const wr=inner.find(x=>x.t.data.trim().length<=28&&new Set(x.rs.map(r=>Math.round(r.top/4))).size>1);
    if(wr)push({k:'botao quebra',el:path(b),t:wr.t.data.trim()},b);
    else if(b.scrollWidth>b.clientWidth+1&&getComputedStyle(b).overflowX!=='visible'&&getComputedStyle(b).textOverflow!=='ellipsis')push({k:'botao apertado',el:path(b),t:tx.slice(0,40)},b)}
  const title=(()=>{const h=layer.querySelector('.sh-tt h2,.subbar h2,.os-tt,h2,h3');return h?h.innerText.replace(/\s+/g,' ').trim().slice(0,50):''})();
  return {title,lay:nm(layer),out}};

// ---- clicaveis da camada atual ----
const CLK=()=>{const layer=(()=>{const o=[...document.querySelectorAll('.os-scr,.docv,.rdr')];if(o.length)return o[o.length-1];const sh=document.querySelector('#sheet');if(sh&&!document.querySelector('#scrim').hidden)return sh;return document.querySelector('#app')})();
  const vis=e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden')return false;if(x.hidden)return false}return true};
  const BAD=/excluir|apagar|desativar|cancelar os|copiar|levar|sair|converter|juntar|lancar|registrar|salvar|aplicar|imprimir|compartilhar|tirar|limpar|descartar|enviar|desfazer|concluir|confirm|gravar|novo qr|ver o app|voltar a admin|importar|backup|copia de seg|atualizar|procurar|ativo|reativar|mesclar|camera|ler |foto|cadastrar e|baixa ja|ja registrada|registrar depois|conferir depois|substituir|ok$|sim$|^x$|✕/i;
  const L=[...layer.querySelectorAll('button,[role=button],[data-m],[data-acc],[data-fr],[data-pntab],[data-cbx],a[href="#"]')].filter(e=>vis(e)&&!e.disabled&&!e.matches('[data-back],[data-close],.backbtn,[data-a="up"],[data-a="home"],.hd-pri,.danger,input,select'));
  const sig=e=>{const ds=Object.keys(e.dataset).sort().map(k=>k+'='+(k.length<4||/^(m|acc|fr|pntab|cbx|tab|t|k|f)$/.test(k)?e.dataset[k]:'')).join(',');return e.tagName+'|'+[...e.classList].sort().join('.')+'|'+ds};
  const per={};const res=[];
  L.forEach((e,i)=>{const tx=(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,40);if(BAD.test(tx)||BAD.test(e.getAttribute('aria-label')||''))return;const s=sig(e);per[s]=(per[s]||0)+1;if(per[s]>2)return;res.push({s,tx,i})});
  return res};
const CLICK=(k)=>{const layer=(()=>{const o=[...document.querySelectorAll('.os-scr,.docv,.rdr')];if(o.length)return o[o.length-1];const sh=document.querySelector('#sheet');if(sh&&!document.querySelector('#scrim').hidden)return sh;return document.querySelector('#app')})();
  const vis=e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden')return false;if(x.hidden)return false}return true};
  const L=[...layer.querySelectorAll('button,[role=button],[data-m],[data-acc],[data-fr],[data-pntab],[data-cbx],a[href="#"]')].filter(e=>vis(e)&&!e.disabled);
  const sig=e=>{const ds=Object.keys(e.dataset).sort().map(k=>k+'='+(k.length<4||/^(m|acc|fr|pntab|cbx|tab|t|k|f)$/.test(k)?e.dataset[k]:'')).join(',');return e.tagName+'|'+[...e.classList].sort().join('.')+'|'+ds};
  const e=L.find(e=>sig(e)===k.s&&(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,40)===k.tx);if(!e)return false;e.click();return true};
const FP=()=>{const o=[...document.querySelectorAll('.os-scr,.docv,.rdr')];const sh=document.querySelector('#sheet');const L=o.length?o[o.length-1]:sh&&!document.querySelector('#scrim').hidden?sh:document.querySelector('#app');
  const h=L.querySelector('.sh-tt h2,.subbar h2,h2');const t=(L.innerText||'').replace(/\s+/g,' ');return (h?h.innerText:'')+'#'+t.length+'#'+t.slice(0,120)+'#'+t.slice(-60)};

(async()=>{const b=await chromium.launch();const R=[],V=[];const errs=[];
for(const role of ROLES)for(const W of WS){
  const ctx=await b.newContext({viewport:{width:W,height:780},deviceScaleFactor:1});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(role+W+': '+e.message));p.on('dialog',d=>d.dismiss());p.on('filechooser',()=>{});
  await ctx.route('http://app.test/**',r=>r.fulfill({contentType:'text/html',body:page(EU[role])}));await p.goto('http://app.test/');await p.waitForTimeout(1500);
  const reset=async()=>{await p.evaluate(()=>{document.querySelectorAll('.os-scr,.docv,.rdr').forEach(e=>e.remove());const T=__T();T.NAV.length=0;try{T.closeSheet()}catch(e){}try{T.goHome()}catch(e){}T.S.focus='';T.render();scrollTo(0,0)});await p.waitForTimeout(120)};
  // raizes extras (abrem direto)
  const ROOTS=[[]];
  if(role==='admin'){ROOTS.push(['js:openMenu']);['o80','o81','o82','o83','o110'].forEach(o=>ROOTS.push(['js:openOS:'+o]));ROOTS.push(['js:osRegistrar:o81']);ROOTS.push(['js:osRegistrar:o82'])}
  const seenFP=new Set();const Q=ROOTS.map(r=>({p:r}));let cnt=0;const MAX=+process.env.MAX||260,DEP=+process.env.DEP||3;
  while(Q.length&&cnt<MAX){const it=Q.shift();await reset();let ok=true;
    for(const st of it.p){if(typeof st==='string'&&st.startsWith('js:')){const [,f,a]=st.split(':');await p.evaluate(([f,a])=>{const T=__T();f==='openMenu'?T.openMenu():f==='openOS'?T.openOS(a):T.osRegistrar(a)},[f,a]);await p.waitForTimeout(500);continue}
      ok=await p.evaluate(CLICK,st);if(!ok)break;await p.waitForTimeout(260)}
    if(!ok)continue;
    const fp=await p.evaluate(FP);if(seenFP.has(fp))continue;seenFP.add(fp);cnt++;
    // abre detalhes recolhidos comuns (Detalhes da OS etc.) nao; mede como esta
    const r=await p.evaluate(DETECT);const lbl=it.p.map(s=>typeof s==='string'?s:s.tx).join(' › ');V.push({role,W,via:lbl,title:r.title,n:r.out.length});
    if(r.out.length){R.push({role,W,via:lbl,title:r.title,lay:r.lay,out:r.out});if(SHOTS){const id=String(R.length).padStart(3,'0');R[R.length-1].id=role+W+'_'+id;
      for(let k=0;k<Math.min(4,r.out.length);k++){const bx=await p.evaluate(k=>{const e=window.__isu[k];if(!e)return null;e.scrollIntoView({block:'center'});const q=e.getBoundingClientRect();return {y:Math.max(0,q.top-70),h:Math.min(innerHeight,q.bottom+70)-Math.max(0,q.top-70)}},k);
        if(bx&&bx.h>10)await p.screenshot({path:`${SHOTS}/${role}${W}_${id}_${k}.png`,clip:{x:0,y:bx.y,width:W,height:bx.h}});r.out[k].shot=`${role}${W}_${id}_${k}.png`}}}
    if(it.p.length<DEP+(it.p[0]&&String(it.p[0]).startsWith('js:')?1:0)){const cl=await p.evaluate(CLK);cl.forEach(c=>Q.push({p:[...it.p,c]}))}}
  console.log(role,W,'telas',cnt,'com problema',R.filter(x=>x.role===role&&x.W===W).length);await ctx.close()}
fs.writeFileSync(OUT,JSON.stringify({R,errs,V},null,1));await b.close()})();
