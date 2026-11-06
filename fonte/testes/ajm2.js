const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:400},deviceScaleFactor:2});
await p.goto('file://'+process.argv[2]+'/aj2.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2]+'/selo-ajuste-2.png',fullPage:true});await b.close()})();
