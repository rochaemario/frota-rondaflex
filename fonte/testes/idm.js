const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1700,height:900},deviceScaleFactor:2});
await p.goto('file://'+process.argv[2]+'/id.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2]+'/identificar-primeiro.png',fullPage:true});await b.close()})();
