const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||450);
const eq=id=>p.evaluate(async id=>(await window.__db.doc('equipamentos/'+id).get()).data(),id);
const st=Object.entries(seed).filter(([k])=>k.startsWith('estoque/')).map(([k,v])=>({id:k.split('/')[1],...v}));
const its=st.filter(x=>!x.kit),kits=st.filter(x=>x.kit);
const grp=x=>['filtro','oleo'].includes(x.tipo)?x.tipo:'outro';const G=[['filtro','Filtros','un'],['oleo','Oleos','L'],['outro','Outros','un']];
const nf=v=>Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
const cls=x=>(Number(x.qtd)||0)<=0?'bad':(Number(x.qtd)||0)<(Number(x.minimo)||0)?'warn':'ok';
const cat=G.map(([k,l,u])=>{const l2=its.filter(x=>grp(x)===k);return {k,l,u,n:l2.length,q:l2.reduce((a,x)=>a+(Number(x.qtd)||0),0),z:l2.filter(x=>cls(x)==='bad').length,b:l2.filter(x=>cls(x)==='warn').length,list:l2}}).filter(c=>c.n);
const tot={n:its.length,un:its.filter(x=>x.tipo!=='oleo').reduce((a,x)=>a+(Number(x.qtd)||0),0),L:its.filter(x=>x.tipo==='oleo').reduce((a,x)=>a+(Number(x.qtd)||0),0),ab:its.filter(x=>cls(x)!=='ok').length,kits:kits.length};
const row=x=>`<div class="es-r st"><span class="es-b ${cls(x)}"><b>${nf(x.qtd)}</b><small>${x.un||'un'}</small></span><span class="es-t"><span class="es-n">${x.desc}</span><span class="es-c">${x.codigo||x.ref} · min ${nf(x.minimo)}</span></span></div>`;
const CSS=`.rk{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:2px 0 14px}.rk div{background:#fff;border-radius:14px;padding:10px 12px}.rk small{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.rk b{font:700 24px var(--display,system-ui)}.rk em{font-style:normal;font-size:12px;color:var(--muted);margin-left:3px}
.rt{background:#fff;border-radius:14px;overflow:hidden;margin-bottom:14px}.rt .h,.rt .r{display:grid;grid-template-columns:1.4fr .7fr .9fr .9fr;padding:10px 12px;font-size:13.5px;align-items:center}.rt .h{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}.rt .r+.r,.rt .h+.r{box-shadow:inset 0 1px 0 var(--line)}.rt .r span:not(:first-child),.rt .h span:not(:first-child){text-align:right;font-family:var(--mono)}.rt .tt{font-weight:700}
.cx{display:flex;align-items:center;gap:8px;min-height:56px;padding:8px 14px;border-radius:14px;background:#e2e6ee;margin:0 0 8px}.cx .t{flex:1}.cx .t b{display:block;font-size:15px}.cx .t small{font-size:12.5px;color:var(--muted)}.cx .q{font:600 15px var(--mono)}.cx svg{width:18px;height:18px;color:var(--muted)}
.al{color:var(--bad);font-weight:600}.seg2{display:flex;background:#e2e6ee;border-radius:12px;padding:3px;margin-bottom:14px}.seg2 span{flex:1;text-align:center;padding:9px;border-radius:10px;font-weight:600;font-size:14px;color:var(--muted)}.seg2 .on{background:#fff;color:var(--fg)}`;
const chev='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
const kpis=`<div class="rk"><div><small>Itens</small><b>${tot.n}</b><em>tipos</em></div><div><small>Em estoque</small><b>${nf(tot.un)}</b><em>un</em> <b>${nf(tot.L)}</b><em>L</em></div><div><small>Abaixo do min.</small><b class="${tot.ab?'al':''}">${tot.ab}</b></div></div>`;
const tabela=`<div class="rt"><div class="h"><span>Categoria</span><span>Itens</span><span>Saldo</span><span>Abaixo</span></div>${cat.map(c=>`<div class="r"><span>${c.l}</span><span>${c.n}</span><span>${nf(c.q)} ${c.u}</span><span class="${c.z+c.b?'al':''}">${c.z+c.b}</span></div>`).join('')}<div class="r tt"><span>Total</span><span>${tot.n}</span><span>—</span><span class="${tot.ab?'al':''}">${tot.ab}</span></div></div>`;
const V={
 A:kpis+tabela+cat.map(c=>`<div class="es-g"><span>${c.l}</span><em>${c.n}</em></div><div class="es-l">${c.list.slice(0,3).map(row).join('')}</div>`).join(''),
 B:`<div class="seg2"><span class="on">Resumo</span><span>Itens</span></div>`+kpis+tabela+`<p class="note">Kits montados: ${tot.kits}. Toque em Itens para ver a lista completa com saldo e minimo de cada um.</p>`,
 C:kpis+cat.map(c=>`<div class="cx"><span class="t"><b>${c.l}</b><small>${c.n} itens${c.z+c.b?` · <span class="al">${c.z+c.b} abaixo do minimo</span>`:''}</small></span><span class="q">${nf(c.q)} ${c.u}</span>${chev}</div>`).join('')+`<div class="cx" style="background:#eef1f6"><span class="t"><b>Kits</b><small>${tot.kits} montados</small></span>${chev}</div>`};
await p.click('[data-acc="estoque"]');await W();await p.click('#es-rel');await W(700);await p.evaluate(()=>window.scrollTo(0,0));
await p.addStyleTag({content:CSS});
await p.screenshot({path:'rel0.png'});
for(const [k,h] of Object.entries(V)){await p.evaluate(h=>{document.querySelectorAll('#app .es-blk,#app #esq-0,#app .rv').forEach(x=>x.remove());const d=document.createElement('div');d.className='rv';d.innerHTML=h;const f=document.querySelector('#app .esf');f.after(d);(document.getElementById('scroller')||window).scrollTo(0,0)},h);await W(200);await p.screenshot({path:'rel'+k+'.png'})}
console.log(JSON.stringify(tot),cat.map(c=>[c.l,c.n,c.q]));
await b.close()})();
