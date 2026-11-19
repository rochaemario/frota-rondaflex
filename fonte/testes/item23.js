const {chromium}=require('playwright');const fs=require('fs');
let html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync(__dirname+'/fakedb.js','utf8');
html=html.replace('/* item 23: nunca','window.__T={formTroca:(...a)=>formTroca(...a),formFiltroAr:(...a)=>formFiltroAr(...a),formEditTroca:(...a)=>formEditTroca(...a),formUltPrev:(...a)=>formUltPrev(...a)};/* item 23: nunca');
const it=[{pid:'p1',desc:'Filtro de oleo motor',qtd:1,un:'un',ultimaH:3876,ultimaData:'2026-11-13',intervalo:250}];
const seed={'equipamentos/TE-02':{codigo:'TE-02',tipo:'Trator esteira',horimetro:3870,horimetroData:'2026-11-18',itens:it,intervaloPrev:250},
 'equipamentos/MN-01':{codigo:'MN-01',tipo:'Motoniveladora',horimetro:1200,horimetroData:'2026-11-18',itens:[]},
 'trocas/t1':{equipId:'TE-02',data:'2026-11-13',horimetro:3876,itens:it,ajuste:true,resp:'',obs:''},
 'trocas/t2':{tipo:'filtro_ar',sub:'Motor',servico:'Troca',equipId:'TE-02',data:'2026-11-10',horimetro:3800,itens:[],ajuste:true},
 'trocas/t4':{equipId:'TE-02',data:'2026-10-01',horimetro:3500,itens:it,ajuste:true,resp:'',obs:''},
 'trocas/t3':{equipId:'MN-01',tipo:'informada',data:'2026-09-01',horimetro:1000,itens:[],ajuste:true},
 'trocas/t5':{equipId:'MN-01',data:'2026-11-01',horimetro:1100,itens:[],ajuste:true}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1500);const W=ms=>p.waitForTimeout(ms||400);
const n=()=>p.evaluate(async()=>(await window.__db.collection('trocas').get()).docs.length);
const dup=sel=>p.evaluate(s=>{const x=document.querySelector(s);return x?x.innerText.replace(/\s+/g,' ').trim():'(sem caixa)'},sel);
const typ=async(sel,v)=>{await p.fill(sel,String(v));await W(200)};
const R=(k,v)=>console.log(k.padEnd(52),v);
// 1 preventiva
await p.evaluate(()=>__T.formTroca('TE-02'));await W(600);
R('prev: abre (3870)',await dup('#t-dup'));
await typ('#t-hm',3876);R('prev: 3876 (repetido)',await dup('#t-dup'));await p.screenshot({path:__dirname+'/p1.png'});
let c0=await n();await p.click('button[form="ft"]');await W(800);R('prev: Registrar bloqueia (registros iguais)',(await n())===c0);
await typ('#t-hm',3876.1);R('prev: 3876,1',await dup('#t-dup')||'(sem aviso)');
await typ('#t-hm',3800);R('prev: 3800 (= filtro de ar)',await dup('#t-dup')||'(sem aviso)');
// sem internet
await ctx.setOffline(true);await p.evaluate(()=>window.dispatchEvent(new Event('offline')));await typ('#t-hm',3876);R('prev: sem internet 3876',await dup('#t-dup'));await ctx.setOffline(false);
// abrir registro
await p.click('#t-dup [data-dupab]');await W(600);R('Abrir registro abre',await p.evaluate(()=>[...document.querySelectorAll('.sheet h2,.sheet .sub,#sheet h2')].map(x=>x.innerText).join(' | ')||document.querySelector('#fet')?'edit ok':'?'));await p.screenshot({path:__dirname+'/p2.png'});
// 2 filtro de ar
await p.evaluate(()=>__T.formFiltroAr('TE-02','Motor'));await W(600);
await typ('#a-hm',3800);R('ar motor: 3800 (repetido)',await dup('#a-dup'));
c0=await n();await p.click('button[form="fa"]');await W(800);R('ar motor: Registrar bloqueia',(await n())===c0);
await typ('#a-hm',3876);R('ar motor: 3876 (= preventiva)',await dup('#a-dup')||'(sem aviso)');
c0=await n();await p.click('button[form="fa"]');await W(1200);R('ar motor 3876: registra',(await n())===c0+1);
await p.evaluate(()=>__T.formFiltroAr('TE-02','Ar condicionado'));await W(600);await typ('#a-hm',3800);R('ar cond: 3800',await dup('#a-dup')||'(sem aviso)');
// 3 editar preventiva t4 3500 -> 3876
await p.evaluate(()=>__T.formEditTroca('t4'));await W(600);R('editar: abre',await dup('#et-dup')||'(sem aviso)');
await p.click('[data-fd="hm"]');await W(300);await p.fill('#ef-v','3876');await p.click('#ef-ok');await W(300);R('editar: hm 3876',await dup('#et-dup'));await p.screenshot({path:__dirname+'/p3.png'});
await p.click('button[form="fet"]');await W(800);R('editar: salvar bloqueia',await p.evaluate(async()=>(await window.__db.doc('trocas/t4').get()).data().horimetro));
await p.click('[data-fd="hm"]');await W(300);await p.fill('#ef-v','3520');await p.click('#ef-ok');await W(300);R('editar: hm 3520',await dup('#et-dup')||'(sem aviso)');
await p.click('button[form="fet"]');await W(1200);R('editar: salva 3520',await p.evaluate(async()=>(await window.__db.doc('trocas/t4').get()).data().horimetro));
// editar t1 sem mudar hm (outros campos) nao bloqueia
await p.evaluate(()=>__T.formEditTroca('t1'));await W(600);R('editar t1 sem mudar hm',await dup('#et-dup')||'(sem aviso)');
// 4 informada
await p.evaluate(()=>__T.formUltPrev('MN-01','t3'));await W(600);await typ('#up-hm',1100);R('informada: 1100 (= preventiva)',await dup('#up-dup'));
await p.click('button[form="fup"]');await W(800);R('informada: salvar bloqueia',await p.evaluate(async()=>(await window.__db.doc('trocas/t3').get()).data().horimetro));
console.log('ERROS',errs);await b.close()})();
