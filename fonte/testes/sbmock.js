/* mock mínimo do supabase-js para testes */
window.supabase={createClient(url,key){
  const T={docs:new Map(),perfis:new Map()};const seed=window.__SEED||{};
  Object.entries(seed).forEach(([p,d])=>T.docs.set(p,{path:p,parent:p.slice(0,p.lastIndexOf('/')),data:JSON.parse(JSON.stringify(d))}));
  const uid='u1';T.perfis.set(uid,{user_id:uid,email:'mario@x.com',nome:'Mario',papel:window.__PAPEL||'admin'});T.perfis.set('u2',{user_id:'u2',email:'carlos@x.com',nome:'Carlos Souza',papel:'editor'});T.perfis.set('u3',{user_id:'u3',email:'ana@x.com',nome:'Ana Lima',papel:'editor'});(window.__AVISOS||[]).forEach(a=>T.docs.set('avisos/'+a.id,{path:'avisos/'+a.id,parent:'avisos',data:a}));
  let session=window.__LOGGED?{user:{id:uid,email:'mario@x.com'}}:null;const authCbs=[];const chans=[];window.__calls=[];
  const emit=(ev,row,old)=>chans.forEach(c=>c({eventType:ev,new:row||{},old:old||{}}));
  const get=(o,k)=>{if(k.startsWith('data->>')){const v=o.data[k.slice(7)];return v==null?null:String(v)}if(k.startsWith('data->'))return o.data[k.slice(6)];return o[k]};
  function qb(table){let rows=null,filters=[],ord=null,lim=null,rng=null,single=false,op='select',payload=null;
    const b={select(){return b},eq(k,v){filters.push(o=>get(o,k)==v);return b},neq(k,v){filters.push(o=>get(o,k)!=v);return b},
      lt(k,v){filters.push(o=>get(o,k)<v);return b},lte(k,v){filters.push(o=>get(o,k)<=v);return b},gt(k,v){filters.push(o=>get(o,k)>v);return b},gte(k,v){filters.push(o=>get(o,k)>=v);return b},
      in(k,v){filters.push(o=>v.includes(get(o,k)));return b},like(k,pat){const re=new RegExp('^'+String(pat).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*')+'$');filters.push(o=>re.test(String(get(o,k))));return b},not(k,op,pat){if(op==='like'){const re=new RegExp('^'+String(pat).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*')+'$');filters.push(o=>!re.test(String(get(o,k))))}return b},order(k,o){ord=[k,o?o.ascending!==false:true];return b},limit(n){lim=n;return b},range(a,z){rng=[a,z];return b},maybeSingle(){single=true;return b},
      upsert(r){op='upsert';payload=r;return b},update(r){op='update';payload=r;return b},delete(){op='delete';return b},
      then(res,rej){return run().then(res,rej)}};
    async function run(){await new Promise(r=>setTimeout(r,window.__SLOW||5));window.__calls.push([table,op]);const M=T[table];
      if(window.__FAIL)return {data:null,error:{message:'Failed to fetch',code:'x'}};
      if(op==='upsert'){(Array.isArray(payload)?payload:[payload]).forEach(pl=>{const old=M.get(pl.path);M.set(pl.path,JSON.parse(JSON.stringify(pl)));emit(old?'UPDATE':'INSERT',M.get(pl.path))});return {data:null,error:null}}
      let list=[...M.values()].filter(o=>filters.every(f=>f(o)));
      if(op==='delete'){list.forEach(o=>{M.delete(o.path);emit('DELETE',null,{path:o.path})});return {data:null,error:null}}
      if(op==='update'){list.forEach(o=>Object.assign(o,payload));return {data:null,error:null}}
      if(ord){const [k,asc]=ord;list.sort((a,b)=>{const x=get(a,k),y=get(b,k);return (x<y?-1:x>y?1:0)*(asc?1:-1)})}
      if(rng)list=list.slice(rng[0],rng[1]+1);if(lim)list=list.slice(0,lim);
      list=JSON.parse(JSON.stringify(list));
      return {data:single?(list[0]||null):list,error:null}}
    return b}
  return {from:qb,
    rpc:async(fn,a)=>{await new Promise(r=>setTimeout(r,5));window.__calls.push(["rpc",fn]);if(window.__FAIL)return {data:null,error:{message:"Failed to fetch",code:""}};const o=T.docs.get(a.p_path);if(!o)return {data:null,error:{code:'P0002',message:'not_found'}};Object.assign(o.data,JSON.parse(JSON.stringify(a.p_patch)));emit('UPDATE',JSON.parse(JSON.stringify(o)));return {data:JSON.parse(JSON.stringify(o.data)),error:null}},
    channel(){const c={on(_,__,cb){chans.push(cb);return c},subscribe(cb){setTimeout(()=>cb('SUBSCRIBED'),10);return c}};return c},
    auth:{getSession:async()=>{await new Promise(r=>setTimeout(r,window.__SLOW||0));return {data:{session}}},signInWithPassword:async({email,password})=>{if(password!=='ok')return {error:{message:'Invalid login credentials'}};session={user:{id:uid,email}};authCbs.forEach(f=>f('SIGNED_IN',session));return {data:{session},error:null}},
      onAuthStateChange(f){authCbs.push(f);return {data:{subscription:{unsubscribe(){}}}}},signOut:async()=>{session=null;authCbs.forEach(f=>f('SIGNED_OUT'))},resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({error:null})},
    storage:{from:(bk)=>({createSignedUrl:async(id)=>bk==='documentos'&&window.__privOk?{data:{signedUrl:'data:image/png;base64,iVBORw0KGgo='},error:null}:{data:null,error:{message:'not found'}},upload:async(id,blob)=>{(window.__upk=window.__upk||{})[id]=bk;window.__up=(window.__up||[]).concat(id);(window.__upb=window.__upb||{})[id]=blob;return {error:null}},remove:async()=>({error:null})})},
    __T:T};
}};
