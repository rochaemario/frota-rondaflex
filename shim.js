/* Controle de Frota · camada do app baixável
   O app foi escrito para o Claude (window.claude.use('db' | 'assets' | 'downloads')).
   Aqui as mesmas funções são entregues pelo Supabase, com login e papéis da equipe:
   admin = tudo e gerencia a equipe · editor = lança e edita · consulta = só vê. */
(function(){
  'use strict';
  const CFG=window.FROTA_CFG||{};
  const sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.__sb=sb;
  const BUCKET='arquivos';
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

  /* ---------- banco: coleções em memória sincronizadas em tempo real ---------- */
  const cols=new Map();      // parent -> {rows:Map(path->data), ready:Promise, subs:Set, notify}
  const docSubs=new Map();   // path -> Set(cb)
  const qSubs=new Map();     // parent -> Set(refetch)
  const snapDoc=(path,data)=>({id:idOf(path),exists:data!=null,data:()=>data==null?undefined:data,metadata:{fromCache:false,hasPendingWrites:false}});
  const snapCol=rows=>{const docs=[...rows.entries()].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([p,d])=>snapDoc(p,d));return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}}};
  async function fetchAll(parent){const rows=new Map();let from=0;const N=1000;
    for(;;){const {data,error}=await sb.from('docs').select('path,data').eq('parent',parent).order('path').range(from,from+N-1);if(error)throw err(error);
      data.forEach(r=>rows.set(r.path,r.data));if(data.length<N)break;from+=N}
    return rows}
  function colEntry(parent){let c=cols.get(parent);if(c)return c;
    c={rows:new Map(),subs:new Set(),loaded:false};c.notify=later(()=>{const s=snapCol(c.rows);c.subs.forEach(cb=>{try{cb(s)}catch(e){console.error(e)}})},25);
    c.ready=fetchAll(parent).then(r=>{c.rows=r;c.loaded=true}).catch(e=>{cols.delete(parent);throw e});
    cols.set(parent,c);return c}
  function apply(path,data){const parent=parentOf(path),c=cols.get(parent);
    if(c&&c.loaded){if(data==null)c.rows.delete(path);else c.rows.set(path,data);c.notify()}
    const ds=docSubs.get(path);if(ds)ds.forEach(cb=>{try{cb(snapDoc(path,data))}catch(e){console.error(e)}});
    const qs=qSubs.get(parent);if(qs)qs.forEach(f=>f())}
  async function refetchLoaded(){for(const [parent,c] of cols){if(!c.loaded)continue;try{c.rows=await fetchAll(parent);c.notify()}catch(e){console.error(e)}}
    for(const [path,set] of docSubs){if(!set.size)continue;const c=cols.get(parentOf(path));if(c&&c.loaded){const d=c.rows.get(path);set.forEach(cb=>cb(snapDoc(path,d??null)));continue}
      try{const {data}=await sb.from('docs').select('data').eq('path',path).maybeSingle();set.forEach(cb=>cb(snapDoc(path,data?data.data:null)))}catch(e){}}
    for(const [,set] of qSubs)set.forEach(f=>f())}
  let channel=null,wasSub=false;
  function realtime(){if(channel)return;channel=sb.channel('docs-all').on('postgres_changes',{event:'*',schema:'public',table:'docs'},p=>{
      const row=p.new&&p.new.path?p.new:null,old=p.old&&p.old.path?p.old:null;
      if(p.eventType==='DELETE'){if(old)apply(old.path,null)}else if(row)apply(row.path,row.data)})
    .subscribe(st=>{if(st==='SUBSCRIBED'){if(wasSub)refetchLoaded();wasSub=true;setSync(true)}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED')setSync(false)})}
  function setSync(on){const s=document.getElementById('sync');if(!s)return;if(!on){s.textContent=navigator.onLine?'Reconectando':'Sem internet';s.className='sync off'}else if(/Reconectando|Sem internet/.test(s.textContent)){s.textContent='Sincronizado';s.className='sync on'}}
  addEventListener('offline',()=>setSync(false));addEventListener('online',()=>{setSync(true);refetchLoaded()});
  let hiddenAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>60000)refetchLoaded()});

  const OPS={'==':'eq','!=':'neq','<':'lt','<=':'lte','>':'gt','>=':'gte'};
  function docRef(path){
    return {id:idOf(path),path,
      async get(){const c=cols.get(parentOf(path));if(c&&c.loaded)return snapDoc(path,c.rows.get(path)??null);
        const {data,error}=await sb.from('docs').select('data').eq('path',path).maybeSingle();if(error)throw err(error);return snapDoc(path,data?data.data:null)},
      async set(d){const data=clone(d);const {error}=await sb.from('docs').upsert({path,parent:parentOf(path),data,updated_at:new Date().toISOString()});if(error)throw err(error);apply(path,data)},
      async update(patch){const {data,error}=await sb.rpc('doc_update',{p_path:path,p_patch:clone(patch)});if(error)throw err(error,error.code==='P0002'?'not_found':undefined);apply(path,data)},
      async delete(){const {error}=await sb.from('docs').delete().eq('path',path);if(error)throw err(error);apply(path,null)},
      onSnapshot(cb,onErr){let set=docSubs.get(path);if(!set)docSubs.set(path,set=new Set());set.add(cb);realtime();
        this.get().then(s=>{if(set.has(cb))cb(s)}).catch(e=>onErr&&onErr(e));
        return()=>set.delete(cb)}};
  }
  function query(parent,w,o,l){
    async function run(){let q=sb.from('docs').select('path,data').eq('parent',parent);
      for(const [f,op,v] of w){const col=`data->>${f}`;if(op==='in')q=q.in(col,v.map(String));else if(op==='not-in')q=q.not(col,'in',`(${v.map(x=>JSON.stringify(String(x))).join(',')})`);else if(OPS[op])q=q[OPS[op]](col,v===null?null:String(v));else throw err('operador não suportado: '+op,'invalid_argument')}
      q=o?q.order(`data->${o[0]}`,{ascending:o[1]!=='desc',nullsFirst:false}):q.order('path');
      const rows=new Map();
      if(l){const {data,error}=await q.limit(l);if(error)throw err(error);data.forEach(r=>rows.set(r.path,r.data))}
      else{let from=0;for(;;){const {data,error}=await q.range(from,from+999);if(error)throw err(error);data.forEach(r=>rows.set(r.path,r.data));if(data.length<1000)break;from+=1000}}
      const docs=[...rows.entries()].map(([p,d])=>snapDoc(p,d));return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[]}}
    return {where:(f,op,v)=>query(parent,[...w,[f,op,v]],o,l),orderBy:(f,dir)=>query(parent,w,[f,dir||'asc'],l),limit:n=>query(parent,w,o,n),get:run,
      onSnapshot(cb,onErr){realtime();let alive=true;const go=()=>run().then(s=>{if(alive)cb(s)}).catch(e=>onErr&&onErr(e));const f=later(go,120);
        let set=qSubs.get(parent);if(!set)qSubs.set(parent,set=new Set());set.add(f);go();return()=>{alive=false;set.delete(f)}}};
  }
  function collection(parent){
    const q=query(parent,[],null,0);
    return {...q,path:parent,id:idOf(parent),
      doc:id=>docRef(parent+'/'+(id||rid())),
      async add(d){const r=docRef(parent+'/'+rid());await r.set(d);return r},
      async get(){const c=colEntry(parent);await c.ready;return snapCol(c.rows)},
      onSnapshot(cb,onErr){realtime();const c=colEntry(parent);c.subs.add(cb);c.ready.then(()=>{if(c.subs.has(cb))cb(snapCol(c.rows))}).catch(e=>{c.subs.delete(cb);onErr&&onErr(e)});return()=>c.subs.delete(cb)}};
  }
  const DB=Object.freeze({doc:docRef,collection});

  /* ---------- arquivos (fotos e PDFs) ---------- */
  const ASSETS=Object.freeze({
    async upload(blob,opts={}){const id=hex(32),type=opts.type||blob.type||'application/octet-stream';
      const {error}=await sb.storage.from(BUCKET).upload(id,blob,{contentType:type,cacheControl:'31536000',upsert:false});if(error)throw err(error);
      return {id,url:window.__blobUrl(id),sizeBytes:blob.size,contentType:type}},
    async delete(id){const {error}=await sb.storage.from(BUCKET).remove([id]);if(error)throw err(error)},
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
  .lg-c h1{font-family:var(--display);font-size:24px;text-transform:uppercase;letter-spacing:.02em;margin:0}
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
  .imp-p{height:8px;border-radius:4px;background:var(--sunk);overflow:hidden}.imp-p i{display:block;height:100%;width:0;background:var(--accent);transition:width .2s}`;
  function css(){if(document.getElementById('lg-css'))return;const s=document.createElement('style');s.id='lg-css';s.textContent=CSS;document.head.appendChild(s)}
  const BRAND='<div class="brand"><i></i>Controle de Frota</div>';
  function screen(html,mount){css();let o=document.getElementById('lg');if(!o){o=document.createElement('div');o.id='lg';o.className='lg';document.body.appendChild(o)}
    o.innerHTML=`<div class="lg-top">${BRAND}</div><div class="lg-c">${html}</div>`;mount&&mount(o);return o}
  const closeScreen=()=>{const o=document.getElementById('lg');if(o)o.remove()};
  function loginForm(msg){screen(`<h1>Entrar</h1><p>Use o e-mail e a senha que o administrador cadastrou para você.</p>
    <form class="lg-f" id="lg-f"><label class="f">E-mail<input id="lg-m" type="email" autocomplete="username" inputmode="email" required></label>
    <label class="f">Senha<input id="lg-p" type="password" autocomplete="current-password" required></label><div class="lg-e" id="lg-x">${esc(msg||'')}</div>
    <button class="btn pri" id="lg-b">Entrar</button></form><button type="button" class="lg-l" id="lg-r">Esqueci a senha</button>`,o=>{
      const f=o.querySelector('#lg-f'),x=o.querySelector('#lg-x'),b=o.querySelector('#lg-b');
      try{const m=localStorage.getItem('frota.email');if(m)o.querySelector('#lg-m').value=m}catch(e){}
      f.onsubmit=async ev=>{ev.preventDefault();x.textContent='';b.disabled=true;b.textContent='Entrando…';const email=o.querySelector('#lg-m').value.trim();
        const {error}=await sb.auth.signInWithPassword({email,password:o.querySelector('#lg-p').value});
        b.disabled=false;b.textContent='Entrar';
        if(error){x.textContent=/invalid/i.test(error.message)?'E-mail ou senha incorretos.':/fetch|network/i.test(error.message)?'Sem conexão com a internet.':'Não foi possível entrar. Tente de novo.';return}
        try{localStorage.setItem('frota.email',email)}catch(e){}};
      o.querySelector('#lg-r').onclick=async()=>{const email=o.querySelector('#lg-m').value.trim();if(!email){x.textContent='Digite seu e-mail acima e toque de novo em "Esqueci a senha".';return}
        const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
        x.style.color='var(--ok)';x.textContent=error?'':'Enviamos um link para criar uma nova senha. Confira seu e-mail.';if(error){x.style.color='';x.textContent='Não foi possível enviar. Confira o e-mail.'}}})}
  function newPassword(){screen(`<h1>Nova senha</h1><p>Crie sua nova senha de acesso.</p><form class="lg-f" id="np-f"><label class="f">Nova senha<input id="np-p" type="password" minlength="6" autocomplete="new-password" required></label><div class="lg-e" id="np-x"></div><button class="btn pri">Salvar senha</button></form>`,o=>{
    o.querySelector('#np-f').onsubmit=async ev=>{ev.preventDefault();const {error}=await sb.auth.updateUser({password:o.querySelector('#np-p').value});if(error){o.querySelector('#np-x').textContent='Use pelo menos 6 caracteres.';return}history.replaceState(null,'',location.pathname);start()}})}
  function waiting(){screen(`<h1>Aguardando liberação</h1><p>Seu acesso foi criado, mas o administrador ainda precisa liberar. Peça para ele abrir <b>Equipe</b> no app.</p><button type="button" class="btn" id="lg-o">Sair</button>`,o=>{o.querySelector('#lg-o').onclick=()=>sb.auth.signOut()})}

  let started=false;
  async function start(){
    const {data:{session}}=await sb.auth.getSession();
    if(!session){loginForm();return}
    const {data,error}=await sb.from('perfis').select('user_id,email,nome,papel').eq('user_id',session.user.id).maybeSingle();
    if(error){loginForm('Sem conexão com o servidor. Tente de novo.');return}
    if(!data){waiting();return}
    perfil=data;document.body.classList.remove('papel-admin','papel-editor','papel-consulta');document.body.classList.add('papel-'+perfil.papel);
    closeScreen();if(!started){started=true;resolveReady()}
  }
  sb.auth.onAuthStateChange((ev)=>{if(ev==='PASSWORD_RECOVERY'){newPassword();return}if(ev==='SIGNED_IN'&&!started)start();if(ev==='SIGNED_OUT'){try{sessionStorage.clear()}catch(e){}location.reload()}});

  /* ---------- conta e equipe (toque em "Sincronizado") ---------- */
  const PAPEL={admin:'Administrador',editor:'Editor',consulta:'Consulta'};
  document.addEventListener('click',ev=>{const s=ev.target.closest&&ev.target.closest('#sync');const open=document.getElementById('acct');
    if(open&&!ev.target.closest('#acct')){open.remove();if(!s)return}
    if(!s||!perfil)return;ev.stopPropagation();ev.preventDefault();if(open)return;css();
    const d=document.createElement('div');d.id='acct';d.className='acct';
    d.innerHTML=`<div><b>${esc(perfil.nome||perfil.email)}</b><br><span>${esc(perfil.email)} · ${PAPEL[perfil.papel]}</span></div>${perfil.papel==='admin'?'<button type="button" class="btn" id="ac-eq">Equipe</button><button type="button" class="btn" id="ac-imp">Importar dados</button>':''}<button type="button" class="btn" id="ac-out">Sair</button>`;
    document.body.appendChild(d);d.querySelector('#ac-out').onclick=()=>sb.auth.signOut();const eq=d.querySelector('#ac-eq');if(eq)eq.onclick=()=>{d.remove();equipe()};const im=d.querySelector('#ac-imp');if(im)im.onclick=()=>{d.remove();importar()}},true);
  async function equipe(){
    const {data,error}=await sb.from('perfis').select('user_id,email,nome,papel').order('nome');
    screen(`<h1>Equipe</h1><p>Novas pessoas: crie o acesso no Supabase (Authentication › Add user). Elas aparecem aqui como Consulta; escolha o papel.</p>
      <div class="lg-f"><div class="eqp">${error?'<div class="lg-e">Não foi possível carregar.</div>':data.map(p=>`<div class="eqp-r"><div><b>${esc(p.nome||p.email)}</b><small>${esc(p.email||'')}</small></div><select data-u="${esc(p.user_id)}"${p.user_id===perfil.user_id?' disabled':''}>${Object.entries(PAPEL).map(([k,v])=>`<option value="${k}"${p.papel===k?' selected':''}>${v}</option>`).join('')}</select></div>`).join('')}</div></div>
      <button type="button" class="btn pri" id="eq-ok">Concluir</button>`,o=>{
        o.querySelectorAll('[data-u]').forEach(s=>s.onchange=async()=>{s.disabled=true;const {error}=await sb.from('perfis').update({papel:s.value}).eq('user_id',s.dataset.u);s.disabled=false;if(error){s.style.borderColor='var(--bad)'}else s.style.borderColor=''});
        o.querySelector('#eq-ok').onclick=closeScreen})}

  /* ---------- importar o pacote de mudança (dados + fotos e documentos do app antigo) ---------- */
  function importar(){screen(`<h1>Importar dados</h1><p>Escolha o pacote de mudança (.json) que o Claude preparou. Dados com o mesmo caminho são substituídos; nada é apagado.</p>
    <div class="lg-f"><label class="btn pri" style="position:relative;overflow:hidden">Escolher pacote<input id="imp-f" type="file" accept=".json,application/json" style="position:absolute;inset:0;opacity:0"></label>
    <div class="imp-p" hidden id="imp-pb"><i></i></div><div class="lg-e" id="imp-x" style="color:var(--muted)"></div></div><button type="button" class="btn" id="imp-ok">Fechar</button>`,o=>{
      o.querySelector('#imp-ok').onclick=closeScreen;const x=o.querySelector('#imp-x'),pb=o.querySelector('#imp-pb'),bar=pb.querySelector('i');
      o.querySelector('#imp-f').onchange=async ev=>{const f=ev.target.files[0];if(!f)return;x.style.color='var(--muted)';x.textContent='Lendo o pacote…';pb.hidden=false;bar.style.width='0';
        try{const dados=JSON.parse(await f.text());if(!dados||!dados.docs)throw new Error('arquivo não é um pacote do app');
          const docs=Object.entries(dados.docs),arqs=Object.entries(dados.arquivos||{});
          const tot=docs.length+arqs.length||1;let feito=0;const tick=()=>{bar.style.width=Math.round(++feito/tot*100)+'%'};
          for(let i=0;i<docs.length;i+=200){const lote=docs.slice(i,i+200).map(([path,data])=>({path,parent:parentOf(path),data}));
            x.textContent=`Gravando dados (${Math.min(i+200,docs.length)} de ${docs.length})…`;const {error}=await sb.from('docs').upsert(lote);if(error)throw error;lote.forEach(tick)}
          let falhas=0,k=0;for(const [id,b64] of arqs){const tipo=(dados.tipos||{})[id]||'application/octet-stream';x.textContent=`Enviando fotos e documentos (${++k} de ${arqs.length})…`;
            const bin=atob(b64),u8=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)u8[j]=bin.charCodeAt(j);
            const {error}=await sb.storage.from(BUCKET).upload(id,new Blob([u8],{type:tipo}),{contentType:tipo,cacheControl:'31536000',upsert:true});if(error)falhas++;tick()}
          x.style.color=falhas?'var(--bad)':'var(--ok)';x.textContent=falhas?`Concluído com ${falhas} arquivo(s) sem enviar. Importe de novo o mesmo pacote para tentar outra vez.`:`Pronto: ${docs.length} registros e ${arqs.length} arquivos importados.`;refetchLoaded()}
        catch(e){console.error(e);x.style.color='var(--bad)';x.textContent='Não foi possível importar: '+((e&&e.message)||'erro')+'. Confira a internet e tente de novo.'}}})}

  /* ---------- o que o app pede ---------- */
  window.__PWA=true;
  window.claude=Object.freeze({use:async name=>{await ready;
    if(name==='db')return DB;
    if(name==='assets')return perfil&&perfil.papel!=='consulta'?ASSETS:null;
    if(name==='downloads')return DOWNLOADS;
    return null}});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

  /* ---------- app instalável: funciona mesmo com internet ruim ---------- */
  if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
