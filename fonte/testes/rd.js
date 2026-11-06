const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1210,height:844},deviceScaleFactor:2});
await p.goto('file://'+process.argv[2]+'/rd.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2]+'/leitor-estados.png'});await b.close()})();
