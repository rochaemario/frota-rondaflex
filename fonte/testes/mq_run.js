const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__T=()=>({osLista,osById,osDraw,S,drawLista:typeof drawLista!=="undefined"?drawLista:null,drawCartao45,cartTr:S.trocas});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
seed['config/mecanicos']={lista:[{uid:'mec-1',nome:'Douglas Guilard',ativo:true},{uid:'mec-2',nome:'Joao Geraldo',ativo:true,enc:true},{uid:'mec-3',nome:'Carlos',ativo:true},{uid:'mec-4',nome:'Raimundo',ativo:true}]};
const t0=Date.now()-9*3600e3;
seed['os/a']={num:12,o:{eq:'CB-08',por:'mec-1',porNome:'Joao',ts:t0,data:'2026-11-05',hor:'2550',aconteceu:'Suporte do escapamento trincado',concl:false,feito:'',estado:'parado',pecas:[{k:'est',id:'cat-211-2660',nome:'Filtro ar cabine',cod:'211-2660',un:'un',qtd:1}],fotos:[],resp:['mec-2'],vinc:''}};
seed['os/b']={num:13,o:{eq:'CB-08',por:'mec-3',porNome:'Carlos',ts:t0+3600e3,data:'2026-11-05',hor:'',aconteceu:'Solda no suporte',concl:true,feito:'Soldado',estado:'operando',pecas:[],fotos:[],resp:[],vinc:'a'}};
seed['os/c']={num:14,o:{eq:'CB-07',por:'mec-1',porNome:'Joao',ts:t0,data:'2026-11-05',hor:'1830',aconteceu:'Vazamento na mangueira do braco hidraulico, ao lado do cilindro principal',concl:false,feito:'',estado:'',pecas:[],fotos:[],resp:[],vinc:''}};
seed['ose/x1']={os:'c',tipo:'concluir',por:'mec-1',porNome:'Joao',ts:t0+5*3600e3,feito:'Trocada a mangueira e completado o oleo hidraulico',estado:'operando',pecas:[{k:'est',id:'cat-211-2660',nome:'Filtro ar cabine',cod:'211-2660',un:'un',qtd:1},{k:'sc',nome:'Abracadeira do mangote',qtd:2,foto:''}],fotos:[]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const INIT=("window.__CALLS=[];window.__frotaMec=async(a,d)=>{__CALLS.push([a,d]);return a==='criar'?{uid:'11111111-2222-3333-4444-555555555555',codigo:'abcdefghijkmnpqrstuvwxyz'}:a==='codigo'?{codigo:'zzzzzzzzzzzzzzzzzzzzzzzz'}:{ok:true}};");
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__frotaNS="teste/";window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
const W=ms=>p.waitForTimeout(ms||450);await W(1600);

await p.evaluate(INIT);await p.addScriptTag({path:'/tmp/claude-0/qr/r/js/qrcode.js'});await p.click('[data-tb="mecs"]');await W(600);await p.screenshot({path:'mq0.png'});
await p.fill('#mc-n','Pedro Alves');await p.click('[form="mcf"]');await W(1200);await p.screenshot({path:'mq1.png'});
console.log(await p.evaluate(()=>JSON.stringify([__CALLS,window.__T().S.mecs.slice(-1)])));
await p.click('.os-scr [data-x]');await W(400);await p.click('[data-mx="11111111-2222-3333-4444-555555555555"]');await W(400);await p.screenshot({path:'mq2.png'});
await p.click('[data-mqr]');await W(300);await p.screenshot({path:'mq3.png'});await p.click('#nq-ok');await W(800);
await p.click('.os-scr [data-x]');await W(300);await p.click('#mc-at',{force:true});await p.click('[data-msv]');await W(900);
console.log(await p.evaluate(()=>JSON.stringify([__CALLS.slice(1),window.__T().S.mecs.slice(-1)])));
console.log('ERR',errs);await b.close()})();