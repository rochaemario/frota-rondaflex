window.__mkdb=function(seed){
  const store={};Object.entries(seed).forEach(([p,d])=>store[p]=JSON.parse(JSON.stringify(d)));
  const subs=[];let n=0;
  const fire=()=>setTimeout(()=>subs.forEach(s=>s()),10);
  const colDocs=c=>Object.keys(store).filter(p=>p.startsWith(c+'/')&&p.split('/').length===c.split('/').length+1).sort().map(p=>({id:p.split('/').pop(),exists:true,data:()=>JSON.parse(JSON.stringify(store[p]))}));
  const doc=path=>({id:path.split('/').pop(),path,
    get:async()=>({exists:!!store[path],data:()=>store[path]}),
    set:async d=>{store[path]=JSON.parse(JSON.stringify(d));fire()},
    update:async d=>{if(!store[path])throw{code:'invalid_argument'};Object.assign(store[path],JSON.parse(JSON.stringify(d)));fire()},
    delete:async()=>{delete store[path];fire()},
    onSnapshot:(cb)=>{const f=()=>cb({id:path.split('/').pop(),exists:!!store[path],data:()=>store[path]&&JSON.parse(JSON.stringify(store[path]))});subs.push(f);setTimeout(f,5);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1)}}});
  const OPS={'==':(a,b)=>a===b,'!=':(a,b)=>a!==b,'<':(a,b)=>a<b,'<=':(a,b)=>a<=b,'>':(a,b)=>a>b,'>=':(a,b)=>a>=b,'in':(a,b)=>b.includes(a)};
  const q=(c,w,o,l)=>{const run=()=>{let d=colDocs(c).filter(x=>w.every(([f,op,v])=>OPS[op]((x.data()||{})[f],v)));if(o){const[f,dir]=o;d.sort((a,b)=>{const x=a.data()[f],y=b.data()[f];return (x<y?-1:x>y?1:0)*(dir==='desc'?-1:1)})}if(l)d=d.slice(0,l);return {docs:d,size:d.length,empty:!d.length}};
    return {where:(f,op,v)=>q(c,[...w,[f,op,v]],o,l),orderBy:(f,dir)=>q(c,w,[f,dir],l),limit:n=>q(c,w,o,n),get:async()=>run(),onSnapshot:(cb)=>{const f=()=>cb(run());subs.push(f);setTimeout(f,5);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1)}}}};
  const col=c=>({...q(c,[],null,0),path:c,doc:id=>doc(c+'/'+(id||('x'+(++n)+Math.random().toString(36).slice(2,6)))),add:async d=>{const r=doc(c+'/a'+(++n));await r.set(d);return r}});
  window.__store=store;
  return {doc,collection:col};
};
