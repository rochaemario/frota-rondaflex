/* Controle de Frota · funcionamento com internet ruim
   Páginas e bibliotecas ficam guardadas no aparelho; os dados sempre vêm do servidor. */
const VER='frota-1ac96ca76f';
const SHELL=['./','index.html','shim.js','config.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  /* dados e login: sempre direto no servidor */
  if(/supabase\.co$/.test(u.hostname)&&!u.pathname.includes('/storage/v1/object/public/'))return;
  /* fotos e documentos: guardados depois da primeira vez (nunca mudam) */
  if(u.pathname.includes('/storage/v1/object/public/')){e.respondWith(caches.open('frota-arquivos').then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}));return}
  /* paginas do app: tenta a versao nova por ate 1,5 s; com rede lenta abre na hora a guardada e atualiza em segundo plano (vale na proxima abertura) */
  if(r.mode==='navigate'){const net=fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{if(res.ok){const a=res.clone(),b=res.clone();const ix=/\/(index\.html)?$/.test(u.pathname);caches.open(VER).then(c=>Promise.all([c.put(r,a),ix?c.put('index.html',b):0])).catch(()=>{})}return res});
    e.waitUntil(net.catch(()=>{}));
    e.respondWith((async()=>{const hit=(await caches.match(r))||(/\/(index\.html)?$/.test(u.pathname)?await caches.match('index.html'):null);if(!hit)return net;
      const cn=self.navigator&&self.navigator.connection,lenta=cn&&(cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'')||(cn.rtt&&cn.rtt>=700));
      const res=await Promise.race([net.catch(()=>null),new Promise(ok=>setTimeout(()=>ok(null),lenta?0:1500))]);return res||hit})());return}
  /* bibliotecas e fontes: usa a guardada e atualiza em segundo plano */
  e.respondWith(caches.open(VER).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}));
});
