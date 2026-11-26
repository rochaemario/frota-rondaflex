// Item 43 (B1): sincronizacao so do que mudou. Uso: node item43.js (le /home/claude/pwa/dist, gerado pelo build.py)
const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync(__dirname+'/sbmock.js','utf8');
const eq=(id,hm)=>['equipamentos/'+id,{codigo:id,tipo:'Escavadeira',alocacao:'DM1',area:'Planta',frente:'',horimetro:hm,horimetroData:'2026-11-01',status:'ativo',itens:[]}];
const base=Object.fromEntries([eq('EH-06',6700),eq('CB-01',5000),eq('EH-08',600),...Array.from({length:300},(_,i)=>['movs/m'+i,{estoqueId:'X',tipo:'saida',qtd:1,data:'2026-11-01',ts:i}])]);
let nok=0,nf=0;const R=(k,v,ok)=>{ok?nok++:nf++;console.log((ok?'ok   ':'FALHA ')+k.padEnd(62),typeof v==='string'?v:JSON.stringify(v))};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
let S={seed:base,ts:{},del:{},nodel:false};
await p.addInitScript(()=>{const s=JSON.parse(sessionStorage.getItem('__srv')||'null');if(s){window.__SEED=s.seed;window.__SEEDTS=s.ts;window.__DELSEED=s.del;window.__NODEL=s.nodel;window.__FAIL=s.fail}window.__LOGGED=1});
await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
 if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript'});return r.fulfill({status:404})}return r.abort()});
const abre=async()=>{await p.goto('http://frota.test/');await p.evaluate(s=>sessionStorage.setItem('__srv',JSON.stringify(s)),S);await p.reload();await p.waitForTimeout(2500);
  return p.evaluate(()=>({b1:window.__frotaB1,calls:window.__calls.filter(c=>c[0]==='docs'||c[0]==='docs_del').length}))};
const doc=path=>p.evaluate(async path=>{const db=await window.claude.use('db');const d=await db.doc(path).get();return d.exists?d.data():null},path);
const n=(col)=>p.evaluate(async col=>{const db=await window.claude.use('db');return (await db.collection(col).get()).size},col);
let r=await abre();R('1a abertura: baixa tudo',r.b1,r.b1&&r.b1.modo==='tudo'&&r.b1.baixados>=303);
r=await abre();R('2a abertura sem mudancas: so o que mudou, 0 registros',r.b1,r.b1.modo==='mudou'&&r.b1.baixados===0);
// outro celular: muda EH-06, cria EH-09, apaga EH-08 e m5
const t=new Date().toISOString();S.seed={...base};S.seed['equipamentos/EH-06']={...base['equipamentos/EH-06'],horimetro:6799};S.ts['equipamentos/EH-06']=t;
S.seed['equipamentos/EH-09']=eq('EH-09',10)[1];S.ts['equipamentos/EH-09']=t;delete S.seed['equipamentos/EH-08'];delete S.seed['movs/m5'];S.del={'equipamentos/EH-08':t,'movs/m5':t};
r=await abre();R('3a: so o que mudou (2 alterados + 2 apagados)',r.b1,r.b1.modo==='mudou'&&r.b1.baixados===4&&r.b1.mudou===4);
R('EH-06 com o horimetro novo',(await doc('equipamentos/EH-06')||{}).horimetro,(await doc('equipamentos/EH-06')||{}).horimetro===6799);
R('EH-09 apareceu',!!await doc('equipamentos/EH-09'),!!await doc('equipamentos/EH-09'));
R('EH-08 apagado em outro celular sumiu',await doc('equipamentos/EH-08'),(await doc('equipamentos/EH-08'))===null);
R('movimentacoes: 299',await n('movs'),await n('movs')===299);
// apagado e criado de novo depois: fica
const t2=new Date(Date.now()+1000).toISOString();S.seed['equipamentos/EH-08']=eq('EH-08',601)[1];S.ts['equipamentos/EH-08']=t2;
r=await abre();R('EH-08 criado de novo depois de apagado: volta',(await doc('equipamentos/EH-08')||{}).horimetro,(await doc('equipamentos/EH-08')||{}).horimetro===601);
// banco sem a tabela docs_del (script nao rodado): baixa tudo e funciona
S.nodel=true;S.seed['equipamentos/CB-01']={...base['equipamentos/CB-01'],horimetro:5050};S.ts['equipamentos/CB-01']=new Date().toISOString();
r=await abre();R('sem o script no banco: baixa tudo, sem erro',r.b1,r.b1.modo==='tudo'&&(await doc('equipamentos/CB-01')).horimetro===5050);
S.nodel=false;
// cursor com mais de 7 dias: recarga completa
await p.evaluate(()=>new Promise(ok=>{const q=indexedDB.open('frota');q.onsuccess=()=>{const d=q.result;const st=[...d.objectStoreNames];if(!st.includes('meta')){ok();return}const tx=d.transaction('meta','readwrite'),o=tx.objectStore('meta');const g=o.get('b1cur');g.onsuccess=()=>{const v=g.result;if(v){v.full=Date.now()-8*864e5;o.put(v,'b1cur')}};tx.oncomplete=ok;tx.onerror=ok}}));
r=await abre();R('ultima recarga completa ha 8 dias: baixa tudo',r.b1,r.b1.modo==='tudo');
r=await abre();R('depois volta a baixar so o que mudou',r.b1,r.b1.modo==='mudou');
// sem internet: abre com o que esta guardado
S.fail=true;r=await abre();R('sem internet: abre com o guardado (EH-09 aparece)',!!await doc('equipamentos/EH-09'),!!await doc('equipamentos/EH-09'));S.fail=false;
R('sem erros na pagina',errs.join(' | ')||'nenhum',!errs.length);
console.log(`\n${nok} ok, ${nf} falhas`);await b.close()})();
