const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:400},deviceScaleFactor:3});
await p.goto('file://'+process.argv[2]+'/aj4.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2]+'/selo-ajuste-4.png',fullPage:true});await b.close()})();
