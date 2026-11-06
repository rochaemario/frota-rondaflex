const {chromium}=require('playwright');const fs=require('fs');
const html=fs.readFileSync('/home/claude/frota.html','utf8');const fake=fs.readFileSync('/tmp/claude-0/e2e/fakedb.js','utf8');
const src=fs.readFileSync('sweep.js','utf8');eval(src.slice(src.indexOf('const L='),src.indexOf('const OUT')).replace(/^const seed/m,'global.seed'));
const CAM=`(sel,label)=>{const i=document.querySelector(sel);if(!i)return 'nao achei '+sel;
 const w=document.createElement('span');w.style.cssText='position:relative;display:block';i.parentNode.insertBefore(w,i);w.appendChild(i);i.style.paddingRight='52px';
 const b=document.createElement('span');b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
 b.style.cssText='position:absolute;right:5px;top:50%;transform:translateY(-50%);width:40px;height:36px;border-radius:9px;display:grid;place-items:center;background:var(--accent);color:#fff;box-shadow:0 0 0 3px rgba(0,51,160,.18)';w.appendChild(b);
 const r=i.getBoundingClientRect();const tag=document.createElement('div');tag.className='mk-tag';tag.textContent=label;tag.style.cssText='position:fixed;z-index:99;left:12px;top:'+Math.max(8,r.top-34)+'px;background:#e30613;color:#fff;font:600 12px IBM Plex Sans,sans-serif;padding:4px 9px;border-radius:999px';document.body.appendChild(tag);
 i.scrollIntoView({block:'center'});setTimeout(()=>{const r2=i.getBoundingClientRect();tag.style.top=Math.max(8,r2.top-34)+'px'},50);return 'ok'}`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setContent('<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style><script>'+fake+';window.__db=__mkdb('+JSON.stringify(seed)+');window.claude={use:async n=>n==="db"?window.__db:null}</script></head><body>'+html+'</body></html>');
await p.waitForTimeout(1200);const W=ms=>p.waitForTimeout(ms||350);
const home=async()=>{await p.evaluate(()=>{document.querySelectorAll('.mk-tag').forEach(x=>x.remove());const b=document.querySelector('#sheet [data-back]');});await p.evaluate(()=>{if(document.getElementById('scrim')&&!document.getElementById('scrim').hidden){}});await p.evaluate(()=>document.querySelector('header').click());await W(400);await p.evaluate(()=>document.querySelectorAll('.mk-tag').forEach(x=>x.remove()))};
const cam=async(sel,label,name)=>{const r=await p.evaluate(`(${CAM})(${JSON.stringify(sel)},${JSON.stringify(label)})`);await W(300);console.log(name,r);await p.screenshot({path:'mk-'+name+'.png'})};
const fab=async m=>{await p.evaluate(()=>document.getElementById('fab').click());await W();await p.click(`[data-m="${m}"]`);await W(400)};
// 1 estoque
await p.evaluate(()=>document.querySelector('[data-acc="estoque"]').click());await W();await cam('#esq','Busca do Estoque','1');await home();
await fab('mv-entrada');await cam('#mv-c','Entrada no estoque','2');await home();
await fab('mv-saida');await cam('#mv-c','Saída do estoque','3');await home();
// preventiva
await fab('novo').catch(()=>{});await home();
await p.evaluate(()=>document.querySelector('[data-acc="manut"]').click());await W();
await p.evaluate(()=>document.querySelector('[data-a="new-tr"]').click());await W(500);
await p.click('[data-rg="prev"]');await W(500);
await p.selectOption('#t-eq','CB-03');await W(600);
await cam('#sheet input.cd','Registrar preventiva · código usado','4');await home();
// lista
await p.evaluate(()=>document.getElementById('cartb').click());await W(400);
await p.evaluate(()=>{const b=document.querySelector('#sheet .ct-add');b&&b.click()});await W(300);
await cam('#sheet .ct-c','Lista de compra · adicionar item','5');await home();
// kit
await fab('novo');await p.click('[data-m="kit"]');await W(400);await cam('#k-add','Montar kit','6');await home();
await fab('novo');await p.click('[data-m="st"]');await W(400);await cam('#s-ref','Cadastro de item · referência','7');await home();
await fab('editar');await p.click('[data-m="ed-st"]');await W(400);await cam('#sheet input[type="search"],#sheet .search input','Editar / Excluir · busca','8');await home();
await p.evaluate(()=>document.querySelector('[data-acc="manut"]').click());await W();await cam('#pq','Busca de equipamento (QR na máquina)','9');
console.log('ERR',errs);await b.close()})();
