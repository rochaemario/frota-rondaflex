const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('console',m=>console.log(m.text()));await p.goto('file:///tmp/claude-0/sweep/sh.html');
for(const n of ['t1','t2','t3','t4','t5']){const b64=fs.readFileSync(n+'.png').toString('base64');
  const r=await p.evaluate(async b64=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const f=new File([u],'x.png',{type:'image/png'});
    const toB64=async bl=>{const ab=await bl.arrayBuffer();let s='';new Uint8Array(ab).forEach(c=>s+=String.fromCharCode(c));return btoa(s)};
    return [await toB64(await shrinkOld(f)),await toB64(await shrink(f,'proc')),await toB64(await shrink(f,'orig'))]},b64);
  r.forEach((x,i)=>fs.writeFileSync(`${n}_${['old','proc','orig'][i]}.img`,Buffer.from(x,'base64')))}
await b.close()})();
