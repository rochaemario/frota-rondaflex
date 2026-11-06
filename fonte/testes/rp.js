const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const L='/tmp/claude-0/live8';
const seed={};for(const col of ['equipamentos','trocas','estoque','config']){const d=L+'/'+col;if(!fs.existsSync(d))continue;
  fs.readdirSync(d).forEach(f=>{let x=JSON.parse(fs.readFileSync(d+'/'+f));x=(x.data&&typeof x.data==='object')?x.data:x;delete x.id;delete x.version;seed[col+'/'+f.replace('.json','')]=x})}
// cobertura extra: saldos variados, um kit, movimentações, uma lista e itens no carrinho
const q={'cat-353-5058':0,'cat-365-7606':3,'cat-526-3121':1,'cat-526-3125':2,'cat-273-5711':5,'cat-462-1171':1,'cat-360-8960':4,'cat-391-3764':0};
Object.entries(q).forEach(([k,v])=>{seed['estoque/'+k].qtd=v});
seed['estoque/kit1']={kit:true,tipo:'kit',codigo:'KIT-PC02-500',desc:'Preventiva 500 h · PC-02',minimo:1,un:'kit',comps:[{id:'cat-462-1171',qtd:1},{id:'cat-360-8960',qtd:1},{id:'cat-391-3764',qtd:1}],fotos:[]};
seed['movs/m1']={estoqueId:'cat-273-5711',tipo:'entrada',qtd:5,data:'2026-10-20',obs:'Sotreq',equipId:'',origem:'manual',saldo:5,ts:1};
seed['listas/l1']={data:'2026-10-20',ts:1,itens:[{cod:'353-5058',desc:'Filtro ar cabine – recirculação',qtd:2,un:'un',estoqueId:'cat-353-5058'},{cod:'',desc:'Graxa EP2',qtd:1,un:'un'}]};
seed['listas/l2']={data:'2026-10-21',ts:2,itens:[{cod:'391-3764',desc:'Separador água/combustível',qtd:1,un:'un',estoqueId:'cat-391-3764'}]};
seed['config/compras']={itens:[{k:'s:cat-391-3764',estoqueId:'cat-391-3764',qtd:1,un:'un',add:'2026-10-22'}]};
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const OUT=process.argv[2]||'shots';fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const b=await chromium.launch();
 for(const scheme of (process.argv[3]||'light').split(',')){
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:scheme});const pg=await ctx.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text()))errs.push('CONSOLE '+m.text())});
 await pg.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
 const W=ms=>pg.waitForTimeout(ms||220);let n=0;const issues=[];
 const check=async(name)=>{const r=await pg.evaluate(()=>{const o=[];const vw=innerWidth;
     document.querySelectorAll('#app *,#sheet *').forEach(e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;const r=e.getBoundingClientRect();if(r.width>0&&(r.right>vw+1||r.left<-1)&&!e.closest('.chips')&&!e.closest('.sidetabs'))o.push((e.className||e.tagName)+' '+Math.round(r.left)+'..'+Math.round(r.right))});
     const sb=document.querySelector('.sh-body');if(sb&&sb.scrollWidth>sb.clientWidth+1)o.push('sh-body hscroll');
     const sc=document.getElementById('scroller');if(sc&&sc.scrollWidth>sc.clientWidth+1)o.push('scroller hscroll');
     return o.slice(0,5)});
   if(r.length)issues.push(name+': '+r.join(' | '));};
 const shot=async(name)=>{n++;await check(name);await pg.screenshot({path:`${OUT}/${scheme}-${String(n).padStart(2,'0')}-${name}.png`})};
 const sheetShot=async(name)=>{await shot(name);const h=await pg.evaluate(()=>{const b=document.querySelector('.sh-body');return b?b.scrollHeight-b.clientHeight:0});if(h>150){await pg.evaluate(()=>{const b=document.querySelector('.sh-body');b.scrollTop=b.scrollHeight});await W();await shot(name+'-fim')}};
 const tryc=async(sel,label)=>{try{await pg.click(sel,{timeout:2500});await W()}catch(e){issues.push('FALHOU clicar '+(label||sel)+' :: '+String(e.message).split('\n').slice(0,6).join(' / '))}};
 const back=async()=>tryc('#sheet [data-back]','voltar');const home=async()=>{await pg.evaluate(()=>{document.querySelector('header').click()});await W()};
 await W(800);await shot('inicio');
 await tryc('[data-pntab="st"]');await shot('painel-estoque');await tryc('.pn-st .ia-h');await shot('painel-estoque-aberto');
 await tryc('[data-pntab="eq"]');await tryc('.pn-r .ia-h');await shot('painel-eq-aberto');

 const rd=async()=>pg.evaluate(()=>{const S=window.__store;const k=Object.keys(S).find(k=>k.startsWith('equipamentos/')&&S[k].codigo==='MT-01');const e=S[k];return {hm:e.horimetro,its:e.itens.filter(i=>i.proxH!==''&&i.proxH!=null||i.reprog).map(i=>[i.desc,i.ultimaH,i.proxH,i.reprog&&i.reprog.motivo]),tr:Object.keys(S).filter(k=>k.startsWith('trocas/')&&S[k].tipo==='reprog').map(k=>JSON.stringify(S[k].itens.map(i=>[i.desc,i.de,i.para,i.motivo,i.proxAnt])))}});
 await tryc('[data-pend]');await shot('rp0');
 await pg.evaluate(()=>{const b=document.querySelector('#sheet [data-ia]');b.click()});await W();await shot('rp1-exp');
 await tryc('#sheet [data-rp]');await shot('rp2-form');
 await tryc('#sheet button[form="frp"]');await W();
 await pg.fill('#rp-v','3900');await tryc('#sheet [data-rpm][data-v="Outro"]');await pg.fill('[data-rpo="x"]','Teste');await shot('rp3-filled');
 await tryc('#sheet button[form="frp"]');await W(500);await shot('rp4-after');console.log('A',JSON.stringify(await rd()));
 // preventiva com vencidos desmarcados
 await home();await tryc('[data-acc="manut"]');await tryc('[data-a="new-tr"]');await tryc('[data-rg="prev"]');await pg.selectOption('#t-eq','MT-01');await W();
 await pg.evaluate(()=>{const cbs=[...document.querySelectorAll('#t-items input[type=checkbox]:checked')];cbs.slice(1).forEach(c=>c.click())});await W();
 await pg.fill('#t-hm','3700');await tryc('#sheet button[form="ft"]');await W(500);await pg.evaluate(()=>document.querySelector('.eqv-ask')&&document.querySelector('.eqv-ask').scrollIntoView());await W();await shot('rp5-ask');
 const rows=await pg.$$('[data-rpi]');for(const r of rows){const pid=await r.getAttribute('data-rpi');await (await r.$('[data-rpv]')).fill('4000');await (await r.$('[data-v="Aguardando parada"]')).click()}
 await W();await shot('rp6-ask-filled');await tryc('.eqv-ask [data-go]');await W(800);console.log('B',JSON.stringify(await rd()));await shot('rp7');
 await home();await tryc('[data-acc="manut"]');await tryc('[data-hist="MT-01"]');await shot('rp8-hist');
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#sheet [data-tr]')].find(x=>/reprog/.test(x.textContent));b&&b.click()});await W();await shot('rp9-det');
 // excluir reprogramação (a primeira, manual)
 await home();await tryc('#fab');await tryc('[data-m="excluir"]');await tryc('[data-m="dl-tr"]');await pg.fill('#pd-q','MT-01');await W();await shot('rp10-dl');await pg.evaluate(()=>{const b=[...document.querySelectorAll('#pd-l [data-pd]')].filter(x=>/Reprog/.test(x.textContent));b[b.length-1].click()});await W();await shot('rp11-dl');await tryc('#dl-go');await W();
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#delbox button')].find(x=>/Excluir/.test(x.textContent));b&&b.click()});await W(600);console.log('C',JSON.stringify(await rd()));
 console.log('ERR',errs,issues)}await b.close()})();
