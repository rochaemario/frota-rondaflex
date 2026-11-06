const {chromium}=require(require.resolve('playwright',{paths:[process.cwd(),'/tmp/claude-0/e2e','/usr/lib/node_modules','/usr/local/lib/node_modules']}));(async()=>{const b=await chromium.launch();
for(const t of ['light','dark']){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('file://'+process.argv[2]+'/dash.html');await p.evaluate(t=>document.documentElement.dataset.theme=t,t);await p.waitForTimeout(600);
await p.screenshot({path:process.argv[2]+'/dash-'+t+'.png',fullPage:true});}await b.close()})();
