const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const root = path.join(__dirname, "..");
  const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "msedge", headless: true });
  try {
    for (const [label, width, height] of [["mobile", 390, 844], ["desktop", 1280, 900]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      // Everything is served from memory; no Firebase, CDN or production requests.
      await page.route("**/*", (route) => route.fulfill({ contentType: "text/html", body:
        `<!doctype html><html lang="no"><meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${css}</style><div id="app" class="app-shell"></div><div id="toast"></div></html>` }));
      await page.goto("https://storage-test.invalid/index.html");
      await page.evaluate(() => {
        const saved = {
          familyId: "test-family", cloudFamilyId: "test-family", familyName: "Testfamilien",
          setupCompleted: true, children: [], tasks: [], rewards: [],
          history: [{ description: "x".repeat(740000) }]
        };
        Object.defineProperty(window, "localStorage", { value: {
          getItem: (key) => key === "familieoppdrag.v1" ? JSON.stringify(saved) : null,
          setItem: () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); },
          removeItem: () => {}
        } });
      });
      await page.addScriptTag({ content: source.replace(/startApp\(\);\s*$/, `
        startBackgroundServices = () => {};
        startApp();
        cloud.ready = true;
        cloud.initialFetchComplete = true;
        view.mode = "adult";
        view.adultUnlocked = true;
        view.adultTab = "settings";
        persistLocalState();
        render();
      `) });
      await page.getByText("Nettleserens lagring er full.", { exact: false }).waitFor();
      assert.equal(errors.length, 0, errors.join("\n"));
      assert.ok(await page.getByText("Familiedata nærmer seg lagringsgrensen i skyen.", { exact: false }).isVisible());
      const bounds = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        notices: [...document.querySelectorAll(".storage-status p, .storage-size-warning")].map((node) => ({
          width: node.clientWidth, scrollWidth: node.scrollWidth,
          left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right
        }))
      }));
      assert.ok(bounds.content <= bounds.viewport, JSON.stringify(bounds));
      for (const notice of bounds.notices) {
        assert.ok(notice.scrollWidth <= notice.width && notice.left >= 0 && notice.right <= width);
      }
      const folder = path.join(__dirname, "artifacts");
      fs.mkdirSync(folder, { recursive: true });
      await page.screenshot({ path: path.join(folder, `storage-${label}.png`), fullPage: true });
      console.log(`${label}: storage messages visible, no horizontal overflow or JavaScript errors`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
