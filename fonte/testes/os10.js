const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8').replace('function abrirLink(k){','window.__al=k=>abrirLink(k);window.__T=()=>({osLista,osById,osDraw,S,drawLista:typeof drawLista!=="undefined"?drawLista:null,drawCartao45,cartTr:S.trocas});function abrirLink(k){');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
let D=JSON.parse(fs.readFileSync('/home/claude/frota-backup/dados/docs.json','utf8'));if(D.docs)D=D.docs;if(Array.isArray(D)){const o={};D.forEach(x=>o[x.path]=x.data||x);D=o}
const seed={};for(const [k,v] of Object.entries(D))if(/^(equipamentos|trocas|estoque|config)\//.test(k))seed[k]=v;
seed['config/mecanicos']={lista:[{uid:'mec-1',nome:'Joao',ativo:true},{uid:'mec-2',nome:'Pedro',ativo:true},{uid:'mec-3',nome:'Carlos',ativo:true},{uid:'mec-4',nome:'Raimundo',ativo:true,enc:true}]};
const t0=Date.now()-9*3600e3;
seed['os/a']={num:12,o:{eq:'CB-08',por:'mec-1',porNome:'Joao',ts:t0,data:'2026-11-05',hor:'2550',aconteceu:'Suporte do escapamento trincado',concl:false,feito:'',estado:'parado',pecas:[{k:'est',id:'cat-211-2660',nome:'Filtro ar cabine',cod:'211-2660',un:'un',qtd:1}],fotos:[],resp:['mec-2'],vinc:''}};
seed['os/b']={num:13,o:{eq:'CB-08',por:'mec-3',porNome:'Carlos',ts:t0+3600e3,data:'2026-11-05',hor:'',aconteceu:'Solda no suporte',concl:true,feito:'Soldado',estado:'operando',pecas:[],fotos:[],resp:[],vinc:'a'}};
seed['os/c']={num:14,o:{eq:'CB-07',por:'mec-1',porNome:'Joao',ts:t0,data:'2026-11-05',hor:'1830',aconteceu:'Vazamento na mangueira do braco hidraulico, ao lado do cilindro principal',concl:false,feito:'',estado:'',pecas:[],fotos:[],resp:[],vinc:''}};
seed['ose/x1']={os:'c',tipo:'concluir',por:'mec-1',porNome:'Joao',ts:t0+5*3600e3,feito:'Trocada a mangueira e completado o oleo hidraulico',estado:'operando',pecas:[{k:'est',id:'cat-211-2660',nome:'Filtro ar cabine',cod:'211-2660',un:'un',qtd:1},{k:'sc',nome:'Abracadeira do mangote',qtd:2,foto:''}],fotos:[]};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__frotaNS="teste/";window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null};window.__frotaEu={uid:"u1",papel:"admin",nome:"Mario"}</script></head><body>'+html+'</body></html>');
const W=ms=>p.waitForTimeout(ms||450);await W(1600);
await p.evaluate(()=>window.__al('eq:CB-08'));await W(800);await p.evaluate(()=>{const l=[...document.querySelectorAll('#sheet .lbl')].find(x=>/Ordens/.test(x.textContent));l.scrollIntoView()});await W(200);await p.screenshot({path:'f1.png'});
await p.click('[data-ofx]');await W(300);await p.screenshot({path:'f2.png'});await p.click('[data-osab]');await W(500);console.log('abriu',await p.evaluate(()=>document.querySelector('#sheet h2').textContent));
await p.evaluate(()=>window.__al('hq:CB-08'));await W(600);console.log('hist:',await p.evaluate(()=>document.querySelector('#sheet .sh-body').innerText.replace(/\n/g,' | ').slice(0,200)));
console.log('ERR',errs);await b.close()})();
