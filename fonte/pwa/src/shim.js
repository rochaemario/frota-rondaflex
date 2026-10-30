/* Controle de Frota · camada do app baixavel
   O app foi escrito para o Claude (window.claude.use('db' | 'assets' | 'downloads')).
   Aqui as mesmas funcoes sao entregues pelo Supabase, com login e papeis da equipe:
   admin = tudo e gerencia a equipe · editor = lanca e edita · consulta = so ve. */
(function(){
  'use strict';
  const CFG=window.FROTA_CFG||{};
  const sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.__sb=sb;
  const BUCKET='arquivos',BUCKET_DOC='documentos';  /* documentos (veiculo, nota fiscal) ficam no armazenamento privado */
  window.__blobUrl=id=>`${CFG.url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(id)}`;

  /* ---------- utilidades ---------- */
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parentOf=p=>p.slice(0,p.lastIndexOf('/'));
  const idOf=p=>p.slice(p.lastIndexOf('/')+1);
  const rid=(n=20)=>{const a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',b=crypto.getRandomValues(new Uint8Array(n));let s='';for(const x of b)s+=a[x%62];return s};
  const hex=n=>[...crypto.getRandomValues(new Uint8Array(n/2))].map(b=>b.toString(16).padStart(2,'0')).join('');
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const err=(e,code)=>{const x=new Error((e&&e.message)||String(e));x.code=code||(e&&e.code==='42501'?'permission_denied':(e&&e.code==='P0002'?'not_found':'unavailable'));x.cause=e;return x};
  const later=(fn,ms)=>{let t;return()=>{clearTimeout(t);t=setTimeout(fn,ms)}};

  /* ---------- banco: tudo guardado no aparelho (funciona sem internet) ----------
     Os dados ficam numa copia local (IndexedDB). Ler e sempre local.
     Gravar muda a copia local na hora e entra numa fila; a fila e enviada quando houver internet.
     O que chega do servidor (tempo real ou recarga) e aplicado por cima, reaplicando o que ainda esta na fila. */
  const DOCS=new Map(),KIDS=new Map();          // path -> data · parent -> Set(path)
  let OUT=[];                                    // fila de envio [{k,op,path,data,patch,id,type}]
  const LOCALBLOB=new Map();                     // fotos ainda nao enviadas: id -> objectURL
  const remoteUrl=id=>`${CFG.url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(id)}`;
  window.__blobUrl=id=>LOCALBLOB.get(id)||remoteUrl(id);
  window.__remoteUrl=remoteUrl;
  /* documento privado: link temporario (1 h) so para quem esta logado; depois de aberto fica guardado no aparelho (abre sem internet).
     Documento antigo, ainda no armazenamento publico, continua abrindo pelo link de antes. */
  window.__docUrl=async id=>{if(LOCALBLOB.has(id))return LOCALBLOB.get(id);
    try{const c=await idbGet('blobs','doc:'+id);if(c&&c.blob){const u=URL.createObjectURL(c.blob);LOCALBLOB.set(id,u);return u}}catch(e){}
    try{const {data,error}=await sb.storage.from(BUCKET_DOC).createSignedUrl(id,3600);if(!error&&data&&data.signedUrl){
        try{const r=await fetch(data.signedUrl);if(r.ok){const b=await r.blob();await idbPut('blobs','doc:'+id,{blob:b,type:b.type});const u=URL.createObjectURL(b);LOCALBLOB.set(id,u);return u}}catch(e){}
        return data.signedUrl}}catch(e){}
    return remoteUrl(id)};
  let IDBH=null;
  const idbOpen=()=>new Promise((ok,no)=>{if(!('indexedDB' in window)){ok(null);return}const r=indexedDB.open('frota',1);
    r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('docs');d.createObjectStore('meta');d.createObjectStore('outbox',{keyPath:'k',autoIncrement:true});d.createObjectStore('blobs')};
    r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null)});
  const rq=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
  const st=(name,mode)=>IDBH?IDBH.transaction(name,mode||'readonly').objectStore(name):null;
  const idbPut=(name,key,val)=>{try{const o=st(name,'readwrite');if(o)return rq(key==null?o.put(val):o.put(val,key)).catch(e=>console.error(e))}catch(e){console.error(e)}return Promise.resolve()};
  const idbDel=(name,key)=>{try{const o=st(name,'readwrite');if(o)return rq(o.delete(key)).catch(e=>console.error(e))}catch(e){console.error(e)}return Promise.resolve()};
  const idbGet=(name,key)=>{try{const o=st(name);return o?rq(o.get(key)):Promise.resolve(undefined)}catch(e){return Promise.resolve(undefined)}};
  const metaGet=k=>idbGet('meta',k),metaSet=(k,v)=>idbPut('meta',k,v);

  const colSubs=new Map(),docSubs=new Map(),qSubs=new Map();
  const snapDoc=(path,data)=>({id:idOf(path),exists:data!=null,data:()=>data==null?undefined:clone(data),metadata:{fromCache:true,hasPendingWrites:false}});
  const rowsOf=parent=>[...(KIDS.get(parent)||[])].sort().map(p=>[p,DOCS.get(p)]);
  const snapCol=parent=>{const docs=rowsOf(parent).map(([p,d])=>snapDoc(p,d));return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:true,hasPendingWrites:false}}};
  const dirty=new Set();let notT=null;
  function notifyLater(parent,path){dirty.add(parent+'\u0000'+path);if(notT)return;notT=setTimeout(()=>{notT=null;const ds=[...dirty];dirty.clear();const parents=new Set();
    ds.forEach(x=>{const [pa,pt]=x.split('\u0000');parents.add(pa);const s=docSubs.get(pt);if(s)s.forEach(cb=>{try{cb(snapDoc(pt,DOCS.get(pt)??null))}catch(e){console.error(e)}})});
    parents.forEach(pa=>{const s=colSubs.get(pa);if(s){const sn=snapCol(pa);s.forEach(cb=>{try{cb(sn)}catch(e){console.error(e)}})}const q=qSubs.get(pa);if(q)q.forEach(f=>f())});
    setTimeout(updSync,0)},20)}
  /* o app nao usa acentos: todo texto que entra ou chega do servidor fica sem acento */
  const semAc=v=>typeof v==='string'?v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC'):Array.isArray(v)?v.map(semAc):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,semAc(x)])):v;
  function setLocal(path,data,persist=true){const parent=parentOf(path);data=data==null?data:semAc(data);
    if(data==null){DOCS.delete(path);const k=KIDS.get(parent);if(k)k.delete(path)}else{DOCS.set(path,data);let k=KIDS.get(parent);if(!k)KIDS.set(parent,k=new Set());k.add(path)}
    if(persist){if(data==null)idbDel('docs',path);else idbPut('docs',path,{parent,data})}
    notifyLater(parent,path)}
  const replay=(base,o)=>o.op==='set'?clone(o.data):o.op==='update'?(base?{...base,...clone(o.patch)}:base):o.op==='delete'?null:base;
  const pendingFor=path=>OUT.filter(o=>o.path===path&&(o.op==='set'||o.op==='update'||o.op==='delete'));
  function remoteApply(path,data){let d=data==null?null:data;pendingFor(path).forEach(o=>{d=replay(d,o)});setLocal(path,d)}

  /* fila de envio */
  async function enqueue(o){o.ts=Date.now();OUT.push(o);
    if(IDBH){try{o.k=await rq(st('outbox','readwrite').add(o))}catch(e){console.error(e)}}
    updSync();flushSoon()}
  let netOk=navigator.onLine,flushing=false,flushT=null;
  const flushSoon=()=>{clearTimeout(flushT);flushT=setTimeout(flush,50)};
  const isNet=e=>!e||/fetch|network|load failed|timeout|offline/i.test(String(e.message||e))||(!e.code&&!e.status);
  async function runOp(o){
    if(o.op==='set'){const {error}=await sb.from('docs').upsert({path:o.path,parent:parentOf(o.path),data:o.data,updated_at:new Date().toISOString()});if(error)throw error;return}
    if(o.op==='update'){const {error}=await sb.rpc('doc_update',{p_path:o.path,p_patch:o.patch});
      if(error&&error.code==='P0002'){const d=DOCS.get(o.path);if(d){const r=await sb.from('docs').upsert({path:o.path,parent:parentOf(o.path),data:d,updated_at:new Date().toISOString()});if(r.error)throw r.error}return}
      if(error)throw error;return}
    if(o.op==='delete'){const {error}=await sb.from('docs').delete().eq('path',o.path);if(error)throw error;return}
    if(o.op==='upload'){const b=await idbGet('blobs',o.id);if(!b)return;const {error}=await sb.storage.from(o.bkt||BUCKET).upload(o.id,b.blob,{contentType:o.type,cacheControl:'31536000',upsert:true});if(error)throw error;idbDel('blobs',o.id);return}
    if(o.op==='rmfile'){const {error}=await sb.storage.from(BUCKET).remove([o.id]);if(error)throw error;try{await sb.storage.from(BUCKET_DOC).remove([o.id])}catch(e){}return}}
  async function flush(){if(flushing||!OUT.length)return;if(!navigator.onLine){netOk=false;updSync();return}flushing=true;updSync();
    try{while(OUT.length){const o=OUT[0];
      try{await runOp(o);netOk=true}
      catch(e){if(isNet(e)){netOk=false;break}console.error('envio recusado',o,e);avisar('Alteracao nao enviada','O servidor recusou uma alteracao feita sem internet.')}
      OUT.shift();if(o.k!=null)idbDel('outbox',o.k)}}
    finally{flushing=false;updSync()}}
  setInterval(()=>{if(OUT.length)flush()},20000);

  /* recarga completa do servidor (ao abrir, ao voltar a internet e depois de importar) */
  let pulling=null;
  function pull(){if(pulling)return pulling;pulling=(async()=>{
    const srv=new Map();let from=0;const N=1000;
    for(;;){const {data,error}=await sb.from('docs').select('path,parent,data').order('path').range(from,from+N-1);if(error)throw error;data.forEach(r=>srv.set(r.path,r.data));
      const pg=document.getElementById('dl-pg');if(pg)pg.textContent=`Baixando ${srv.size} registros…`;if(data.length<N)break;from+=N}
    const pend=new Set(OUT.map(o=>o.path).filter(Boolean));
    const mud=new Set(),vazio=!DOCS.size;
    [...DOCS.keys()].forEach(p=>{if(!srv.has(p)&&!pend.has(p)){setLocal(p,null,false);mud.add(p)}});
    srv.forEach((d,p)=>{let x=semAc(d);pendingFor(p).forEach(o=>{x=replay(x,o)});const cur=DOCS.get(p);if(JSON.stringify(cur)!==JSON.stringify(x)){setLocal(p,x,false);mud.add(p)}});
    /* so grava no aparelho o que mudou (antes regravava tudo a cada abertura) */
    if(IDBH&&(mud.size||vazio)){await new Promise(ok=>{const t=IDBH.transaction('docs','readwrite'),o=t.objectStore('docs');
      if(vazio){o.clear();DOCS.forEach((d,p)=>o.put({parent:parentOf(p),data:d},p))}else mud.forEach(p=>{const d=DOCS.get(p);if(d==null)o.delete(p);else o.put({parent:parentOf(p),data:d},p)});
      t.oncomplete=ok;t.onerror=ok;t.onabort=ok})}
    await metaSet('pulled',Date.now());netOk=true})().catch(e=>{if(isNet(e))netOk=false;else console.error(e);throw e}).finally(()=>{pulling=null;updSync()});return pulling}
  /* rede lenta: o app abre com o que esta guardado e atualiza depois, sem travar a abertura */
  const LENTO='frota.lento';
  const conLenta=()=>{if(!navigator.onLine)return true;const c=navigator.connection||{};if(c.saveData||/(^|-)2g$/.test(c.effectiveType||'')||(c.rtt&&c.rtt>=700)||(c.downlink&&c.downlink<0.4))return true;
    try{return Date.now()-(+localStorage.getItem(LENTO)||0)<30*60000}catch(e){return false}};
  window.__frotaLenta=conLenta;
  /* aviso ainda na fila (sem internet): o app mostra o relogio na mensagem */
  window.__frotaPend=path=>OUT.some(o=>o.path===path);
  const sincronizar=()=>{const t0=Date.now();return flush().then(()=>pull()).then(()=>{try{if(Date.now()-t0>6000)localStorage.setItem(LENTO,Date.now());else localStorage.removeItem(LENTO)}catch(e){}}).then(()=>flush()).catch(()=>{})};
  /* depois de abrir: espera a tela aparecer (e mais um pouco se a rede estiver lenta) para atualizar */
  const syncDepois=()=>{const go=()=>sincronizar();const ms=conLenta()?3500:400;setTimeout(()=>{'requestIdleCallback' in window?requestIdleCallback(go,{timeout:2500}):go()},ms)};

  /* abre a copia local */
  async function dbInit(){IDBH=await idbOpen();if(!IDBH)return false;
    try{const t=IDBH.transaction(['docs','outbox','blobs'],'readonly');
      const [keys,vals,outs,bks]=await Promise.all([rq(t.objectStore('docs').getAllKeys()),rq(t.objectStore('docs').getAll()),rq(t.objectStore('outbox').getAll()),rq(t.objectStore('blobs').getAllKeys())]);
      keys.forEach((p,i)=>{const v=vals[i];DOCS.set(p,semAc(v.data));let k=KIDS.get(v.parent);if(!k)KIDS.set(v.parent,k=new Set());k.add(p)});
      OUT=outs;
      /* abertura rapida: documentos guardados (doc:) so sao lidos quando abertos; aqui so as fotos ainda nao enviadas */
      const pend=bks.filter(k=>!String(k).startsWith('doc:'));if(pend.length){const t2=IDBH.transaction('blobs','readonly'),o2=t2.objectStore('blobs');
        const bv=await Promise.all(pend.map(k=>rq(o2.get(k)).catch(()=>null)));pend.forEach((id,i)=>{try{if(bv[i]&&bv[i].blob)LOCALBLOB.set(id,URL.createObjectURL(bv[i].blob))}catch(e){}})}}catch(e){console.error(e)}
    return !!(await metaGet('pulled'))}

  /* tempo real */
  let channel=null,wasSub=false;
  function realtime(){if(channel)return;channel=sb.channel('docs-all').on('postgres_changes',{event:'*',schema:'public',table:'docs'},p=>{
      const row=p.new&&p.new.path?p.new:null,old=p.old&&p.old.path?p.old:null;
      if(p.eventType==='DELETE'){if(old)remoteApply(old.path,null)}else if(row)remoteApply(row.path,row.data)})
    .subscribe(s=>{if(s==='SUBSCRIBED'){if(wasSub)sincronizar();wasSub=true;netOk=true;updSync()}else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){netOk=false;updSync()}})}
  function updSync(){const el=document.getElementById('sync');if(!el)return;const n=OUT.length,on=navigator.onLine&&netOk;
    const t=!on?(n?`Sem internet · ${n} pendente${n>1?'s':''}`:'Sem internet'):n?'Sincronizando…':'Sincronizado';
    if(el.textContent!==t)el.textContent=t;el.className='sync '+(on&&!n?'on':'off')}
  addEventListener('offline',()=>{netOk=false;updSync()});addEventListener('online',()=>{netOk=true;updSync();if(semSessao){sb.auth.getSession().then(({data})=>{if(data&&data.session){semSessao=false;sincronizar()}else loginForm('Entre de novo para enviar o que foi lancado sem internet.')}).catch(()=>{});return}sincronizar()});
  let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>60000)sincronizar()});

  /* consultas feitas na copia local */
  const cmp=(a,b)=>{if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;if(typeof a==='number'&&typeof b==='number')return a-b;const x=String(a),y=String(b);return x<y?-1:x>y?1:0};
  const TEST={'==':(a,b)=>a==b||String(a)===String(b),'!=':(a,b)=>!(a==b||String(a)===String(b)),'<':(a,b)=>a!=null&&cmp(a,b)<0,'<=':(a,b)=>a!=null&&cmp(a,b)<=0,'>':(a,b)=>a!=null&&cmp(a,b)>0,'>=':(a,b)=>a!=null&&cmp(a,b)>=0,
    'in':(a,b)=>b.map(String).includes(String(a)),'not-in':(a,b)=>!b.map(String).includes(String(a))};
  function docRef(path){
    return {id:idOf(path),path,
      async get(){return snapDoc(path,DOCS.get(path)??null)},
      async set(d){const data=semAc(clone(d));setLocal(path,data);await enqueue({op:'set',path,data})},
      async update(patch){const cur=DOCS.get(path);if(!cur){const e=new Error('not_found');e.code='not_found';throw e}const p=semAc(clone(patch));setLocal(path,{...cur,...p});await enqueue({op:'update',path,patch:p})},
      async delete(){setLocal(path,null);await enqueue({op:'delete',path})},
      onSnapshot(cb,onErr){let set=docSubs.get(path);if(!set)docSubs.set(path,set=new Set());set.add(cb);realtime();
        Promise.resolve().then(()=>{if(set.has(cb))cb(snapDoc(path,DOCS.get(path)??null))});return()=>set.delete(cb)}};
  }
  function query(parent,w,o,l){
    function run(){let rows=rowsOf(parent).filter(([,d])=>w.every(([f,op,v])=>{const t=TEST[op];if(!t)throw err('operador nao suportado: '+op,'invalid_argument');return t(d[f],v)}));
      if(o)rows.sort((a,b)=>{const r=cmp(a[1][o[0]],b[1][o[0]]);return o[1]==='desc'?-r:r});if(l)rows=rows.slice(0,l);
      const docs=rows.map(([p,d])=>snapDoc(p,d));return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[]}}
    return {where:(f,op,v)=>query(parent,[...w,[f,op,v]],o,l),orderBy:(f,dir)=>query(parent,w,[f,dir||'asc'],l),limit:n=>query(parent,w,o,n),get:async()=>run(),
      onSnapshot(cb,onErr){realtime();let alive=true;const go=()=>{if(!alive)return;try{cb(run())}catch(e){onErr&&onErr(e)}};const f=later(go,60);
        let set=qSubs.get(parent);if(!set)qSubs.set(parent,set=new Set());set.add(f);Promise.resolve().then(go);return()=>{alive=false;set.delete(f)}}};
  }
  function collection(parent){
    const q=query(parent,[],null,0);
    return {...q,path:parent,id:idOf(parent),
      doc:id=>docRef(parent+'/'+(id||rid())),
      async add(d){const r=docRef(parent+'/'+rid());await r.set(d);return r},
      async get(){return snapCol(parent)},
      onSnapshot(cb,onErr){realtime();let set=colSubs.get(parent);if(!set)colSubs.set(parent,set=new Set());set.add(cb);
        Promise.resolve().then(()=>{if(set.has(cb))cb(snapCol(parent))});return()=>set.delete(cb)}};
  }
  const DB=Object.freeze({doc:docRef,collection});
  /* espera a foto chegar ao servidor (usado antes de abrir o Google Lens) */
  window.__assetPronto=id=>new Promise((ok,no)=>{const t0=Date.now();flushSoon();const tick=()=>{if(!OUT.some(o=>o.op==='upload'&&o.id===id)){ok();return}if(Date.now()-t0>30000||!navigator.onLine){no(new Error('timeout'));return}setTimeout(tick,300)};tick()});

  /* ---------- arquivos (fotos e PDFs): guardados no aparelho e enviados pela fila ---------- */
  const ASSETS=Object.freeze({
    async upload(blob,opts={}){const id=hex(32),type=opts.type||blob.type||'application/octet-stream';
      await idbPut('blobs',id,{blob,type});try{LOCALBLOB.set(id,URL.createObjectURL(blob))}catch(e){}
      await enqueue({op:'upload',id,type,...(opts.priv?{bkt:BUCKET_DOC}:{})});return {id,url:window.__blobUrl(id),sizeBytes:blob.size,contentType:type}},
    async delete(id){const i=OUT.findIndex(o=>o.op==='upload'&&o.id===id);
      if(i>=0&&!(flushing&&i===0)){const o=OUT.splice(i,1)[0];if(o.k!=null)idbDel('outbox',o.k);idbDel('blobs',id);updSync();return}
      await enqueue({op:'rmfile',id})},
    async list(){return {assets:[],usage:{}}}});

  /* ---------- baixar arquivo ---------- */
  const DOWNLOADS=Object.freeze({async save({filename,data}){const b=data instanceof Blob?data:new Blob([data]);const u=URL.createObjectURL(b);
    const a=document.createElement('a');a.href=u;a.download=filename||'arquivo';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);return {ok:true}}});

  /* ---------- login ---------- */
  let perfil=null,resolveReady;const ready=new Promise(r=>resolveReady=r);
  const CSS=`.lg{position:fixed;inset:0;z-index:100;background:var(--bg,#edf0f5);display:flex;flex-direction:column;overflow:auto}
  .lg-top{background:var(--ink,#0b2470);color:#fff;padding:calc(18px + env(safe-area-inset-top,0px)) max(20px,env(safe-area-inset-right,0px)) 18px max(20px,env(safe-area-inset-left,0px))}
  .lg-top .brand{font-size:24px}
  .lg-c{width:100%;max-width:400px;margin:28px auto;padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:14px}
  .lg-c h1{font-family:var(--display);font-size:26px;letter-spacing:.005em;margin:0}
  .lg-c p{margin:0;color:var(--muted);font-size:14px}
  .lg-f{background:var(--surface,#fff);border-radius:18px;padding:16px 14px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}
  .lg-e{font-size:13px;color:var(--bad);font-weight:600;min-height:0}.lg-e:empty{display:none}
  .lg-l{background:none;border:0;color:var(--accent);font:inherit;font-size:14px;font-weight:600;padding:6px 0;cursor:pointer;align-self:center}
  .lg-logo{display:block;margin:auto auto calc(16px + env(safe-area-inset-bottom,0px));height:22px;opacity:.85}
  .acct{position:fixed;z-index:90;right:max(12px,env(safe-area-inset-right,0px));top:calc(54px + env(safe-area-inset-top,0px));background:var(--surface,#fff);border-radius:16px;box-shadow:0 10px 30px rgba(11,36,112,.22);padding:14px;min-width:230px;max-width:calc(100vw - 24px);display:flex;flex-direction:column;gap:10px}
  .acct b{font-size:15px}.acct span{font-size:13px;color:var(--muted)}
  .eqp{display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow:auto}
  .eqp-r{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.eqp-r:first-child{border-top:0}
  .eqp-r div{flex:1;min-width:0}.eqp-r div b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.eqp-r div small{color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}
  .eqp-r select{width:auto;min-height:38px;font-size:14px}
  body.papel-consulta #fab,body.papel-consulta #sideaj,body.papel-consulta #sidehm,body.papel-consulta #cartb{display:none!important}
  .dg-r{display:flex;align-items:center;gap:12px;padding-top:10px;border-top:1px solid var(--line)}.dg-r[hidden]{display:none}.dg-r div{flex:1;min-width:0}.dg-r b{display:block;font-size:14.5px}.dg-r small{font-size:12.5px;color:var(--muted)}
  .sw{width:46px;height:28px;border-radius:14px;border:0;padding:0;background:#c9cfda;position:relative;flex:none;cursor:pointer;transition:background .15s}.sw:after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .15s}
  .sw[aria-checked="true"]{background:var(--accent,#0033a0)}.sw[aria-checked="true"]:after{left:21px}
  .lk{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;margin-top:12vh}
  .lk-i{width:96px;height:96px;border-radius:50%;background:#e4e9f4;color:var(--accent,#0033a0);display:flex;align-items:center;justify-content:center}.lk-i svg{width:54px;height:54px}
  .lk p{max-width:290px}.lk .btn{width:100%;margin-top:6px}
  .imp-p{height:8px;border-radius:4px;background:var(--sunk);overflow:hidden}.imp-p i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s}`;
  function css(){if(document.getElementById('lg-css'))return;const s=document.createElement('style');s.id='lg-css';s.textContent=CSS;document.head.appendChild(s)}
  const BRAND='<div class="brand"><i></i>Controle de Frota</div>';
  function screen(html,mount){css();let o=document.getElementById('lg');if(!o){o=document.createElement('div');o.id='lg';o.className='lg';document.body.appendChild(o)}
    o.innerHTML=`<div class="lg-top">${BRAND}</div><div class="lg-c">${html}</div>`;mount&&mount(o);return o}
  const closeScreen=()=>{const o=document.getElementById('lg');if(o)o.remove()};
  function loginForm(msg){screen(`<h1>Entrar</h1><p>Use o e-mail e a senha que o administrador cadastrou para voce.</p>
    <form class="lg-f" id="lg-f"><label class="f">E-mail<input id="lg-m" type="email" autocomplete="username" inputmode="email" required></label>
    <label class="f">Senha<input id="lg-p" type="password" autocomplete="current-password" required></label><div class="lg-e" id="lg-x">${esc(msg||'')}</div>
    <button class="btn pri" id="lg-b">Entrar</button></form><button type="button" class="lg-l" id="lg-r">Esqueci a senha</button>`,o=>{
      const f=o.querySelector('#lg-f'),x=o.querySelector('#lg-x'),b=o.querySelector('#lg-b');
      try{const m=localStorage.getItem('frota.email');if(m)o.querySelector('#lg-m').value=m}catch(e){}
      f.onsubmit=async ev=>{ev.preventDefault();x.textContent='';b.disabled=true;b.textContent='Entrando…';const email=o.querySelector('#lg-m').value.trim();
        acabouDeEntrar=true;const {error}=await sb.auth.signInWithPassword({email,password:o.querySelector('#lg-p').value});
        b.disabled=false;b.textContent='Entrar';
        if(error){x.textContent=/invalid/i.test(error.message)?'E-mail ou senha incorretos.':/fetch|network/i.test(error.message)?'Sem conexao com a internet.':'Nao foi possivel entrar. Tente de novo.';return}
        try{localStorage.setItem('frota.email',email)}catch(e){}};
      o.querySelector('#lg-r').onclick=async()=>{const email=o.querySelector('#lg-m').value.trim();if(!email){x.textContent='Digite seu e-mail acima e toque de novo em "Esqueci a senha".';return}
        const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
        x.style.color='var(--ok)';x.textContent=error?'':'Enviamos um link para criar uma nova senha. Confira seu e-mail.';if(error){x.style.color='';x.textContent='Nao foi possivel enviar. Confira o e-mail.'}}})}
  function newPassword(){screen(`<h1>Nova senha</h1><p>Crie sua nova senha de acesso.</p><form class="lg-f" id="np-f"><label class="f">Nova senha<input id="np-p" type="password" minlength="6" autocomplete="new-password" required></label><div class="lg-e" id="np-x"></div><button class="btn pri">Salvar senha</button></form>`,o=>{
    o.querySelector('#np-f').onsubmit=async ev=>{ev.preventDefault();const {error}=await sb.auth.updateUser({password:o.querySelector('#np-p').value});if(error){o.querySelector('#np-x').textContent='Use pelo menos 6 caracteres.';return}history.replaceState(null,'',location.pathname);start()}})}
  function waiting(){screen(`<h1>Aguardando liberacao</h1><p>Seu acesso foi criado, mas o administrador ainda precisa liberar. Peca para ele abrir <b>Equipe</b> no app.</p><button type="button" class="btn" id="lg-o">Sair</button>`,o=>{o.querySelector('#lg-o').onclick=()=>(saindo=true,sb.auth.signOut())})}

  let started=false,acabouDeEntrar=false,travaP=null,saindo=false,semSessao=false;
  /* ---------- digital: trava ao abrir o app (so neste aparelho) ----------
     Usa o desbloqueio do proprio celular (digital, rosto ou a senha do celular).
     A digital nunca sai do aparelho; o app so recebe "confirmado". */
  const DGK='frota.dg',b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),
    unb64=t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((t.length+3)%4)),c=>c.charCodeAt(0)),rnd=()=>crypto.getRandomValues(new Uint8Array(32));
  const dgLer=uid=>{try{const d=JSON.parse(localStorage.getItem(DGK)||'null');return d&&d.uid===uid?d:null}catch(e){return null}};
  const dgPode=async()=>{try{return !!(window.PublicKeyCredential&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())}catch(e){return false}};
  async function dgCriar(u){const c=await navigator.credentials.create({publicKey:{challenge:rnd(),rp:{name:'Controle de Frota'},
      user:{id:new TextEncoder().encode(u.user_id).slice(0,64),name:u.email||'frota',displayName:u.nome||u.email||'Frota'},
      pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
      authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
    localStorage.setItem(DGK,JSON.stringify({uid:u.user_id,id:b64(c.rawId)}))}
  async function dgConferir(d){await navigator.credentials.get({publicKey:{challenge:rnd(),allowCredentials:[{type:'public-key',id:unb64(d.id),transports:['internal']}],userVerification:'required',timeout:60000}});return true}
  function avisar(t,m){document.querySelectorAll('.toast').forEach(x=>x.remove());const e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.innerHTML=`<b class="toast-t">${esc(t)}</b><span>${esc(m)}</span>`;e.onclick=()=>e.remove();document.body.appendChild(e);setTimeout(()=>e.remove(),4000)}
  const FP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11c0 3.5-.6 6.4-2 9"/><path d="M8.6 7.6A5 5 0 0 1 17 11c0 2-.2 3.8-.6 5.5"/><path d="M7 11a5 5 0 0 1 .4-2"/><path d="M15 12c0 2.6-.4 5-1.2 7"/><path d="M9 12.5c0 2-.3 3.8-.9 5.4"/><path d="M5.2 15.5c.5-1.4.8-2.9.8-4.5a6 6 0 0 1 9.8-4.6"/><path d="M18.8 8.5c.4.8.7 1.6.9 2.5"/><path d="M12 15c0 1.8-.2 3.5-.6 5"/></svg>';
  function travar(d){return new Promise(ok=>{
    screen(`<div class="lk"><div class="lk-i">${FP}</div><h1>App bloqueado</h1><p>Use a digital para abrir o Controle de Frota. Se nao funcionar, use a senha do celular.</p><div class="lg-e" id="lk-x"></div><button type="button" class="btn pri" id="lk-b">Desbloquear</button><button type="button" class="lg-l" id="lk-o">Entrar com e-mail e senha</button></div>`,o=>{
      const x=o.querySelector('#lk-x'),b=o.querySelector('#lk-b');let ocupado=false;
      const tentar=async()=>{if(ocupado)return;ocupado=true;x.textContent='';try{await dgConferir(d);ok()}catch(e){x.textContent=e&&e.name==='NotAllowedError'?'':'Nao foi possivel usar o desbloqueio do celular. Entre com e-mail e senha.'}ocupado=false};
      b.onclick=tentar;o.querySelector('#lk-o').onclick=async()=>{try{localStorage.removeItem(DGK)}catch(e){}await (saindo=true,sb.auth.signOut())};
      setTimeout(tentar,250)})})}
  /* sessao guardada no aparelho (para abrir sem internet) */
  const sessaoGuardada=()=>{try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^sb-.*-auth-token$/.test(k)){const v=JSON.parse(localStorage.getItem(k));const s=v&&(v.currentSession||v);if(s&&s.user)return s}}}catch(e){}return null};
  /* uma abertura por vez (o aviso de sessao do servidor pode chegar enquanto a abertura ainda corre) */
  let startP=null;function start(){if(startP)return startP;startP=start0().finally(()=>{startP=null});return startP}
  async function start0(){
    /* sessao: nao espera mais que 1,5 s pelo servidor; segue com a guardada e renova em segundo plano */
    let session=null;const guard=sessaoGuardada();
    if(guard&&!acabouDeEntrar&&!started){session=guard;sb.auth.getSession().catch(()=>{})}
    else try{const r=await Promise.race([sb.auth.getSession(),new Promise(ok=>setTimeout(()=>ok(guard&&!acabouDeEntrar?{data:{session:guard},lento:true}:null),1500))]);if(r)session=r.data.session}catch(e){}
    if(!session&&!acabouDeEntrar)session=guard;
    if(!session&&acabouDeEntrar){try{({data:{session}}=await sb.auth.getSession())}catch(e){}}
    /* sem sessao e sem internet: se este aparelho ja foi usado, abre com os dados guardados (login volta a ser pedido quando houver internet) */
    if(!session&&!navigator.onLine&&!started){let pf0=null;try{pf0=JSON.parse(localStorage.getItem('frota.perfil')||'null')}catch(e){}
      if(pf0&&await dbInit()){window.__frotaEu={uid:pf0.user_id,nome:pf0.nome||'',email:pf0.email||'',papel:pf0.papel};const dg0=dgLer(pf0.user_id);if(dg0){travaP=travaP||travar(dg0);await travaP}perfil=pf0;document.body.classList.add('papel-'+perfil.papel);closeScreen();started=true;semSessao=true;resolveReady();setTimeout(updSync,300);return}}
    if(!session){loginForm();return}
    const dg=!acabouDeEntrar&&!started&&dgLer(session.user.id);if(dg){travaP=travaP||travar(dg);await travaP}
    let pf=null;try{pf=JSON.parse(localStorage.getItem('frota.perfil')||'null')}catch(e){}if(pf&&pf.user_id!==session.user.id)pf=null;
    const buscaPerfil=async()=>{let d=null,e=null;try{({data:d,error:e}=await sb.from('perfis').select('user_id,email,nome,papel').eq('user_id',session.user.id).maybeSingle())}catch(x){e=x}return {d,e}};
    let data=null;
    if(pf&&!acabouDeEntrar){data=pf;
      /* perfil guardado: abre na hora e confere com o servidor depois */
      buscaPerfil().then(({d,e})=>{if(e)return;if(!d){waiting();return}if(JSON.stringify(d)!==JSON.stringify(pf)){perfil=d;try{localStorage.setItem('frota.perfil',JSON.stringify(d))}catch(x){}
        document.body.classList.remove('papel-admin','papel-editor','papel-consulta');document.body.classList.add('papel-'+d.papel);window.__frotaEu={uid:d.user_id,nome:d.nome||'',email:d.email||'',papel:d.papel};if(d.papel!==pf.papel)setTimeout(()=>location.reload(),300)}})}
    else{const {d,e}=await buscaPerfil();if(e){if(!pf){loginForm('Sem conexao com o servidor. No primeiro acesso a internet e necessaria.');return}data=pf}else data=d}
    if(!data){waiting();return}
    perfil=data;try{localStorage.setItem('frota.perfil',JSON.stringify(data))}catch(e){}
    document.body.classList.remove('papel-admin','papel-editor','papel-consulta');document.body.classList.add('papel-'+perfil.papel);
    if(!started){
      const tem=await dbInit();
      if(!tem){screen('<h1>Carregando os dados</h1><p>Baixando a frota para este aparelho. So acontece no primeiro acesso.</p><p id="dl-pg" style="font-weight:600;color:var(--fg)">Conectando…</p>');
        try{await pull()}catch(e){screen('<h1>Sem internet</h1><p>No primeiro uso neste aparelho e preciso internet para baixar os dados. Depois o app funciona sem internet.</p><button type="button" class="btn pri" id="of-t">Tentar de novo</button>',o=>{o.querySelector('#of-t').onclick=()=>start()});return}}
      else syncDepois();
      window.__frotaEu={uid:perfil.user_id,nome:perfil.nome||'',email:perfil.email||'',papel:perfil.papel};
      closeScreen();started=true;resolveReady();setTimeout(updSync,300);setTimeout(()=>{realtime();equipeSync()},conLenta()?3000:300);return}
    closeScreen()
  }
  sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY'){newPassword();return}if(ev==='SIGNED_IN'){if(!started)start();else{const era=semSessao;semSessao=false;closeScreen();era?sincronizar():syncDepois()}return}
    /* sessao perdida sem o usuario pedir (ex.: senha trocada): pede login de novo, sem apagar o que esta guardado */
    if(ev==='SIGNED_OUT'&&!saindo){if(started)loginForm('Entre de novo para enviar o que esta guardado neste aparelho.');return}
    if(ev==='SIGNED_OUT'){try{sessionStorage.clear();localStorage.removeItem('frota.perfil')}catch(e){}try{IDBH&&IDBH.close();const r=indexedDB.deleteDatabase('frota');r.onsuccess=r.onerror=r.onblocked=()=>location.reload();setTimeout(()=>location.reload(),1500)}catch(e){location.reload()}}});

  /* ---------- conta e equipe (toque em "Sincronizado") ---------- */
  const PAPEL={admin:'Administrador',editor:'Editor',consulta:'Consulta'};
  document.addEventListener('click',ev=>{const s=ev.target.closest&&ev.target.closest('#sync');const open=document.getElementById('acct');
    if(open&&!ev.target.closest('#acct')){open.remove();if(!s)return}
    if(!s||!perfil)return;ev.stopPropagation();ev.preventDefault();if(open)return;css();
    const d=document.createElement('div');d.id='acct';d.className='acct';
    d.innerHTML=`<div><b>${esc(perfil.nome||perfil.email)}</b><br><span>${esc(perfil.email)} · ${PAPEL[perfil.papel]}</span></div>${perfil.papel==='admin'?'<button type="button" class="btn" id="ac-eq">Equipe</button><button type="button" class="btn" id="ac-imp">Importar dados</button>':''}<div class="dg-r" id="ac-dg" hidden><div><b>Entrar com digital</b><small>Pede a digital ao abrir o app</small></div><button type="button" class="sw" role="switch" aria-checked="false" aria-label="Entrar com digital"></button></div><button type="button" class="btn" id="ac-out">Sair</button>`;
    document.body.appendChild(d);d.querySelector('#ac-out').onclick=()=>{if(OUT.length){avisar('Alteracoes ainda nao enviadas',`Ha ${OUT.length} ${OUT.length>1?'alteracoes':'alteracao'} esperando internet. Conecte e aguarde Sincronizado antes de sair.`);return}(saindo=true,sb.auth.signOut())};const eq=d.querySelector('#ac-eq');if(eq)eq.onclick=()=>{d.remove();equipe()};const im=d.querySelector('#ac-imp');if(im)im.onclick=()=>{d.remove();importar()};
    const dr=d.querySelector('#ac-dg'),sw=dr.querySelector('.sw');const pinta=()=>sw.setAttribute('aria-checked',!!dgLer(perfil.user_id));pinta();
    dgPode().then(v=>{dr.hidden=!v});
    sw.onclick=async()=>{if(dgLer(perfil.user_id)){try{localStorage.removeItem(DGK)}catch(e){}pinta();avisar('Digital desativada','O app abre sem pedir a digital');return}
      try{await dgCriar(perfil);pinta();avisar('Digital ativada','O app vai pedir a digital ao abrir')}catch(e){if(!(e&&e.name==='NotAllowedError'))avisar('Nao foi possivel ativar','Este celular nao liberou o uso da digital')}}},true);
  /* lista da equipe para os avisos: o administrador publica nomes e papeis (sem dados sensiveis) */
  async function equipeSync(){if(!perfil||perfil.papel!=='admin'||!navigator.onLine)return;
    try{const {data,error}=await sb.from('perfis').select('user_id,email,nome,papel').order('nome');if(error||!data)return;
      const pessoas=data.filter(p=>p.papel).map(p=>({uid:p.user_id,nome:p.nome||'',email:p.email||'',papel:p.papel}));
      const cur=DOCS.get('config/equipe');if(cur&&JSON.stringify(cur.pessoas)===JSON.stringify(pessoas))return;
      await DB.doc('config/equipe').set({pessoas})}catch(e){console.error(e)}}
  async function equipe(){
    const {data,error}=await sb.from('perfis').select('user_id,email,nome,papel').order('nome');
    screen(`<h1>Equipe</h1><p>Novas pessoas: crie o acesso no Supabase (Authentication › Add user). Elas aparecem aqui como Consulta; escolha o papel.</p>
      <div class="lg-f"><div class="eqp">${error?'<div class="lg-e">Nao foi possivel carregar.</div>':data.map(p=>`<div class="eqp-r"><div><b>${esc(p.nome||p.email)}</b><small>${esc(p.email||'')}</small></div><select data-u="${esc(p.user_id)}"${p.user_id===perfil.user_id?' disabled':''}>${Object.entries(PAPEL).map(([k,v])=>`<option value="${k}"${p.papel===k?' selected':''}>${v}</option>`).join('')}</select></div>`).join('')}</div></div>
      <button type="button" class="btn pri" id="eq-ok">Concluir</button>`,o=>{
        o.querySelectorAll('[data-u]').forEach(s=>s.onchange=async()=>{s.disabled=true;const {error}=await sb.from('perfis').update({papel:s.value}).eq('user_id',s.dataset.u);s.disabled=false;if(error){s.style.borderColor='var(--bad)'}else s.style.borderColor=''});
        o.querySelector('#eq-ok').onclick=()=>{closeScreen();equipeSync()}})}

  /* ---------- importar o pacote de mudanca (dados + fotos e documentos do app antigo) ---------- */
  function importar(){screen(`<h1>Importar dados</h1><p>Escolha o arquivo (.json) que o Claude preparou. Dados com o mesmo caminho sao substituidos; nada e apagado.</p>
    <div class="lg-f"><label class="btn pri" style="position:relative;overflow:hidden">Escolher pacote<input id="imp-f" type="file" accept=".json,application/json" style="position:absolute;inset:0;opacity:0"></label>
    <div class="imp-p" hidden id="imp-pb"><i></i></div><div class="lg-e" id="imp-x" style="color:var(--muted)"></div></div><button type="button" class="btn" id="imp-ok">Fechar</button>`,o=>{
      o.querySelector('#imp-ok').onclick=closeScreen;const x=o.querySelector('#imp-x'),pb=o.querySelector('#imp-pb'),bar=pb.querySelector('i');
      o.querySelector('#imp-f').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;x.style.color='var(--muted)';x.textContent='Lendo o pacote…';pb.hidden=false;bar.style.width='0';
        try{const dados=JSON.parse(await f.text());if(dados&&Array.isArray(dados.abast)&&window.__frotaLote){closeScreen();window.__frotaLote(dados.abast);return}if(dados&&Array.isArray(dados.itens)&&window.__frotaItens){closeScreen();window.__frotaItens(dados.itens);return}if(!dados||!dados.docs)throw new Error('arquivo nao e um pacote do app');
          const docs=Object.entries(dados.docs),arqs=Object.entries(dados.arquivos||{});
          const tot=docs.length+arqs.length||1;let feito=0;const tick=()=>{bar.style.width=Math.round(++feito/tot*100)+'%'};
          for(let i=0;i<docs.length;i+=200){const lote=docs.slice(i,i+200).map(([path,data])=>({path,parent:parentOf(path),data}));
            x.textContent=`Gravando dados (${Math.min(i+200,docs.length)} de ${docs.length})…`;const {error}=await sb.from('docs').upsert(lote);if(error)throw error;lote.forEach(tick)}
          let falhas=0,k=0;for(const [id,b64] of arqs){const tipo=(dados.tipos||{})[id]||'application/octet-stream';x.textContent=`Enviando fotos e documentos (${++k} de ${arqs.length})…`;
            const bin=atob(b64),u8=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)u8[j]=bin.charCodeAt(j);
            const {error}=await sb.storage.from(BUCKET).upload(id,new Blob([u8],{type:tipo}),{contentType:tipo,cacheControl:'31536000',upsert:true});if(error)falhas++;tick()}
          x.style.color=falhas?'var(--bad)':'var(--ok)';x.textContent=falhas?`Concluido com ${falhas} arquivo(s) sem enviar. Importe de novo o mesmo pacote para tentar outra vez.`:`Pronto: ${docs.length} registros e ${arqs.length} arquivos importados.`;pull().catch(()=>{})}
        catch(e){console.error(e);x.style.color='var(--bad)';x.textContent='Nao foi possivel importar: '+((e&&e.message)||'erro')+'. Confira a internet e tente de novo.'}}})}

  /* ---------- o que o app pede ---------- */
  window.__PWA=true;
  window.claude=Object.freeze({use:async name=>{await ready;
    if(name==='db')return DB;
    if(name==='assets')return perfil&&perfil.papel!=='consulta'?ASSETS:null;
    if(name==='downloads')return DOWNLOADS;
    return null}});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

  /* ---------- app instalavel: funciona mesmo com internet ruim ---------- */
  if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  /* versao nova publicada: avisa e atualiza com um toque (ou sozinho, se nada estiver aberto) */
  if('serviceWorker' in navigator){let tinha=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!tinha){tinha=true;return}
    const aberto=document.querySelector('#scrim:not([hidden]),.rdr,.lg');if(!aberto){location.reload();return}
    if(document.getElementById('upd'))return;const b=document.createElement('button');b.id='upd';b.type='button';b.textContent='Nova versao do app · toque para atualizar';
    b.style.cssText='position:fixed;z-index:120;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));background:#0033a0;color:#fff;border:0;border-radius:999px;padding:10px 16px;font:600 13.5px "IBM Plex Sans",sans-serif;box-shadow:0 8px 24px rgba(11,36,112,.3)';
    b.onclick=()=>location.reload();document.body.appendChild(b)})}
})();
