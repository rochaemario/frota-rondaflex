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
 const tryc=async(sel,label)=>{if(/^\[data-eq=/.test(sel))await pg.evaluate(q=>{const b=document.querySelector(q);const l=b&&b.closest('.tsec-l');if(l&&l.hidden){const h=l.previousElementSibling;h&&h.click()}},sel);const mk=/\[data-acc="(equip|manut|comb|aloc)"\]/.exec(sel);if(mk&&!(await pg.$(sel))){if(await pg.$('[data-fr="'+mk[1]+'"]')){sel='[data-fr="'+mk[1]+'"]'}else{try{await pg.click('[data-acc="frota"]',{timeout:2500});await W()}catch(e){}sel='[data-fr="'+mk[1]+'"]'}}try{await pg.click(sel,{timeout:2500});await W()}catch(e){issues.push('FALHOU clicar '+(label||sel)+' :: '+String(e.message).split('\n').slice(0,6).join(' / '))}};
 const back=async()=>tryc('#sheet [data-back]','voltar');const home=async()=>{await pg.evaluate(()=>{document.querySelector('header').click()});await W()};
 await W(800);await shot('inicio');
 await tryc('[data-pntab="st"]');await shot('painel-estoque');await tryc('.pn-st .ia-h');await shot('painel-estoque-aberto');
 await tryc('[data-pntab="eq"]');await tryc('.pn-r .ia-h');await shot('painel-eq-aberto');
 await tryc('[data-pend]');await sheetShot('pendencias');await home();
 // cards
 await tryc('[data-acc="equip"]');await shot('equipamentos');await tryc('[data-eq="PC-02"]');await sheetShot('ficha-PC-02');await home();
 await tryc('[data-acc="equip"]');await tryc('[data-eq="TA-02"]');await sheetShot('ficha-TA-02');await home();
 await tryc('[data-acc="aloc"]');await shot('alocacao');await tryc('[data-site="DM1"]');await shot('dm1');await tryc('[data-dmv="all"]');await shot('dm1-todos');await tryc('[data-dmv="area"]');await tryc('[data-area="Mina"]');await shot('dm1-mina');
 await tryc('[data-a="up"]');await tryc('[data-a="up"]');await tryc('[data-site="PQ"]');await shot('pq');await home();
 await tryc('[data-acc="aloc"]');await tryc('[data-alocar]');await sheetShot('alocar-1');await tryc('[data-st="DM1"]');await shot('alocar-2');await tryc('[data-ar="Planta"]');await shot('alocar-3');await tryc('[data-fr="Geral"]');await sheetShot('alocar-4');await home();
 await tryc('[data-acc="manut"]');await shot('preventivas');await pg.evaluate(()=>document.getElementById('scroller').scrollTop=99999);await W();await shot('preventivas-fim');
 await tryc('[data-cron="MT-01"]');await sheetShot('cronograma-MT-01');await home();
 await tryc('[data-acc="manut"]');await tryc('[data-hist="MT-01"]');await shot('hist-MT-01');await tryc('#sheet [data-tr]');await sheetShot('preventiva-detalhe');await tryc('#t-card');await W(1200);await sheetShot('cartao');await home();
 await tryc('[data-acc="manut"]');await pg.fill('#pq','pc0');await W();await shot('busca');await home();
 await tryc('[data-acc="estoque"]');await tryc('[data-estab="rel"]');await shot('estoque');await tryc('[data-mov="cat-273-5711"]');await sheetShot('item');await home();
 await tryc('[data-acc="estoque"]');await tryc('[data-estab="rel"]');await tryc('[data-mov="kit1"]');await sheetShot('kit');await home();
 // registrar
 await tryc('[data-acc="manut"]');await tryc('[data-a="new-tr"]');await shot('registrar-escolha');await tryc('[data-rg="ar"]');await shot('filtro-ar');await tryc('[data-ar="Motor"]');await pg.fill('#a-eq + .sug-w input','PC-02');await W();await pg.click('#a-eq + .sug-w [data-eo="PC-02"]');await W();await sheetShot('filtro-ar-motor');await back();await back();
 await tryc('[data-rg="prev"]');await pg.fill('#t-eq + .sug-w input','PC-02');await W();await pg.click('#t-eq + .sug-w [data-eo="PC-02"]');await W();await sheetShot('preventiva-form');await pg.fill('#t-eq + .sug-w input','MT-01');await W();await pg.click('#t-eq + .sug-w [data-eo="MT-01"]');await W();await pg.evaluate(()=>document.querySelector('#t-items').scrollIntoView());await W();await shot('prev-mt01');if(await pg.$('.ti-more')){await tryc('.ti-more');await pg.evaluate(()=>document.querySelector('.ti-more').scrollIntoView());await W();await shot('prev-mt01-aberto')}else issues.push('sem ti-more MT-01');await home();
 // laterais
 await tryc('#sidehm');await sheetShot('horimetros');await home();
 // + menu
 await tryc('#fab');await sheetShot('menu');
 for(const [m,subs] of [['frota',['x:eq','reg','thm','thm-x']],['est',['mv-entrada','mv-saida','x:st','x:kit','cart']],['comb',['abast','dl-ab']],['aj',['l:donos','l:tipos','backup']]]){
   await tryc(`[data-m="${m}"]`);await sheetShot('menu-'+m);
   for(const s of subs){if(s==='backup')continue;await tryc(`[data-m="${s}"]`);await sheetShot(m+'-'+s.replace(':','_'));
     if(s==='g:eq'){await tryc('[data-ge="MT-01"]');await sheetShot('editar-MT-01');await back()}
     if(s==='g:st'){await tryc('[data-ge="cat-353-5058"]');await sheetShot('editar-item');await back()}
     if(s==='mv-entrada'){await pg.fill('#mv-c','353');await W();await sheetShot('entrada-busca')}
     await back()}
   await back()}
 await home();
 await tryc('#cartb');await sheetShot('carrinho');await home();
 await tryc('#sideaj');await W();await shot('ajuste-on');await tryc('#sideaj');
 console.log(scheme,'ERRORS',JSON.stringify(errs,null,1));console.log(scheme,'ISSUES',JSON.stringify(issues,null,1));
 await ctx.close()}
 await b.close()})();
