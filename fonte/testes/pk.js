const {chromium}=require('playwright');const fs=require('fs');
const D='/home/claude/pwa/dist/';const mock=fs.readFileSync('sbmock.js','utf8')+";{const _c=supabase.createClient;supabase.createClient=(...a)=>{const c=_c(...a);c.auth.signInWithPasskey=async()=>{window.__PKIN=1;return c.auth.signInWithPassword({email:'m@x',password:'p'})};c.auth.registerPasskey=async()=>{window.__PKREG=1;return {data:{},error:null}};return c}}";
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
(async()=>{const b=await chromium.launch();
for(const caso of ['ok','semsessao']){const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));let body=null;
await p.addInitScript(()=>{window.PublicKeyCredential=function(){}});await p.addInitScript(([s,pp])=>{window.__SEED=s;window.__PAPEL=pp},[seed,'mecanico']);
await p.route('**/*',r=>{const u=new URL(r.request().url());
  if(u.pathname==='/functions/v1/mecanico'){body=r.request().postData();return caso==='ok'?r.fulfill({contentType:'application/json',body:JSON.stringify({email:'mec-x@mecanico.frota',senha:'ok'})}):r.fulfill({status:403,contentType:'application/json',body:'{"erro":"codigo"}'})}
  if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('supabase'))return r.fulfill({contentType:'text/javascript',body:mock});
  if(u.hostname==='frota.test'){let f=u.pathname.replace(/^\//,'')||'index.html';if(f.endsWith('/'))f+='index.html';const fp=D+f;if(fs.existsSync(fp))return r.fulfill({body:fs.readFileSync(fp),contentType:f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':'application/json'});return r.fulfill({status:404})}
  return r.abort()});
await p.goto(caso==='ok'?'http://frota.test/teste/?mec=11111111-2222-3333-4444-555555555555.abcdef':'http://frota.test/teste/');await p.waitForTimeout(3000);
await p.screenshot({path:'/tmp/claude-0/cx/pk-'+caso+'1.png'});
console.log('dbg',await p.evaluate(()=>[typeof window.PublicKeyCredential,typeof supabase.createClient('a','b').auth.signInWithPasskey,window.isSecureContext]));console.log(caso,'tela1:',await p.evaluate(()=>{const l=document.getElementById('lg');return l?l.innerText.replace(/\s+/g,' ').slice(0,120):'(app)'}));
const bt=await p.$(caso==='ok'?'#po-b':'#pk-b');if(bt){await bt.click();await p.waitForTimeout(2500)}
console.log(caso,'depois:',await p.evaluate(()=>{const l=document.getElementById('lg');return (l?l.innerText.replace(/\s+/g,' ').slice(0,80):'(app aberto) '+document.body.className)+' reg='+window.__PKREG+' in='+window.__PKIN+' pk='+localStorage.getItem('frota.pk')}));
console.log(caso,'| url:',p.url(),'| body:',body,'| tela:',await p.evaluate(()=>{const l=document.getElementById('lg');return l?l.innerText.replace(/\s+/g,' ').slice(0,120):'(app aberto) '+document.body.className}),'| link guardado:',await p.evaluate(()=>localStorage.getItem('frota.mecLink')),errs);
await p.screenshot({path:'mql-'+caso+'.png'});await ctx.close()}
await b.close()})();
