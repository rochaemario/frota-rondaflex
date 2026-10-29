/* Controle de Frota · funcionamento com internet ruim
   Páginas e bibliotecas ficam guardadas no aparelho; os dados sempre vêm do servidor. */
const VER='frota-703b4adf6b';
const SHELL=['./','index.html','shim.js','config.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  /* dados e login: sempre direto no servidor */
  if(/supabase\.co$/.test(u.hostname)&&!u.pathname.includes('/storage/v1/object/public/'))return;
  /* fotos e documentos: guardados depois da primeira vez (nunca mudam) */
  if(u.pathname.includes('/storage/v1/object/public/')){e.respondWith(caches.open('frota-arquivos').then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)c.put(r,res.clone());return res}));return}
  /* páginas do app: tenta a versão nova, usa a guardada sem internet */
  if(r.mode==='navigate'){e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp))}return res}).catch(async()=>(await caches.match(r))||caches.match('index.html')));return}
  /* bibliotecas e fontes: usa a guardada e atualiza em segundo plano */
  e.respondWith(caches.open(VER).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}));
});
