const { chromium } = require("@playwright/test");
const fs = require("fs");
const outDir = process.env.OUTDIR || require("os").tmpdir();
console.log("OUTDIR:", outDir);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  async function snap(url, name) {
    try {
      await page.goto(url, { waitUntil: "commit", timeout: 30000 });
      await page.waitForTimeout(3500);
      const client = await ctx.newCDPSession(page);
      const { data } = await client.send("Page.captureScreenshot", { format: "png" });
      const p = require("path").join(outDir, name);
      fs.writeFileSync(p, Buffer.from(data, "base64"));
      console.log("OK:", p);
    } catch (e) {
      console.error("FAIL", url, e.message.slice(0, 80));
    }
  }

  await snap("http://localhost:4124/", "ss-home.png");

  // Mid-page scroll
  try {
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(1200);
    const c2 = await ctx.newCDPSession(page);
    const { data: d2 } = await c2.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(require("path").join(outDir, "ss-home-mid.png"), Buffer.from(d2, "base64"));
    console.log("OK: ss-home-mid.png");
  } catch (e) {
    console.error("FAIL home-mid", e.message.slice(0, 80));
  }

  await snap("http://localhost:4124/about", "ss-about.png");
  await snap("http://localhost:4124/services/solar-renewable", "ss-service.png");

  await browser.close();
  console.log("ALL DONE");
})().catch((e) => {
  console.error("FATAL", e.message.slice(0, 120));
  process.exit(1);
});
