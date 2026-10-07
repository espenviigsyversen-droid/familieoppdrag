const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const MAIN = "familieoppdrag.v1";
const BACKUP = "familieoppdrag.cloudBackups.v1";
const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
function fixture() {
  return {
    familyId: "test-family", cloudFamilyId: "test-family", familyName: "Test",
    familyCode: "TESTABCD", setupCompleted: true, cloudRevision: 1,
    children: [{ id: "test-child", name: "Testbarn", avatar: "*", color: "#00A8B5",
      active: true, pointsBalance: 0, lifetimePoints: 0 }],
    tasks: [{ id: "test-task", title: "Testoppgave", description: "", icon: "*", points: 5,
      category: "Morgen", frequency: "daily", days: ["all"], assignedChildren: ["test-child"],
      requiresApproval: false, repeatable: false, active: true, sortOrder: 1 }],
    rewards: [], completions: [], transactions: [], history: [], redemptions: [], badges: [],
    adultUsers: [], familyDevices: [], inviteCodes: []
  };
}
function quotaError() {
  return Object.assign(new Error("Quota exceeded"), { name: "QuotaExceededError" });
}
function storage(initial = {}, options = {}) {
  const values = new Map(Object.entries(initial));
  const operations = [];
  return {
    values, operations,
    getItem(key) {
      operations.push(["get", key]);
      if (options.readFailure) throw new Error("Storage disabled");
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      operations.push(["set", key]);
      if (options.failAll || (options.failWithBackup && values.has(BACKUP))) throw quotaError();
      if (options.failBackup && key === BACKUP) throw quotaError();
      values.set(key, String(value));
    },
    removeItem(key) {
      operations.push(["remove", key]);
      if (options.removeFailure) throw new Error("Storage disabled");
      values.delete(key);
    }
  };
}
function load(store = storage({ [MAIN]: JSON.stringify(fixture()) })) {
  const timers = [];
  function element() {
    return { innerHTML: "", textContent: "", classList: { add() {}, remove() {} },
      addEventListener() {}, querySelector() { return null; }, append() {}, remove() {},
      insertAdjacentHTML(position, html) {
        this.innerHTML = position === "afterbegin" ? html + this.innerHTML : this.innerHTML + html;
      }
    };
  }
  const app = element();
  const toast = element();
  const window = {
    localStorage: store, location: { search: "", pathname: "/index.html", href: "https://test.invalid/index.html" },
    history: { replaceState() {} },
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; },
    clearTimeout() {}, requestAnimationFrame(callback) { callback(); }, scrollTo() {}
  };
  const context = vm.createContext({
    window, sessionStorage: storage(), navigator: {}, crypto: webcrypto, URL, URLSearchParams,
    TextEncoder, Blob, structuredClone, confirm: () => true,
    console: { warn() {}, log() {} },
    document: { querySelector: (selector) => selector === "#app" ? app : toast,
      createElement: element, body: element(), documentElement: { scrollTop: 0 } }
  });
  // Run the real module, deferring only its automatic network bootstrap.
  assert.match(source, /startApp\(\);\s*$/);
  vm.runInContext(source.replace(/startApp\(\);\s*$/, `
    globalThis.api = {
      get state() { return state; }, set state(value) { state = normalizeLocalState(value, true); },
      view, cloud, localStorageStatus, startApp, completeTask, approveTask, undoTaskCompletion,
      saveState, flushCloudSave, persistLocalState, backupCloudState, readLocalCloudBackups,
      exportLocalCloudBackup, importStateFile, localStorageGet, localStorageSet, localStorageRemove,
      estimatedCloudDocumentSize, estimatedFirestoreValueBytes, cloudWriteErrorMessage,
      storageSettingsStatus, cloudSizeWarning, adultSettings, runCloudSyncTest,
      migrationReadinessChecks, calculateTaskStreak,
      offlineBootstrap() { startBackgroundServices = () => {}; },
      captureDownload() { downloadJson = (value) => { globalThis.downloaded = value; }; }
    };
  `), context, { filename: "app.js" });
  return { api: context.api, context, app, store, timers };
}
function firestore(harness, { transaction = true, error } = {}) {
  const { cloud, state } = harness.api;
  let remote = JSON.parse(JSON.stringify(state));
  const writes = [];
  const docRef = { path: "families/test-family/appState/current" };
  const snapshot = () => ({ exists: () => true, data: () => ({ state: remote }) });
  Object.assign(cloud, {
    enabled: true, ready: true, initialFetchComplete: true, familyId: "test-family",
    db: {}, docRef, doc: (_db, ...segments) => ({ path: segments.join("/") }),
    getDoc: async () => snapshot(),
    serverTimestamp: () => ({ seconds: 1 }),
    setDoc: async (ref, payload) => {
      if (error) throw error;
      writes.push({ ref, payload });
      if (ref.path === docRef.path) remote = payload.state;
    },
    runTransaction: transaction ? async (_db, callback) => {
      const staged = [];
      const result = await callback({ get: async () => snapshot(),
        set: (ref, payload) => staged.push({ ref, payload }) });
      if (error) throw error;
      staged.forEach((write) => {
        writes.push(write);
        if (write.ref.path === docRef.path) remote = write.payload.state;
      });
      return result;
    } : null
  });
  return { writes, get remote() { return remote; } };
}

test("quota failure: real startup, completion, rendering and cloud transaction continue", async () => {
  const h = load(storage({ [MAIN]: JSON.stringify(fixture()) }, { failAll: true }));
  h.api.offlineBootstrap();
  await h.api.startApp();
  assert.equal(h.api.view.booting, false);
  const db = firestore(h);
  h.api.view.mode = "child";
  h.api.view.childId = "test-child";
  h.api.completeTask("test-child", "test-task");
  assert.equal(h.api.state.completions.length, 1);
  assert.equal(h.api.state.children[0].pointsBalance, 5);
  assert.match(h.app.innerHTML, /Fullf/);
  assert.equal(h.api.cloud.pendingSave, true);
  assert.ok(h.timers.some((timer) => timer.delay === 350));
  await h.api.flushCloudSave();
  assert.equal(db.remote.completions.length, 1);
  assert.equal(db.remote.children[0].pointsBalance, 5);
  assert.equal(h.api.cloud.pendingSave, false);
  assert.equal(h.api.cloud.error, "");
  assert.ok(db.writes.some((write) => write.ref.path.includes("/backups/")));
  h.api.view.mode = "adult";
  h.api.view.adultUnlocked = true;
  assert.match(h.api.adultSettings(), /Nettleserens lagring er full/);
  assert.equal(h.api.localStorageStatus.writeFailed, true);
});

test("quota failure also permits the nontransaction cloud path and sync check", async () => {
  const h = load(storage({ [MAIN]: JSON.stringify(fixture()) }, { failAll: true }));
  const db = firestore(h, { transaction: false });
  h.api.runCloudSyncTest();
  assert.equal(h.api.cloud.pendingSave, true);
  await h.api.flushCloudSave();
  assert.ok(db.remote.syncDiagnostics.lastTestAt);
  assert.equal(h.api.cloud.error, "");
});

test("startup compacts five backups to the newest and preserves main/other apps", () => {
  const main = JSON.stringify(fixture());
  const backups = Array.from({ length: 5 }, (_, i) => ({
    createdAt: `2026-10-0${i + 1}T12:00:00Z`, state: fixture(), cloudRevision: i
  }));
  const h = load(storage({ [MAIN]: main, [BACKUP]: JSON.stringify(backups), otherApp: "keep" }));
  const kept = h.api.readLocalCloudBackups();
  assert.equal(kept.length, 1);
  assert.equal(kept[0].cloudRevision, 4);
  assert.equal(h.store.values.get(MAIN), main);
  assert.equal(h.store.values.get("otherApp"), "keep");
});

test("main state evicts only backup and retries exactly once before a new optional copy", () => {
  const h = load(storage({ [MAIN]: JSON.stringify(fixture()), [BACKUP]: "[]", otherApp: "keep" },
    { failWithBackup: true }));
  h.store.operations.length = 0;
  assert.equal(h.api.persistLocalState(), true);
  assert.deepEqual(h.store.operations, [["set", MAIN], ["remove", BACKUP], ["set", MAIN]]);
  assert.equal(h.api.localStorageStatus.writeFailed, false);
  assert.equal(h.store.values.get("otherApp"), "keep");
  h.store.operations.length = 0;
  h.api.backupCloudState("test", h.api.state);
  assert.deepEqual(h.store.operations, [["set", MAIN], ["set", BACKUP]]);
  assert.equal(h.api.readLocalCloudBackups().length, 1);
});

test("optional backup does not mark main-state persistence as failed", () => {
  const h = load(storage({ [MAIN]: JSON.stringify(fixture()) }, { failBackup: true }));
  h.api.backupCloudState("test", h.api.state);
  assert.equal(h.api.readLocalCloudBackups().length, 0);
  assert.equal(h.api.localStorageStatus.writeFailed, false);
  assert.doesNotMatch(h.api.storageSettingsStatus(), /lagring er full/);
});

test("inaccessible storage and invalid JSON are treated as missing without deletion", async () => {
  for (const raw of ["not json", "null", "{}", '{"children":false,"tasks":[]}']) {
    const h = load(storage({ [MAIN]: raw, [BACKUP]: "broken backup" }));
    h.api.offlineBootstrap();
    await h.api.startApp();
    assert.equal(h.api.state.setupCompleted, false);
    assert.equal(h.store.values.get(MAIN), raw);
    assert.equal(h.store.values.get(BACKUP), "broken backup");
    assert.ok(!h.store.operations.some(([operation]) => operation === "remove"));
  }
  const h = load(storage({ [MAIN]: "keep" }, { readFailure: true, failAll: true, removeFailure: true }));
  assert.equal(h.api.state.setupCompleted, false);
  assert.equal(h.api.localStorageGet(MAIN), null);
  assert.equal(h.api.localStorageRemove(MAIN), false);
  assert.equal(h.api.persistLocalState(), false);
  assert.equal(h.store.values.get(MAIN), "keep");
});

test("localStorage getter SecurityError never stops startup or saving", async () => {
  const h = load();
  Object.defineProperty(h.context.window, "localStorage", { get() { throw new Error("SecurityError"); } });
  assert.equal(h.api.localStorageGet(MAIN), null);
  assert.equal(h.api.localStorageRemove(MAIN), false);
  assert.equal(h.api.persistLocalState(), false);
  h.api.saveState();
  assert.equal(h.api.cloud.pendingSave, true);
  assert.match(h.api.storageSettingsStatus(), /lagring er utilgjengelig/);
});

test("a single local backup exports and restores through the existing confirmed importer", async () => {
  const saved = fixture();
  saved.children[0].pointsBalance = 42;
  const h = load(storage({ [MAIN]: JSON.stringify(fixture()),
    [BACKUP]: JSON.stringify([{ state: saved, reason: "test" }]) }));
  h.api.captureDownload();
  h.api.exportLocalCloudBackup();
  await h.api.importStateFile({ text: async () => JSON.stringify(h.context.downloaded) });
  assert.equal(h.api.state.children[0].pointsBalance, 42);
  assert.equal(JSON.parse(h.store.values.get(MAIN)).children[0].pointsBalance, 42);
});

test("size estimate includes UTF-8 strings, maps, arrays, envelope and path", () => {
  const h = load();
  assert.equal(h.api.estimatedFirestoreValueBytes("abc"), 4);
  assert.equal(h.api.estimatedFirestoreValueBytes("\u00f8"), 3);
  assert.equal(h.api.estimatedFirestoreValueBytes("\ud83c\udf1f"), 5);
  assert.equal(h.api.estimatedFirestoreValueBytes({ a: [1, true, null, "x"] }), 32 + 2 + 8 + 1 + 1 + 2);
  const baseline = h.api.estimatedCloudDocumentSize();
  h.api.state.history.push({ description: "x".repeat(740000) });
  const large = h.api.estimatedCloudDocumentSize();
  assert.ok(large.bytes > baseline.bytes + 740000);
  assert.ok(large.percent > 70);
  assert.match(h.api.cloudSizeWarning(), /lagringsgrensen/);
  assert.match(h.api.adultSettings(), /av 1 MiB/);
});

test("document limit errors get specific messages but quota/permission errors do not", async () => {
  const h = load();
  const examples = [
    "Document 'x' is larger than 1048576 bytes",
    "Document cannot be written because its size (1100000) exceeds the maximum allowed size of 1048576 bytes",
    "Document too large", "maximum allowed size exceeded for document x",
    "The value of property state exceeds 1048487 bytes (field value)"
  ];
  for (const message of examples) assert.match(h.api.cloudWriteErrorMessage({ message }), /1 MiB/);
  for (const message of ["Missing or insufficient permissions", "Quota exceeded", "Network offline"]) {
    assert.equal(h.api.cloudWriteErrorMessage({ message }), message);
  }
  firestore(h, { error: new Error(examples[0]) });
  h.api.saveState();
  await h.api.flushCloudSave();
  assert.match(h.api.cloud.error, /ikke lagret i skyen/);
  assert.equal(h.api.cloud.pendingSave, true);
});

test("existing task approval/undo and the application's readiness routine still work", () => {
  const h = load();
  firestore(h);
  h.api.state.tasks[0].requiresApproval = true;
  h.api.completeTask("test-child", "test-task");
  const id = h.api.state.completions[0].id;
  assert.equal(h.api.state.children[0].pointsBalance, 0);
  h.api.approveTask(id);
  assert.equal(h.api.state.children[0].pointsBalance, 5);
  assert.equal(h.api.calculateTaskStreak("test-child"), 1);
  h.api.undoTaskCompletion(id);
  assert.equal(h.api.state.children[0].pointsBalance, 0);
  assert.equal(h.api.state.children[0].lifetimePoints, 0);
  h.api.cloud.backupLastAt = new Date().toISOString();
  assert.ok(h.api.migrationReadinessChecks().every((check) => check.ok));
});

test("direct localStorage calls are confined to the three safe wrappers; release versions agree", () => {
  assert.equal((source.match(/(?:window\.)?localStorage\.(?:getItem|setItem|removeItem)\(/g) || []).length, 3);
  const version = source.match(/const APP_VERSION = "(\d+)"/)[1];
  const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  const worker = fs.readFileSync(path.join(__dirname, "../service-worker.js"), "utf8");
  assert.equal((html.match(new RegExp(`v=${version}`, "g")) || []).length, 3);
  assert.ok(worker.includes(`familieoppdrag-v${version}`));
});
