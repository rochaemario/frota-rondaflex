const http=require('http'),fs=require('fs'),path=require('path');const D='/home/claude/pwa/dist';let delay=0;
http.createServer((q,r)=>{const u=new URL(q.url,'http://x');if(u.pathname==='/__delay'){delay=+u.searchParams.get('ms');r.end('ok');return}
  let f=u.pathname==='/'?'/index.html':u.pathname;const fp=path.join(D,f);if(!fs.existsSync(fp)){r.statusCode=404;r.end();return}
  const send=()=>{r.setHeader('content-type',f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.js')?'text/javascript':'application/octet-stream');r.end(fs.readFileSync(fp))};
  (f.endsWith('.html'))?setTimeout(send,delay):send()}).listen(8765);
