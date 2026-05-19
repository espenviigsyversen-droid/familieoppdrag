const STORAGE_KEY = "familieoppdrag.v1";
const DEVICE_PROFILE_KEY = "familieoppdrag.deviceProfile";
const PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
const APP_VERSION = "59";
const SCHEMA_VERSION = 2;
const ADULT_INVITE_LIFETIME_DAYS = 7;
const APP_CONFIG = {
  appName: "Familieoppdrag",
  environment: "production",
  environmentLabel: "Produksjon",
  cloudSync: {
    enabled: true,
    provider: "firebase",
    stateCollection: "families",
    codeCollection: "familyCodes",
    stateSubcollection: "appState",
    stateDocument: "current",
    pinnedFamilyId: "familieoppdrag",
    legacyFamilyIds: ["familieoppdrag", "local-family"],
    firebase: {
      apiKey: "AIzaSyAMPfQ9gX9rbuvcPsVjYVtq5IT_orjDBPs",
      authDomain: "home-tasks-app-18de3.firebaseapp.com",
      projectId: "home-tasks-app-18de3",
      storageBucket: "home-tasks-app-18de3.firebasestorage.app",
      messagingSenderId: "253720858709",
      appId: "1:253720858709:web:62bd1844be04ee76c384dc"
    }
  }
};

const cloud = {
  enabled: APP_CONFIG.cloudSync.enabled,
  ready: false,
  status: "Kobler til Firestore ...",
  error: "",
  familyId: null,
  db: null,
  auth: null,
  authUser: null,
  doc: null,
  docRef: null,
  getDoc: null,
  setDoc: null,
  onSnapshot: null,
  serverTimestamp: null,
  GoogleAuthProvider: null,
  signInWithPopup: null,
  signInWithRedirect: null,
  unsubscribe: null,
  saveTimer: null,
  pendingSave: false,
  lastSavedAt: null,
  lastFetchedAt: null,
  familyCodeLookupStatus: "",
  familyCodeLookupError: "",
  applyingRemote: false
};

const DEFAULT_LEVELS = [
  { min: 0, name: "Ny hjelper" },
  { min: 100, name: "Hushelt" },
  { min: 250, name: "Superhjelper" },
  { min: 500, name: "Ansvarsmester" },
  { min: 1000, name: "Familielegende" },
  { min: 1500, name: "Oppdragsmester" },
  { min: 2500, name: "Stjernehelt" }
];

const TASK_ICONS = ["⭐", "🪥", "🦷", "🪮", "💇", "🧼", "🫧", "🧴", "🧻", "💊", "🥄", "🍋", "🧃", "🎒", "📚", "🥪", "🍱", "👕", "👚", "👟", "🧥", "🧦", "🧺", "🧸", "🧹", "🥐", "🍽️", "🥣", "🍲", "🍴", "🗑️", "🌱", "🔌", "🔋", "📱", "⌚", "⏰", "🤝", "🫶", "👫", "💪", "✨", "💛", "🏅"];
const REWARD_ICONS = ["🎁", "🎮", "🕹️", "📱", "🎬", "🍝", "💰", "🏅", "🍦", "🧩", "🎨", "⚽", "🚲", "📚", "⭐"];
const AVATAR_ICONS = ["🌟", "🚀", "🌈", "⚽", "🎮", "🎨", "🎤", "🎧", "🎬", "📚", "🧩", "🛹", "🚲", "🏀", "🏆", "🥇", "💎", "🔥", "⚡", "✨", "💫", "🌙", "☀️", "🌸", "🌻", "🍀", "🍓", "🍉", "🍕", "🧁", "🍦", "🎁", "🎲", "🦄", "🐶", "🐱", "🐼", "🦊", "🐯", "🦁", "🐵", "🐧", "🐢", "🐬", "🦋", "🐝"];
const CHILD_COLORS = ["#8B5CF6", "#00A8B5", "#F472B6", "#06D6A0", "#FFD166", "#EF476F", "#118AB2", "#F97316"];
const BADGE_DEFINITIONS = [
  { id: "first-task", icon: "⭐", name: "Første oppdrag", description: "Fullfør ditt første oppdrag.", isEarned: (childId) => completedTaskCount(childId) >= 1 },
  { id: "task-10", icon: "🏅", name: "Ti oppdrag", description: "Fullfør 10 oppdrag.", isEarned: (childId) => completedTaskCount(childId) >= 10 },
  { id: "task-50", icon: "🏆", name: "Oppdragshelt", description: "Fullfør 50 oppdrag.", isEarned: (childId) => completedTaskCount(childId) >= 50 },
  { id: "morning-master", icon: "🌅", name: "Morgenmester", description: "Fullfør alle morgenoppdragene i dag.", isEarned: (childId) => categoryCompleteToday(childId, "Morgen") },
  { id: "evening-hero", icon: "🌙", name: "Kveldshelt", description: "Fullfør alle kveldsoppdragene i dag.", isEarned: (childId) => categoryCompleteToday(childId, "Kveld") },
  { id: "bonus-star", icon: "✨", name: "Ekstrastjerne", description: "Fullfør et ekstraoppdrag.", isEarned: (childId) => completedBonusCount(childId) >= 1 },
  { id: "reward-picker", icon: "🎁", name: "Belønningsvelger", description: "Få en belønning godkjent.", isEarned: (childId) => state.redemptions.some((item) => item.childId === childId && ["approved", "fulfilled"].includes(item.status)) }
];

const childrenSeed = [
  { id: "sofia", name: "Sofia", avatar: "🌟", color: "#8B5CF6", pointsBalance: 0, lifetimePoints: 0, streak: 0, active: true },
  { id: "finn", name: "Finn", avatar: "🚀", color: "#00A8B5", pointsBalance: 0, lifetimePoints: 0, streak: 0, active: true },
  { id: "ellie", name: "Ellie", avatar: "🌈", color: "#F472B6", pointsBalance: 0, lifetimePoints: 0, streak: 0, active: true }
];

const allChildren = childrenSeed.map((child) => child.id);

const taskSeeds = [
  ["Pusse tenner morgen", "Gjør tennene klare for dagen.", "🪥", 5, "Morgen", "daily", ["weekdays"], false],
  ["Kle på seg", "Finn klær og kle på deg.", "👕", 5, "Morgen", "daily", ["weekdays"], false],
  ["Pakke sekken", "Husk bøker, matboks og drikkeflaske.", "🎒", 10, "Morgen", "daily", ["weekdays"], false],
  ["Ta med matboks", "Sett matboks og flaske i sekken.", "🥪", 5, "Morgen", "daily", ["weekdays"], false],
  ["Sette sko på plass", "Skoene står fint når du er ferdig.", "👟", 5, "Etter skole", "daily", ["weekdays"], false],
  ["Henge jakke i skapet", "Jakke eller yttertøy på riktig plass.", "🧥", 5, "Etter skole", "daily", ["weekdays"], false],
  ["Pakke ut matboks", "Legg matboksen på kjøkkenet.", "🍱", 10, "Etter skole", "daily", ["weekdays"], false],
  ["Pakke ut av sekken", "Ta ut beskjeder, bøker og gymtøy.", "📚", 10, "Etter skole", "daily", ["weekdays"], false],
  ["Pusse tenner kveld", "Puss før leggetid.", "🦷", 5, "Kveld", "daily", ["all"], false],
  ["Legge klær til vask", "Skitne klær skal i skittentøyet.", "🧺", 5, "Kveld", "daily", ["all"], false],
  ["Finne frem klær", "Legg frem klær til neste dag.", "👚", 10, "Kveld", "daily", ["weekdays"], false],
  ["Rydde rommet", "Rydd gulv og flater så rommet er hyggelig.", "🧸", 20, "Helg", "weekly", ["weekend"], true],
  ["Støvsuge eget rom", "Støvsug gulvet på rommet ditt.", "🧹", 25, "Helg", "weekly", ["weekend"], true],
  ["Hjelpe til med frokost", "Bidra med bord, mat eller rydding.", "🥐", 10, "Helg", "daily", ["weekend"], true],
  ["Dekke bordet", "Gjør bordet klart til mat.", "🍽️", 10, "Helg", "daily", ["weekend"], false],
  ["Rydde av bordet", "Hjelp til når måltidet er ferdig.", "🥣", 10, "Helg", "daily", ["weekend"], false],
  ["Hjelpe til hjemme", "Ta et ekstra tak der det trengs.", "💪", 15, "Helg", "daily", ["weekend"], true],
  ["Hjelpe søsken", "Vær en god hjelper for en av de andre.", "🤝", 15, "Bonus", "once", ["all"], true],
  ["Ekstra rydding", "Rydd noe som ikke står på lista.", "✨", 15, "Bonus", "once", ["all"], true],
  ["Hjelpe til med middag", "Bidra på kjøkkenet.", "🍲", 15, "Bonus", "once", ["all"], true],
  ["Tømme oppvaskmaskinen", "Sett rent servise på plass.", "🍴", 20, "Bonus", "once", ["all"], true],
  ["Være ekstra hjelpsom", "Gjør noe snilt og nyttig.", "💛", 10, "Bonus", "once", ["all"], true]
].map((task, index) => ({
  id: `task-${index + 1}`,
  title: task[0],
  description: task[1],
  icon: task[2],
  points: task[3],
  category: task[4],
  frequency: task[5],
  days: task[6],
  assignedChildren: allChildren,
  requiresApproval: task[7],
  repeatable: task[5] === "once",
  active: true,
  sortOrder: index + 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

const rewardSeeds = [
  ["15 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "🎮", 20, "Skjermtid"],
  ["30 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "🎮", 35, "Skjermtid"],
  ["45 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "🕹️", 50, "Skjermtid"],
  ["60 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "📱", 65, "Skjermtid"],
  ["Velge film", "Du får velge film til en familiekveld.", "🎬", 60, "Aktivitet"],
  ["Velge middag", "Du får velge en middag familien lager.", "🍝", 75, "Aktivitet"],
  ["Ekstra ukepenger 10 kr", "Legges til manuelt av voksen.", "💰", 100, "Ukepenger"],
  ["Liten overraskelse", "En liten avtalt overraskelse.", "🎁", 150, "Annet"],
  ["Aktivitet med voksen", "Tid til en avtalt aktivitet sammen.", "🏅", 200, "Aktivitet"]
].map((reward, index) => ({
  id: `reward-${index + 1}`,
  title: reward[0],
  description: reward[1],
  icon: reward[2],
  cost: reward[3],
  type: reward[4],
  assignedChildren: allChildren,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

const STARTER_PACKAGES = [
  {
    id: "routine",
    title: "Morgen og kveld",
    description: "Vanlige hverdagsoppgaver som gir en myk start uten for mye oppsett.",
    tasks: [
      ["Pusse tenner morgen", "Gjør tennene klare for dagen.", "🪥", 5, "Morgen", "daily", ["weekdays"], false],
      ["Kle på seg", "Finn klær og kle på deg.", "👕", 5, "Morgen", "daily", ["weekdays"], false],
      ["Pakke sekken", "Husk bøker, matboks og drikkeflaske.", "🎒", 10, "Morgen", "daily", ["weekdays"], false],
      ["Pusse tenner kveld", "Puss før leggetid.", "🦷", 5, "Kveld", "daily", ["all"], false],
      ["Finne frem klær", "Legg frem klær til neste dag.", "👚", 10, "Kveld", "daily", ["weekdays"], false],
      ["Legge klær til vask", "Skitne klær skal i skittentøyet.", "🧺", 5, "Kveld", "daily", ["all"], false]
    ]
  },
  {
    id: "home",
    title: "Husarbeid og helg",
    description: "Oppgaver for felles ansvar hjemme, rydding og små bidrag i helgen.",
    tasks: [
      ["Rydde rommet", "Rydd gulv og flater så rommet er hyggelig.", "🧸", 20, "Helg", "weekly", ["weekend"], true],
      ["Støvsuge eget rom", "Støvsug gulvet på rommet ditt.", "🧹", 25, "Helg", "weekly", ["weekend"], true],
      ["Dekke bordet", "Gjør bordet klart til mat.", "🍽️", 10, "Helg", "daily", ["weekend"], false],
      ["Rydde av bordet", "Hjelp til når måltidet er ferdig.", "🥣", 10, "Helg", "daily", ["weekend"], false],
      ["Tømme oppvaskmaskinen", "Sett rent servise på plass.", "🍴", 20, "Bonus", "once", ["all"], true],
      ["Ekstra rydding", "Rydd noe som ikke står på lista.", "✨", 15, "Bonus", "once", ["all"], true]
    ]
  },
  {
    id: "rewards",
    title: "Belønninger",
    description: "Et nøkternt startsett med belønninger familien kan justere etter egne regler.",
    rewards: [
      ["15 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "🎮", 20, "Skjermtid"],
      ["30 min ekstra skjermtid", "Ekstra tid avtales og gis av voksen.", "🎮", 35, "Skjermtid"],
      ["Velge film", "Du får velge film til en familiekveld.", "🎬", 60, "Aktivitet"],
      ["Velge middag", "Du får velge en middag familien lager.", "🍝", 75, "Aktivitet"],
      ["Liten overraskelse", "En liten avtalt overraskelse.", "🎁", 150, "Annet"]
    ]
  }
];

let state = loadState();
let view = {
  booting: true,
  bootMessage: "Henter siste versjon og familiedata",
  mode: localStorage.getItem(DEVICE_PROFILE_KEY) || "home",
  childId: localStorage.getItem(DEVICE_PROFILE_KEY)?.startsWith("child:")
    ? localStorage.getItem(DEVICE_PROFILE_KEY).replace("child:", "")
    : null,
  childTab: "tasks",
  adultTab: "overview",
  adultUnlocked: false,
  editingTaskId: null,
  editingRewardId: null,
  editingChildId: null,
  settingsPage: "menu",
  creatingTask: false,
  creatingReward: false,
  creatingChild: false,
  taskFilters: { search: "", category: "all", child: "all", status: "all" },
  setupStep: 0,
  setupDraft: null,
  avatarPickerChildId: null,
  gate: null,
  scrollTopPending: true
};

let previousView = { mode: view.mode, childId: view.childId, childTab: view.childTab };

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return normalizeLocalState(JSON.parse(raw), true);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return normalizeLocalState({
    familyId: "local-family",
    cloudFamilyId: null,
    familyName: "",
    familyCode: createFamilyCode(),
    schemaVersion: SCHEMA_VERSION,
    setupCompleted: false,
    ownerUid: null,
    adultUsers: [],
    familyDevices: [],
    inviteCodes: [],
    parentPinHash: PIN_HASH,
    children: [],
    tasks: [],
    completions: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    history: [],
    syncDiagnostics: null,
    levels: DEFAULT_LEVELS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, false);
}

function normalizeLocalState(savedState = {}, existingInstall = true) {
  const hasConfiguredData = Boolean(savedState.setupCompleted || savedState.children?.length || savedState.tasks?.length || savedState.rewards?.length);
  return {
    familyId: savedState.familyId || "local-family",
    cloudFamilyId: savedState.cloudFamilyId || null,
    familyName: savedState.familyName || "Familien",
    familyCode: savedState.familyCode || familyCodeFromSeed(`${savedState.familyId || "local-family"}-${savedState.createdAt || "start"}`),
    schemaVersion: savedState.schemaVersion || SCHEMA_VERSION,
    setupCompleted: savedState.setupCompleted ?? (existingInstall && hasConfiguredData),
    ownerUid: savedState.ownerUid || null,
    adultUsers: normalizeAdultUsers(savedState.adultUsers || []),
    familyDevices: normalizeFamilyDevices(savedState.familyDevices || []),
    inviteCodes: normalizeInviteCodes(savedState.inviteCodes || [], savedState.familyCode),
    parentPinHash: savedState.parentPinHash || PIN_HASH,
    children: normalizeChildren(savedState.children || childrenSeed),
    tasks: normalizeTasks(savedState.tasks || taskSeeds),
    completions: savedState.completions || [],
    rewards: normalizeRewards(savedState.rewards || rewardSeeds),
    redemptions: savedState.redemptions || [],
    transactions: savedState.transactions || [],
    history: savedState.history || [],
    badges: savedState.badges || [],
    syncDiagnostics: normalizeSyncDiagnostics(savedState.syncDiagnostics),
    cloudMigration: normalizeCloudMigration(savedState.cloudMigration),
    levels: savedState.levels || DEFAULT_LEVELS,
    createdAt: savedState.createdAt || new Date().toISOString(),
    updatedAt: savedState.updatedAt || new Date().toISOString()
  };
}

function normalizeCloudMigration(migration) {
  if (!migration || typeof migration !== "object") return null;
  return {
    from: migration.from || "",
    to: migration.to || "",
    status: migration.status || (migration.migratedAt ? "completed" : ""),
    attemptedAt: migration.attemptedAt || "",
    migratedAt: migration.migratedAt || "",
    error: migration.error || "",
    appVersion: migration.appVersion || ""
  };
}

function normalizeSyncDiagnostics(diagnostics) {
  if (!diagnostics || typeof diagnostics !== "object") return null;
  return {
    lastTestAt: diagnostics.lastTestAt || null,
    lastTestDevice: diagnostics.lastTestDevice || "",
    appVersion: diagnostics.appVersion || ""
  };
}

function normalizeChildren(children) {
  return children.map((child, index) => ({
    ...child,
    id: child.id || `child-${index + 1}`,
    name: child.name || `Barn ${index + 1}`,
    avatar: child.avatar || AVATAR_ICONS[index % AVATAR_ICONS.length],
    color: child.color || CHILD_COLORS[index % CHILD_COLORS.length],
    pointsBalance: Number(child.pointsBalance) || 0,
    lifetimePoints: Number(child.lifetimePoints) || 0,
    streak: Number(child.streak) || 0,
    active: child.active !== false
  }));
}

function normalizeAdultUsers(users) {
  return users.map((user) => ({
    uid: user.uid || null,
    email: user.email || "",
    name: user.name || "",
    photoURL: user.photoURL || "",
    provider: user.provider || "google",
    role: user.role || "adult",
    status: user.status || "active",
    addedAt: user.addedAt || new Date().toISOString(),
    lastLoginAt: user.lastLoginAt || null
  }));
}

function normalizeFamilyDevices(devices) {
  return devices.map((device) => ({
    id: device.id || crypto.randomUUID(),
    label: device.label || "Familieenhet",
    profile: device.profile || "home",
    status: device.status || "active",
    linkedAt: device.linkedAt || new Date().toISOString(),
    lastSeenAt: device.lastSeenAt || null
  }));
}

function normalizeInviteCodes(invites, familyCode) {
  const normalized = invites.map((invite) => ({
    id: invite.id || crypto.randomUUID(),
    code: normalizeFamilyCode(invite.code || familyCode || createFamilyCode()),
    type: invite.type || "device",
    status: invite.status || "active",
    createdAt: invite.createdAt || new Date().toISOString(),
    expiresAt: invite.expiresAt || (invite.type === "adult" ? adultInviteExpiresAt(invite.createdAt) : null),
    usedByUid: invite.usedByUid || null,
    usedAt: invite.usedAt || null
  }));
  if (!normalized.length && familyCode) {
    normalized.push({
      id: crypto.randomUUID(),
      code: normalizeFamilyCode(familyCode),
      type: "device",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: null
    });
  }
  return normalized;
}

function normalizeTasks(tasks) {
  return tasks.map((task, index) => ({
    ...task,
    assignedChildren: Array.isArray(task.assignedChildren) ? task.assignedChildren : allChildren,
    active: task.active !== false,
    sortOrder: Number(task.sortOrder) || index + 1
  }));
}

function normalizeRewards(rewards) {
  return rewards.map((reward) => ({
    ...reward,
    assignedChildren: Array.isArray(reward.assignedChildren) ? reward.assignedChildren : allChildren,
    active: reward.active !== false
  }));
}

function saveState() {
  syncFamilyCodeInvite();
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  ensureCloudFamilyPath();
  queueCloudSave();
}

function syncFamilyCodeInvite() {
  if (!state.familyCode) state.familyCode = createFamilyCode();
  if (!Array.isArray(state.inviteCodes)) state.inviteCodes = [];
  const code = normalizeFamilyCode(state.familyCode);
  const existing = state.inviteCodes.find((invite) => normalizeFamilyCode(invite.code) === code && invite.type === "device");
  if (existing) {
    existing.status = "active";
    return;
  }
  state.inviteCodes.push({
    id: crypto.randomUUID(),
    code,
    type: "device",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: null
  });
}

function render() {
  if (view.booting) {
    renderLoading();
  } else if (isSetupPreview()) {
    renderSetup();
  } else if (pendingFamilyCode() && state.setupCompleted) {
    renderDeviceConnect();
  } else if (!state.setupCompleted) {
    renderSetup();
  } else if (view.gate) {
    renderPinGate();
  } else if (view.mode === "adult") {
    renderAdult();
  } else if (view.mode === "child" && view.childId) {
    renderChild(view.childId);
  } else {
    renderHome();
  }
  scrollToTopIfNeeded();
}

function renderLoading() {
  app.innerHTML = `
    <section class="loading-screen" aria-live="polite">
      <div class="loading-art">
        <img src="icons/loading-family.svg?v=${APP_VERSION}" alt="">
      </div>
      <div class="loading-copy">
        <p class="eyebrow">Familieoppdrag</p>
        <h1>Gjør oppdragene klare</h1>
        <p>${escapeText(view.bootMessage || "Starter appen")}</p>
      </div>
      <div class="loading-bar" aria-hidden="true"><span></span></div>
    </section>
  `;
}

function renderDeviceConnect() {
  const code = pendingFamilyCode();
  const adultInviteCode = pendingAdultInviteCode();
  const isAdultInvite = Boolean(adultInviteCode);
  const matchesFamily = normalizeFamilyCode(code) === normalizeFamilyCode(state.familyCode);
  const adultInvite = adultInviteCode ? findActiveInvite(adultInviteCode, "adult") : null;
  const lookupFailed = Boolean(cloud.familyCodeLookupError);
  app.innerHTML = `
    <header class="topbar setup-topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>${isAdultInvite ? "Koble til voksen" : "Koble til enhet"}</h1>
        </div>
      </div>
    </header>
    <section class="setup-shell">
      <div class="setup-intro ${isAdultInvite ? "adult-invite-intro" : ""}">
        <h2>${matchesFamily ? isAdultInvite ? "Voksen" : "Velg startside" : "Fant ikke familien"}</h2>
        <p>${matchesFamily ? adultInviteCode ? `${escapeText(state.familyName)} er funnet. Logg inn med Google for å bli lagt til som voksen.` : `${escapeText(state.familyName)} er klar på denne enheten. Velg hva appen skal åpne med.` : "Appen forsøkte å finne familien med familiekoden i Firestore."}</p>
      </div>
      <div class="panel setup-form">
        ${matchesFamily && adultInviteCode ? `
          <div class="setup-block">
            <h3>${adultInvite ? "Invitasjonen er klar" : "Invitasjonen er ikke gyldig"}</h3>
            <p class="muted">${adultInvite ? "Denne voksne får tilgang til voksenpanelet etter Google-innlogging." : "Be eier lage en ny vokseninvitasjon fra Familie og voksne."}</p>
            <div class="actions" style="margin-top:14px">
              <button class="btn" data-action="accept-adult-invite" ${adultInvite ? "" : "disabled"}>Logg inn med Google</button>
              <button class="btn secondary" data-action="cancel-connect">Til appen</button>
            </div>
          </div>
        ` : matchesFamily ? `
          <div class="setup-block">
            <h3>${escapeText(state.familyName)}</h3>
            <p class="muted">Du kan endre standardprofil senere fra hjemskjermen eller barnets profil.</p>
            <div class="connect-options">
              <button class="btn secondary" data-action="connect-device" data-profile="home">Profilvalg på felles enhet</button>
              <button class="btn secondary" data-action="connect-device" data-profile="adult">Voksenoversikt</button>
              ${activeChildren().map((child) => `<button class="btn secondary" data-action="connect-device" data-profile="child:${child.id}">${child.avatar} ${child.name}</button>`).join("")}
            </div>
          </div>
        ` : `
          <div class="setup-block">
            <h3>Kode: ${escapeText(code || "")}</h3>
            <p class="muted">${lookupFailed ? `Kunne ikke finne familie med denne koden: ${escapeText(cloud.familyCodeLookupError)}` : "Koden ble ikke funnet i familie-registeret. Sjekk at koden er riktig, og at voksen har åpnet appen minst én gang etter siste oppdatering."}</p>
          </div>
        `}
        ${matchesFamily && adultInviteCode ? "" : `<div class="actions">
          <button class="btn secondary" data-action="cancel-connect">Til appen</button>
        </div>`}
      </div>
    </section>
  `;
}

function renderSetup() {
  ensureSetupDraft();
  const steps = setupSteps();
  const preview = isSetupPreview();
  const step = Math.min(Math.max(view.setupStep || 0, 0), steps.length - 1);
  view.setupStep = step;
  const current = steps[step];

  app.innerHTML = `
    <header class="topbar setup-topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Oppstartsveileder</h1>
          ${preview ? `<div class="pill-row"><span class="pill pending">Forhåndsvisning</span></div>` : ""}
        </div>
      </div>
    </header>
    <section class="setup-shell">
      <div class="setup-intro setup-wizard-intro">
        <h2>${current.hero}</h2>
        <p>${current.description}</p>
        <div class="setup-progress" aria-label="Steg ${step + 1} av ${steps.length}">
          ${steps.map((item, index) => `<span class="${index === step ? "active" : index < step ? "done" : ""}"></span>`).join("")}
        </div>
      </div>
      <form data-form="first-setup" class="panel setup-form">
        <div class="setup-step-label">Steg ${step + 1} av ${steps.length}</div>
        ${setupStepContent(current.id)}
        <div class="actions setup-actions">
          ${step > 0 ? `<button class="btn secondary" type="button" data-action="setup-back">Tilbake</button>` : ""}
          ${step < steps.length - 1 ? `<button class="btn" type="button" data-action="setup-next">Neste</button>` : `<button class="btn" type="submit">${preview ? "Avslutt forhåndsvisning" : "Start og åpne Deling"}</button>`}
        </div>
      </form>
    </section>
  `;
}

function setupSteps() {
  return [
    { id: "welcome", hero: "Velkommen", description: "Vi går gjennom det viktigste på noen minutter. Alt kan endres senere fra Innstillinger." },
    { id: "google", hero: "Voksen", description: "En voksen logger inn med Google og blir familieeier. Dette gjør deling og sikkerhet ryddigere." },
    { id: "family", hero: "Familien", description: "Gi familien et navn og fortell hvor mange barn som skal ha profiler." },
    { id: "children", hero: "Barn", description: "Legg inn navn på barna. Du kan legge til, skjule og endre barn senere." },
    { id: "packages", hero: "Maler", description: "Velg startpakker med oppgaver og belønninger. Alt kan redigeres etterpå." },
    { id: "pin", hero: "PIN", description: "Sett en voksen-PIN som beskytter voksenpanelet på felles enheter." },
    { id: "ready", hero: "Klar", description: "Se over valgene dine. Etterpå åpnes Deling, der du kan koble til barnas enheter eller invitere en voksen." }
  ];
}

function ensureSetupDraft() {
  if (view.setupDraft) return;
  view.setupDraft = {
    familyName: state.familyName === "Familien" ? "" : state.familyName || "",
    childCount: 2,
    childNames: ["", "", "", "", ""],
    starterPackages: STARTER_PACKAGES.map((pack) => pack.id),
    pin: "",
    repeatPin: ""
  };
}

function setupStepContent(stepId) {
  const draft = view.setupDraft;
  const preview = isSetupPreview();
  if (stepId === "welcome") {
    return `
      <div class="setup-block">
        <h3>Velkommen til Familieoppdrag</h3>
        <p class="muted">Veilederen hjelper deg å lage en familie, legge inn barn, velge startmaler og sette voksen-PIN.</p>
        <div class="setup-note">Du kan endre navn, oppgaver, belønninger, barn, PIN og deling senere fra voksenpanelet.</div>
        ${preview ? `<div class="setup-note">Forhåndsvisning er trygg: Den logger ikke inn, oppretter ikke familie og skriver ikke til Firestore.</div>` : ""}
      </div>
    `;
  }
  if (stepId === "google") {
    if (preview) {
      return `
        <div class="setup-block auth-setup">
          <h3>Voksen med Google</h3>
          <p class="muted">I vanlig oppstart må minst én voksen logge inn med Google før familien kan deles til andre enheter.</p>
          <div class="auth-status-card ready">
            <div>
              <strong>Google-steg forhåndsvises</strong>
              <small>Ingen innlogging gjøres i forhåndsvisning.</small>
            </div>
            <button class="btn secondary" type="button" disabled>Forhåndsvisning</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="setup-block auth-setup">
        <h3>Voksen med Google</h3>
        <p class="muted">Minst én voksen må logge inn med Google før familien kan deles til andre enheter.</p>
        <div class="auth-status-card ${familyHasGoogleOwner() ? "ready" : "pending"}">
          <div>
            <strong>${familyHasGoogleOwner() ? "Google-eier er klar" : "Google-eier mangler"}</strong>
            <small>${googleOwnerLabel()}</small>
          </div>
          <button class="btn secondary" type="button" data-action="google-owner-login">${familyHasGoogleOwner() ? "Bytt Google-konto" : "Logg inn med Google"}</button>
        </div>
      </div>
    `;
  }
  if (stepId === "family") {
    return `
      <div class="setup-block">
        <h3>Familie</h3>
        <div class="form-grid">
          ${field("familyName", "Familienavn", draft.familyName, "text")}
          <div class="field">
            <label>Antall barn</label>
            <select name="childCount">
              ${[1, 2, 3, 4, 5].map((count) => `<option value="${count}" ${Number(draft.childCount) === count ? "selected" : ""}>${count}</option>`).join("")}
            </select>
          </div>
        </div>
      </div>
    `;
  }
  if (stepId === "children") {
    const count = Number(draft.childCount) || 1;
    return `
      <div class="setup-block">
        <h3>Barn</h3>
        <div class="form-grid">
          ${Array.from({ length: count }, (_, index) => `
            <div class="field">
              <label>Barn ${index + 1}</label>
              <input name="childName" type="text" value="${escapeAttr(draft.childNames[index] || "")}" required>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (stepId === "packages") {
    return `
      <div class="setup-block">
        <h3>Startpakker</h3>
        <div class="setup-options">
          ${STARTER_PACKAGES.map((pack) => `
            <label class="setup-option">
              <input type="checkbox" name="starterPackage" value="${pack.id}" ${draft.starterPackages.includes(pack.id) ? "checked" : ""}>
              <span>
                <strong>${pack.title}</strong>
                <small>${pack.description}</small>
              </span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (stepId === "pin") {
    return `
      <div class="setup-block">
        <h3>Voksen-PIN</h3>
        <p class="muted">PIN-koden brukes på felles iPad eller barneenheter når noen skal inn i voksenpanelet.</p>
        <div class="form-grid">
          <div class="field">
            <label>Ny voksen-PIN</label>
            <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" value="${escapeAttr(draft.pin)}" required>
          </div>
          <div class="field">
            <label>Gjenta PIN</label>
            <input name="repeatPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" value="${escapeAttr(draft.repeatPin)}" required>
          </div>
        </div>
      </div>
    `;
  }
  return `
    <div class="setup-block">
      <h3>Klar til å starte</h3>
      <div class="setup-summary">
        <div><strong>Familie</strong><span>${escapeText(draft.familyName || "Ikke satt")}</span></div>
        <div><strong>Barn</strong><span>${draft.childNames.filter(Boolean).map(escapeText).join(", ") || "Ingen"}</span></div>
        <div><strong>Startpakker</strong><span>${draft.starterPackages.map((id) => STARTER_PACKAGES.find((pack) => pack.id === id)?.title).filter(Boolean).join(", ") || "Ingen"}</span></div>
        <div><strong>Google-eier</strong><span>${escapeText(googleOwnerLabel())}</span></div>
      </div>
      <div class="setup-note">Når du starter familien, åpnes Deling-fanen. Der finner du lenke til barnas enheter, familiekode og vokseninvitasjon.</div>
      <p class="muted">Etter oppstart kan du endre navn, barn, oppgaver, belønninger, PIN og startpakker fra voksenpanelet.</p>
    </div>
  `;
}

function renderHome() {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>${escapeText(state.familyName || "Velg profil")}</h1>
        </div>
      </div>
      <button class="btn secondary" data-action="adult-login">🔐 Voksen</button>
    </header>
    <section class="hero">
      <div class="hero-main">
        <h1>Dagens oppdrag</h1>
        <p>Barna velger sin egen profil og ser egne oppgaver der. Voksen kan styre alt fra et eget område med PIN.</p>
        <div class="hero-stats">
          <div class="stat"><strong>${activeChildren().length}</strong><span>barn</span></div>
          <div class="stat"><strong>${state.tasks.filter((task) => task.active && !task.hiddenFromChildren).length}</strong><span>aktive oppgaver</span></div>
          <div class="stat"><strong>${pendingApprovals().length}</strong><span>venter på voksen</span></div>
        </div>
      </div>
      <div class="panel">
        <h2>Standard på denne enheten</h2>
        <p class="muted">Når en tablet skal åpne rett i barnets profil, velger du barnet og trykker på knappen inne på profilen.</p>
        <div class="pill-row">
          <span class="pill">${deviceProfileLabel()}</span>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn secondary" data-action="set-device-home">📌 Bruk profilvalg som standard</button>
        </div>
      </div>
    </section>
    <section class="profile-grid">
      ${activeChildren().map((child) => childCard(child)).join("") || `<div class="empty">Ingen aktive barneprofiler. Gå til voksenpanelet for å legge til barn.</div>`}
    </section>
  `;
}

function childCard(child) {
  const today = childPeriodTasks(child.id, "daily");
  const completed = today.filter((item) => ["completed", "approved"].includes(item.status)).length;
  const percent = today.length ? Math.round((completed / today.length) * 100) : 0;
  return `
    <button class="card profile-card" data-action="open-child" data-child="${child.id}">
      <div class="avatar" style="background:${child.color}22">${child.avatar}</div>
      <div>
        <h2>${child.name}</h2>
      </div>
      <div class="progress" aria-label="${percent}% fullført"><span style="width:${percent}%"></span></div>
      <p class="small">${completed} av ${today.length} oppdrag i dag</p>
    </button>
  `;
}

function renderChild(childId) {
  const child = getChild(childId);
  const stats = childStats(childId);
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <button class="avatar avatar-button" style="background:${child.color}22" data-action="open-avatar-picker" data-child="${child.id}" aria-label="Velg ikon">${child.avatar}</button>
        <div>
          <p class="eyebrow">Hei, ${child.name}</p>
          <h1>${view.childTab === "tasks" ? "Oppdrag" : view.childTab === "rewards" ? "Belønninger" : "Mine stjerner"}</h1>
        </div>
      </div>
      <div class="actions">
        <button class="btn secondary" data-action="home">🏠</button>
        <button class="btn secondary" data-action="set-device-child" data-child="${child.id}">📌 Standard</button>
        <button class="btn secondary" data-action="adult-login">🔐 Voksen</button>
      </div>
    </header>
    <section class="hero ${view.childTab === "me" ? "single" : ""}">
      <div class="hero-main" style="background:linear-gradient(135deg, ${child.color}, #00c2a8)">
        <h1>${child.pointsBalance} stjerner</h1>
        <p>Nivå ${stats.levelNumber}: ${stats.level.name}</p>
        <div class="hero-stats">
          <div class="stat"><strong>${stats.dailyDone}/${stats.dailyTotal}</strong><span>i dag</span></div>
          <div class="stat"><strong>${stats.weeklyDone}/${stats.weeklyTotal}</strong><span>denne uken</span></div>
          <div class="stat"><strong>${child.streak}</strong><span>streak</span></div>
        </div>
      </div>
      ${view.childTab === "me" ? "" : `<div class="panel">
        ${levelProgressCard(child, "compact")}
      </div>`}
    </section>
    ${view.childTab === "tasks" ? childTaskView(child) : ""}
    ${view.childTab === "rewards" ? childRewardView(child) : ""}
    ${view.childTab === "me" ? childMeView(child) : ""}
    <nav class="bottom-nav" aria-label="Barnemeny">
      <button class="${view.childTab === "tasks" ? "active" : ""}" data-action="child-tab" data-tab="tasks">⭐ Oppdrag</button>
      <button class="${view.childTab === "rewards" ? "active" : ""}" data-action="child-tab" data-tab="rewards">🎁 Belønning</button>
      <button class="${view.childTab === "me" ? "active" : ""}" data-action="child-tab" data-tab="me">🏅 Meg</button>
    </nav>
    ${view.avatarPickerChildId === child.id ? avatarPickerModal(child) : ""}
  `;
}

function avatarPickerModal(child) {
  return `
    <div class="modal-backdrop">
      <div class="modal avatar-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-title">
        <div class="modal-head">
          <div>
            <p class="eyebrow">${child.name}</p>
            <h2 id="avatar-title">Velg ikon</h2>
          </div>
          <button class="btn secondary icon-btn" data-action="close-avatar-picker" aria-label="Lukk">✕</button>
        </div>
        <div class="avatar-picker">
          ${AVATAR_ICONS.map((icon) => `
            <button class="avatar-choice ${icon === child.avatar ? "selected" : ""}" data-action="choose-avatar" data-child="${child.id}" data-avatar="${escapeAttr(icon)}" aria-label="Velg ${escapeAttr(icon)}">
              ${icon}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function childTaskView(child) {
  const daily = childPeriodTasks(child.id, "daily").filter((item) => item.task.category !== "Bonus");
  const weekly = childPeriodTasks(child.id, "weekly");
  const bonus = [
    ...childPeriodTasks(child.id, "daily").filter((item) => item.task.category === "Bonus"),
    ...childPeriodTasks(child.id, "once")
  ].sort((a, b) => a.task.sortOrder - b.task.sortOrder);
  return `
    ${groupedTaskSection("Dagens oppdrag", daily, child.id)}
    ${taskSection("Ukens oppdrag", weekly, child.id)}
    ${taskSection("Ekstraoppdrag", bonus, child.id)}
  `;
}

function groupedTaskSection(title, items, childId) {
  const categories = ["Morgen", "Etter skole", "Kveld", "Helg"];
  const grouped = categories
    .map((category) => ({
      category,
      items: items.filter((item) => item.task.category === category)
    }))
    .filter((group) => group.items.length);
  const other = items.filter((item) => !categories.includes(item.task.category));
  if (other.length) grouped.push({ category: "Andre oppdrag", items: other });

  return `
    <section>
      <div class="section-title">
        <h2>${title}</h2>
        <span class="small">${items.length} stk.</span>
      </div>
      ${grouped.length ? grouped.map((group) => taskCategoryGroup(group, childId)).join("") : `<div class="empty">Ingen oppdrag akkurat nå.</div>`}
    </section>
  `;
}

function taskCategoryGroup(group, childId) {
  const done = group.items.filter((item) => ["completed", "approved"].includes(item.status)).length;
  const percent = group.items.length ? Math.round((done / group.items.length) * 100) : 0;
  return `
    <div class="task-group">
      <div class="task-group-head">
        <div>
          <h3>${categoryIcon(group.category)} ${group.category}</h3>
          <p class="small">${done} av ${group.items.length} fullført</p>
        </div>
        <span class="pill ${done === group.items.length ? "done" : ""}">${percent}%</span>
      </div>
      <div class="progress"><span style="width:${percent}%"></span></div>
      <div class="task-list">
        ${group.items.map((item) => taskCard(item, childId)).join("")}
      </div>
    </div>
  `;
}

function taskSection(title, items, childId) {
  return `
    <section>
      <div class="section-title">
        <h2>${title}</h2>
        <span class="small">${items.length} stk.</span>
      </div>
      <div class="task-list">
        ${items.length ? items.map((item) => taskCard(item, childId)).join("") : `<div class="empty">Ingen oppdrag akkurat nå.</div>`}
      </div>
    </section>
  `;
}

function categoryIcon(category) {
  return {
    Morgen: "🌅",
    "Etter skole": "🏡",
    Kveld: "🌙",
    Helg: "☀️",
    Bonus: "✨"
  }[category] || "⭐";
}

function taskCard(item, childId) {
  const statusText = statusLabel(item.status);
  const done = ["completed", "approved", "pending"].includes(item.status);
  const canUndo = ["completed", "approved", "pending"].includes(item.status);
  const buttonText = item.task.requiresApproval ? "Utført" : "Utført";
  const waitingForAdult = item.status === "pending";
  return `
    <article class="task-card">
      <div class="task-icon">${item.task.icon}</div>
      <div>
        <h3>${item.task.title}</h3>
        <p class="muted">${item.task.description}</p>
        <div class="pill-row">
          <span class="pill">+${item.task.points} ⭐</span>
          <span class="pill ${item.status === "pending" ? "pending" : done ? "done" : ""}">${statusText}</span>
          ${item.task.requiresApproval ? `<span class="pill pending">Voksen</span>` : ""}
        </div>
      </div>
      <div class="actions">
        ${waitingForAdult ? `<button class="btn waiting" disabled>Sendt til voksen</button>` : ""}
        ${canUndo ? `<button class="btn secondary" data-action="undo-task" data-child="${childId}" data-completion="${item.completion.id}">Angre</button>` : ""}
        ${!canUndo ? `<button class="btn success" data-action="complete-task" data-child="${childId}" data-task="${item.task.id}" ${done ? "disabled" : ""}>${buttonText}</button>` : ""}
      </div>
    </article>
  `;
}

function childRewardView(child) {
  const rewards = state.rewards
    .filter((reward) => reward.active && reward.assignedChildren.includes(child.id))
    .sort((a, b) => a.cost - b.cost || a.title.localeCompare(b.title, "no"));
  const approved = approvedRewardRedemptions(child.id);
  return `
    ${approved.length ? childApprovedRewardsSection(approved) : ""}
    <section>
      <div class="section-title">
        <h2>Belønningsbutikk</h2>
        <span class="small">${child.pointsBalance} stjerner</span>
      </div>
      <div class="reward-grid">
        ${rewards.map((reward) => rewardCard(reward, child)).join("")}
      </div>
    </section>
  `;
}

function childApprovedRewardsSection(redemptions) {
  return `
    <section>
      <div class="section-title">
        <h2>Godkjent, venter</h2>
        <span class="small">${redemptions.length} stk.</span>
      </div>
      <div class="reward-grid">
        ${redemptions.map((redemption) => {
          const reward = getReward(redemption.rewardId);
          return `
            <article class="card reward-card">
              <div class="reward-icon">${reward.icon}</div>
              <h3>${reward.title}</h3>
              <p class="muted">Godkjent av voksen. Venter på gjennomføring.</p>
              <div class="pill-row">
                <span class="pill">${redemption.cost} ⭐ brukt</span>
                <span class="pill pending">Skal gjennomføres</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function rewardCard(reward, child) {
  const pending = state.redemptions.find((item) => item.rewardId === reward.id && item.childId === child.id && item.status === "pending");
  const missing = reward.cost - child.pointsBalance;
  return `
    <article class="card reward-card">
      <div class="reward-icon">${reward.icon}</div>
      <h3>${reward.title}</h3>
      <p class="muted">${reward.description}</p>
      <div class="pill-row">
        <span class="pill">${reward.cost} ⭐</span>
        <span class="pill">${reward.type}</span>
      </div>
      <p class="small">${missing <= 0 ? "Du har nok stjerner." : `Du mangler ${missing} stjerner.`}</p>
      <button class="btn" data-action="request-reward" data-child="${child.id}" data-reward="${reward.id}" ${missing > 0 || pending ? "disabled" : ""}>
        ${pending ? "Venter på voksen" : "Be om belønning"}
      </button>
    </article>
  `;
}

function childMeView(child) {
  const history = state.history.filter((item) => item.childId === child.id).slice(0, 12);
  const rewards = completedRewardRedemptions(child.id).slice(0, 12);
  const badges = earnedBadges(child.id);
  return `
    ${levelProgressCard(child, "full")}
    <section class="dashboard-grid">
      <article class="card">
        <h3>Stjerner</h3>
        <p class="muted">Nåværende saldo</p>
        <h2>${child.pointsBalance} ⭐</h2>
      </article>
      <article class="card">
        <h3>Livstid</h3>
        <p class="muted">Alle stjerner tjent</p>
        <h2>${child.lifetimePoints} ⭐</h2>
      </article>
      <article class="card">
        <h3>Nivå</h3>
        <p class="muted">${currentLevel(child.lifetimePoints).name}</p>
        <h2>${currentLevelIndex(child.lifetimePoints)}</h2>
      </article>
    </section>
    <section>
      <div class="section-title"><h2>Merker</h2><span class="small">${badges.length} stk.</span></div>
      ${badgeGrid(child.id)}
    </section>
    <section>
      <div class="section-title"><h2>Tidligere belønninger</h2></div>
      ${childRewardHistoryList(rewards)}
    </section>
    <section>
      <div class="section-title"><h2>Historikk</h2></div>
      ${historyList(history, true)}
    </section>
  `;
}

function badgeGrid(childId) {
  const earned = earnedBadges(childId);
  return `
    <div class="badge-grid">
      ${BADGE_DEFINITIONS.map((badge) => {
        const childBadge = earned.find((item) => item.badgeId === badge.id);
        return `
          <article class="badge-card ${childBadge ? "earned" : "locked"}">
            <div class="badge-icon">${childBadge ? badge.icon : "🔒"}</div>
            <div>
              <h3>${badge.name}</h3>
              <p class="muted">${badge.description}</p>
              <p class="small">${childBadge ? `Fikk ${formatDate(childBadge.awardedAt)}` : "Ikke låst opp ennå"}</p>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function childRewardHistoryList(items) {
  if (!items.length) return `<div class="empty">Ingen belønninger brukt ennå.</div>`;
  return `
    <div class="task-list">
      ${items.map((redemption) => {
        const reward = getReward(redemption.rewardId);
        return `
          <article class="task-card">
            <div class="task-icon">${reward.icon}</div>
            <div>
              <h3>${reward.title}</h3>
              <p class="muted">${rewardStatusText(redemption)}</p>
              <div class="pill-row">
                <span class="pill">${redemption.cost} ⭐</span>
                <span class="pill ${redemption.status === "fulfilled" ? "done" : ["rejected", "refunded"].includes(redemption.status) ? "rejected" : "pending"}">${rewardStatusLabel(redemption.status)}</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn secondary" data-action="hide-child-reward" data-id="${redemption.id}">Fjern</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderAdult() {
  if (!view.adultUnlocked) {
    renderPinModal();
    return;
  }

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">🔐</div>
        <div>
          <p class="eyebrow">Voksenmodus</p>
          <h1>Familieoversikt</h1>
        </div>
      </div>
      <div class="actions">
        <span class="sync-pill ${cloudStatusClass()}">${cloudStatusLabel()}</span>
        <button class="btn secondary" data-action="set-device-adult">📌 Standard</button>
        <button class="btn secondary" data-action="home">🏠</button>
        <button class="btn danger" data-action="lock-adult">Lås</button>
      </div>
    </header>
    <nav class="tabs" aria-label="Voksenmeny">
      ${["overview:Oversikt", "approvals:Godkjenninger", "tasks:Oppgaver", "rewards:Belønninger", "children:Barn", "share:Deling", "history:Historikk", "settings:Innstillinger"].map((entry) => {
        const [id, label] = entry.split(":");
        return `<button class="tab ${view.adultTab === id ? "active" : ""}" data-action="adult-tab" data-tab="${id}">${label}</button>`;
      }).join("")}
    </nav>
    ${adultTabContent()}
  `;
}

function renderPinModal() {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Voksenmodus</h1>
        </div>
      </div>
      <button class="btn secondary" data-action="home">Tilbake</button>
    </header>
    <div class="modal-backdrop">
      <form class="modal" data-form="pin">
        <h2>PIN-kode</h2>
        <div class="field">
          <label for="pin">PIN</label>
          <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" type="submit">Åpne</button>
          <button class="btn secondary" type="button" data-action="cancel-adult-login">Avbryt</button>
        </div>
      </form>
    </div>
  `;
}

function renderPinGate() {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">🔐</div>
        <div>
          <p class="eyebrow">Voksen-PIN</p>
          <h1>Bytt profil</h1>
        </div>
      </div>
      <button class="btn secondary" data-action="cancel-gate">Tilbake</button>
    </header>
    <div class="modal-backdrop">
      <form class="modal" data-form="pin-gate">
        <h2>PIN kreves</h2>
        <p class="muted">Denne enheten er satt til en fast barneprofil.</p>
        <div class="field">
          <label for="gatePin">PIN</label>
          <input id="gatePin" name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" type="submit">Åpne profilvalg</button>
          <button class="btn secondary" type="button" data-action="cancel-gate">Avbryt</button>
        </div>
      </form>
    </div>
  `;
}

function adultTabContent() {
  if (view.adultTab === "approvals") return adultApprovals();
  if (view.adultTab === "tasks") return adultTasks();
  if (view.adultTab === "rewards") return adultRewards();
  if (view.adultTab === "children") return adultChildren();
  if (view.adultTab === "share") return adultShare();
  if (view.adultTab === "history") return adultHistory();
  if (view.adultTab === "settings") return adultSettings();
  return adultOverview();
}

function adultOverview() {
  return `
    <section class="dashboard-grid">
      ${activeChildren().map((child) => {
        const stats = childStats(child.id);
        const waiting = pendingApprovals().filter((item) => item.childId === child.id).length;
        return `
          <article class="card">
            <div class="brand">
              <div class="avatar" style="background:${child.color}22">${child.avatar}</div>
              <div><h3>${child.name}</h3><p class="muted">${child.pointsBalance} stjerner</p></div>
            </div>
            <div class="pill-row">
              <span class="pill">${stats.dailyDone}/${stats.dailyTotal} i dag</span>
              <span class="pill">${stats.weeklyDone}/${stats.weeklyTotal} uke</span>
              <span class="pill ${waiting ? "pending" : ""}">${waiting} venter</span>
            </div>
          </article>
        `;
      }).join("") || `<div class="empty">Ingen aktive barn ennå.</div>`}
    </section>
  `;
}

function adultApprovals() {
  const pending = pendingApprovals();
  const approvedRewards = approvedRewardRedemptions();
  return `
    <section>
      <div class="section-title"><h2>Godkjenninger</h2><span class="small">${pending.length} venter</span></div>
      <div class="task-list">
        ${pending.length ? pending.map((item) => approvalCard(item)).join("") : `<div class="empty">Ingen godkjenninger venter.</div>`}
      </div>
    </section>
    <section>
      <div class="section-title"><h2>Godkjente belønninger</h2><span class="small">${approvedRewards.length} skal gjennomføres</span></div>
      <div class="task-list">
        ${approvedRewards.length ? approvedRewards.map((item) => approvedRewardCard(item)).join("") : `<div class="empty">Ingen godkjente belønninger venter på gjennomføring.</div>`}
      </div>
    </section>
  `;
}

function approvalCard(item) {
  const child = getChild(item.childId);
  if (item.kind === "reward") {
    const reward = getReward(item.rewardId);
    return `
      <article class="task-card">
        <div class="task-icon">${reward.icon}</div>
        <div>
          <h3>${child.name} ønsker ${reward.title}</h3>
          <p class="muted">Koster ${reward.cost} stjerner. Saldo: ${child.pointsBalance}.</p>
          <div class="pill-row"><span class="pill pending">Belønning</span></div>
        </div>
        <div class="actions">
          <button class="btn success" data-action="approve-reward" data-id="${item.id}">Godkjenn</button>
          <button class="btn danger" data-action="reject-reward" data-id="${item.id}">Avvis</button>
          <button class="btn secondary" data-action="refund-reward" data-id="${item.id}">Refunder</button>
        </div>
      </article>
    `;
  }
  const task = getTask(item.taskId);
  return `
    <article class="task-card">
      <div class="task-icon">${task.icon}</div>
      <div>
        <h3>${child.name}: ${task.title}</h3>
        <p class="muted">${task.description}</p>
        <div class="pill-row"><span class="pill">+${task.points} ⭐</span><span class="pill pending">Oppgave</span></div>
      </div>
      <div class="actions">
        <button class="btn success" data-action="approve-task" data-id="${item.id}">Godkjenn</button>
        <button class="btn danger" data-action="reject-task" data-id="${item.id}">Avvis</button>
      </div>
    </article>
  `;
}

function approvedRewardCard(redemption) {
  const child = getChild(redemption.childId);
  const reward = getReward(redemption.rewardId);
  return `
    <article class="task-card">
      <div class="task-icon">${reward.icon}</div>
      <div>
        <h3>${child.name}: ${reward.title}</h3>
        <p class="muted">Godkjent ${formatDate(redemption.approvedAt)}. Poengene er trukket, men belønningen er ikke markert gjennomført.</p>
        <div class="pill-row">
          <span class="pill">${redemption.cost} ⭐</span>
          <span class="pill pending">Skal gjennomføres</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn success" data-action="fulfill-reward" data-id="${redemption.id}">Marker gjennomført</button>
        <button class="btn secondary" data-action="refund-reward" data-id="${redemption.id}">Refunder</button>
      </div>
    </article>
  `;
}

function adultTasks() {
  const task = view.editingTaskId ? getTask(view.editingTaskId) : null;
  if (view.creatingTask || task) {
    return `
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h2>${task ? "Endre oppgave" : "Ny oppgave"}</h2>
            <p class="muted">${task ? "Oppdater oppgaven og gå tilbake til listen." : "Lag oppgaven ferdig før barna ser den."}</p>
          </div>
          <button class="btn secondary" type="button" data-action="cancel-edit-task">Tilbake</button>
        </div>
        ${taskForm(task)}
      </section>
    `;
  }
  const tasks = filteredAdultTasks();
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Oppgaver</h2>
          <p class="muted">${tasks.length} vises av ${state.tasks.length} totalt</p>
        </div>
        <button class="btn" data-action="new-task">Ny oppgave</button>
      </div>
      ${taskFilterBar()}
      <div class="table-wrap">
        <table>
          <thead><tr><th>Oppgave</th><th>Type</th><th>Barn</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${tasks.length ? tasks.map((item) => `
              <tr>
                <td>${item.icon} <strong>${item.title}</strong><br><span class="small">${item.points} stjerner</span></td>
                <td>${frequencyLabel(item.frequency)}<br><span class="small">${item.category}</span></td>
                <td>${item.assignedChildren.map((id) => getChild(id)?.name || "Ukjent").join(", ")}</td>
                <td>${taskStatusText(item)}</td>
                <td><button class="btn secondary" data-action="edit-task" data-id="${item.id}">Endre</button></td>
              </tr>
            `).join("") : `<tr><td colspan="5"><div class="empty">Ingen oppgaver passer filteret.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function taskFilterBar() {
  const filters = view.taskFilters;
  return `
    <div class="filter-bar">
      <div class="field">
        <label>Søk</label>
        <input data-filter="task-search" type="search" value="${escapeAttr(filters.search)}" placeholder="Søk etter oppgave">
      </div>
      <div class="field">
        <label>Kategori</label>
        <select data-filter="task-category">
          ${[["all", "Alle"], ["Morgen", "Morgen"], ["Etter skole", "Etter skole"], ["Kveld", "Kveld"], ["Helg", "Helg"], ["Bonus", "Bonus"]].map(([value, label]) => `<option value="${value}" ${filters.category === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Barn</label>
        <select data-filter="task-child">
          <option value="all" ${filters.child === "all" ? "selected" : ""}>Alle</option>
          ${state.children.map((child) => `<option value="${child.id}" ${filters.child === child.id ? "selected" : ""}>${child.name}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Status</label>
        <select data-filter="task-status">
          ${[["all", "Alle"], ["visible", "Synlig for barn"], ["hidden", "Skjult for barn"], ["active", "Aktiv"], ["inactive", "Deaktivert"], ["approval", "Krever voksen"]].map(([value, label]) => `<option value="${value}" ${filters.status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
}

function filteredAdultTasks() {
  const filters = view.taskFilters;
  const search = filters.search.trim().toLowerCase();
  return state.tasks
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((task) => {
      if (search && !`${task.title} ${task.description} ${task.category}`.toLowerCase().includes(search)) return false;
      if (filters.category !== "all" && task.category !== filters.category) return false;
      if (filters.child !== "all" && !task.assignedChildren.includes(filters.child)) return false;
      if (filters.status === "visible" && task.hiddenFromChildren) return false;
      if (filters.status === "hidden" && !task.hiddenFromChildren) return false;
      if (filters.status === "active" && !task.active) return false;
      if (filters.status === "inactive" && task.active) return false;
      if (filters.status === "approval" && !task.requiresApproval) return false;
      return true;
    });
}

function taskForm(task) {
  const selectedDays = selectedTaskDays(task);
  return `
    <form data-form="task" class="form-grid">
      <input type="hidden" name="id" value="${task?.id || ""}">
      ${field("title", "Navn", task?.title || "", "text")}
      ${iconSelect("icon", "Ikon", task?.icon || "⭐", TASK_ICONS)}
      ${field("points", "Stjerner", task?.points || 10, "number")}
      <div class="field">
        <label>Kategori</label>
        <select name="category">
          ${["Morgen", "Etter skole", "Kveld", "Helg", "Bonus"].map((cat) => option(cat, task?.category)).join("")}
        </select>
      </div>
      <div class="field">
        <label>Frekvens</label>
        <select name="frequency">
          ${[["daily", "Daglig"], ["weekly", "Ukentlig"], ["once", "Engangs/bonus"]].map(([value, label]) => `<option value="${value}" ${task?.frequency === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Dager</label>
        <div class="check-row">
          ${taskDayOptions().map(([value, label]) => checkPill("days", value, label, selectedDays.includes(value))).join("")}
        </div>
      </div>
      <div class="field" style="grid-column:1/-1">
        <label>Beskrivelse</label>
        <textarea name="description">${task?.description || ""}</textarea>
      </div>
      <div class="field">
        <label>Barn</label>
        <div class="check-row">${state.children.map((child) => checkPill("assignedChildren", child.id, child.name, task?.assignedChildren?.includes(child.id) ?? true)).join("")}</div>
      </div>
      <div class="field">
        <label>Regler</label>
        <div class="check-row">
          ${checkPill("requiresApproval", "yes", "Krever voksen", task?.requiresApproval || false)}
          ${checkPill("repeatable", "yes", "Repeterbar", task?.repeatable || false)}
          ${checkPill("active", "yes", "Aktiv", task?.active ?? true)}
          ${checkPill("hiddenFromChildren", "yes", "Skjult for barn", task?.hiddenFromChildren || false)}
        </div>
      </div>
      <div class="actions" style="grid-column:1/-1">
        <button class="btn" type="submit">${task ? "Lagre oppgave" : "Legg til oppgave"}</button>
        ${task ? `<button class="btn secondary" type="button" data-action="cancel-edit-task">Avbryt</button>` : ""}
      </div>
    </form>
  `;
}

function adultRewards() {
  const reward = view.editingRewardId ? getReward(view.editingRewardId) : null;
  if (view.creatingReward || reward) {
    return `
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h2>${reward ? "Endre belønning" : "Ny belønning"}</h2>
            <p class="muted">${reward ? "Oppdater belønningen og gå tilbake til listen." : "Lag en belønning barna kan bruke stjerner på."}</p>
          </div>
          <button class="btn secondary" type="button" data-action="cancel-edit-reward">Tilbake</button>
        </div>
        ${rewardForm(reward)}
      </section>
    `;
  }
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Belønninger</h2>
          <p class="muted">${state.rewards.length} totalt</p>
        </div>
        <button class="btn" data-action="new-reward">Ny belønning</button>
      </div>
      <div class="reward-grid">
        ${state.rewards.slice().sort((a, b) => a.cost - b.cost || a.title.localeCompare(b.title, "no")).map((item) => `
          <article class="card">
            <div class="reward-icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <p class="muted">${item.description}</p>
            <div class="pill-row"><span class="pill">${item.cost} ⭐</span><span class="pill">${item.active ? "Aktiv" : "Skjult"}</span></div>
            <button class="btn secondary" data-action="edit-reward" data-id="${item.id}">Endre</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function rewardForm(reward) {
  return `
    <form data-form="reward" class="form-grid">
      <input type="hidden" name="id" value="${reward?.id || ""}">
      ${field("title", "Navn", reward?.title || "", "text")}
      ${iconSelect("icon", "Ikon", reward?.icon || "🎁", REWARD_ICONS)}
      ${field("cost", "Kostnad", reward?.cost || 20, "number")}
      <div class="field">
        <label>Type</label>
        <select name="type">
          ${["Skjermtid", "Ukepenger", "Aktivitet", "Annet"].map((type) => option(type, reward?.type)).join("")}
        </select>
      </div>
      <div class="field" style="grid-column:1/-1">
        <label>Beskrivelse</label>
        <textarea name="description">${reward?.description || ""}</textarea>
      </div>
      <div class="field">
        <label>Barn</label>
        <div class="check-row">${state.children.map((child) => checkPill("assignedChildren", child.id, child.name, reward?.assignedChildren?.includes(child.id) ?? true)).join("")}</div>
      </div>
      <div class="field">
        <label>Status</label>
        <div class="check-row">${checkPill("active", "yes", "Aktiv", reward?.active ?? true)}</div>
      </div>
      <div class="actions" style="grid-column:1/-1">
        <button class="btn" type="submit">${reward ? "Lagre belønning" : "Legg til belønning"}</button>
        ${reward ? `<button class="btn secondary" type="button" data-action="cancel-edit-reward">Avbryt</button>` : ""}
      </div>
    </form>
  `;
}

function adultChildren() {
  const editingChild = view.editingChildId ? getChild(view.editingChildId) : null;
  if (view.creatingChild || editingChild) {
    return `
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h2>${editingChild ? "Endre barn" : "Legg til barn"}</h2>
            <p class="muted">${editingChild ? "Oppdater navn, ikon, farge og om profilen skal være synlig." : "Nye barn legges automatisk til på aktive oppgaver og belønninger."}</p>
          </div>
          <button class="btn secondary" type="button" data-action="cancel-edit-child">Tilbake</button>
        </div>
        ${childForm(editingChild)}
      </section>
    `;
  }
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Barn</h2>
          <p class="muted">${state.children.length} profiler</p>
        </div>
        <button class="btn" data-action="new-child">Legg til barn</button>
      </div>
      <div class="dashboard-grid">
      ${state.children.map((child) => `
        <article class="card">
          <div class="brand">
            <div class="avatar" style="background:${child.color}22">${child.avatar}</div>
            <div><h3>${child.name}</h3><p class="muted">${child.active ? currentLevel(child.lifetimePoints).name : "Skjult profil"}</p></div>
          </div>
          <div class="pill-row">
            <span class="pill">${child.pointsBalance} saldo</span>
            <span class="pill">${child.lifetimePoints} livstid</span>
            <span class="pill">${child.streak} streak</span>
            <span class="pill ${child.active ? "done" : "rejected"}">${child.active ? "Aktiv" : "Inaktiv"}</span>
          </div>
          <div class="actions" style="margin-top:14px">
            <button class="btn secondary" data-action="edit-child" data-child="${child.id}">Endre profil</button>
          </div>
          <form data-form="points" class="form-grid" style="grid-template-columns:1fr;margin-top:14px">
            <input type="hidden" name="childId" value="${child.id}">
            ${field("points", "Juster saldo", 10, "number")}
            ${field("description", "Årsak", "Bonus fra voksen", "text")}
            <div class="actions">
              <button class="btn success" name="direction" value="plus">Gi</button>
              <button class="btn danger" name="direction" value="minus">Trekk</button>
            </div>
          </form>
          <form data-form="lifetime-points" class="form-grid" style="grid-template-columns:1fr;margin-top:14px">
            <input type="hidden" name="childId" value="${child.id}">
            ${field("points", "Juster livstidspoeng", 100, "number")}
            ${field("description", "Årsak", "Test/korreksjon av nivå", "text")}
            <div class="actions">
              <button class="btn secondary" name="direction" value="plus">Øk livstid</button>
              <button class="btn secondary" name="direction" value="minus">Senk livstid</button>
            </div>
          </form>
        </article>
      `).join("")}
      </div>
    </section>
  `;
}

function adultShare() {
  const deviceLink = familyLink();
  const adultInvite = activeInvites("adult")[0];
  const adultLink = adultInvite ? adultInviteLinkFor(adultInvite) : "";
  const ownerReady = familyHasGoogleOwner();
  const readiness = shareReadinessItems(adultInvite);
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Del familie</h2>
          <p class="muted">Send riktig lenke til riktig type enhet eller person.</p>
        </div>
      </div>
      <section class="panel share-ready-panel">
        <div class="section-title compact-title">
          <div>
            <h3>Delingsklar-sjekk</h3>
            <p class="muted">Rask kontroll før du sender lenker videre.</p>
          </div>
        </div>
        <div class="share-checklist">
          ${readiness.map((item) => `
            <div class="share-check ${item.status}">
              <span class="share-check-mark">${item.status === "done" ? "✓" : item.status === "rejected" ? "!" : "…"}</span>
              <span>
                <strong>${escapeText(item.title)}</strong>
                <small>${escapeText(item.description)}</small>
              </span>
            </div>
          `).join("")}
        </div>
      </section>
      <div class="share-grid">
        <article class="panel share-card">
          <div class="share-card-head">
            <div class="share-icon">🏠</div>
            <div>
              <h3>Barn og felles enheter</h3>
              <p class="muted">Bruk denne på barne-iPad, tablet, telefon eller felles skjerm hjemme.</p>
            </div>
          </div>
          <div class="share-link-box">${escapeText(deviceLink)}</div>
          <div class="pill-row">
            <span class="pill">Familiekode: ${escapeText(state.familyCode || "-")}</span>
            <span class="pill">Starter med profilvalg</span>
          </div>
          <div class="actions">
            <button class="btn" data-action="copy-family-link">Kopier lenke</button>
            <button class="btn secondary" data-action="new-family-code">Lag ny familiekode</button>
          </div>
          <p class="small">Denne lenken gir ikke tilgang til voksenpanelet alene. På enheten velger dere profilvelger, et barn eller voksenoversikt som standard.</p>
        </article>

        <article class="panel share-card">
          <div class="share-card-head">
            <div class="share-icon">🔐</div>
            <div>
              <h3>Ny voksen</h3>
              <p class="muted">Bruk denne når en annen voksen skal få tilgang med sin egen Google-konto.</p>
            </div>
          </div>
          ${ownerReady ? `
            <div class="share-link-box">${adultLink ? escapeText(adultLink) : "Ingen aktiv vokseninvitasjon ennå."}</div>
            <div class="pill-row">
              <span class="pill ${adultInvite ? "done" : "pending"}">${adultInvite ? `Voksenkode: ${escapeText(adultInvite.code)}` : "Ingen aktiv kode"}</span>
              <span class="pill">Krever Google-innlogging</span>
              <span class="pill">${adultInvite ? escapeText(inviteExpiryLabel(adultInvite)) : `Gyldig i ${ADULT_INVITE_LIFETIME_DAYS} dager`}</span>
            </div>
            <div class="actions">
              <button class="btn" data-action="copy-adult-invite">Kopier vokseninvitasjon</button>
              <button class="btn secondary" data-action="new-adult-invite">Lag ny vokseninvitasjon</button>
              ${adultInvite ? `<button class="btn danger" data-action="revoke-adult-invite">Deaktiver</button>` : ""}
            </div>
          ` : `
            <div class="auth-status-card pending">
              <div>
                <strong>Google-eier mangler</strong>
                <small>${googleOwnerLabel()}</small>
              </div>
              <button class="btn secondary" type="button" data-action="google-owner-login">Logg inn med Google</button>
            </div>
          `}
          <p class="small">Vokseninvitasjonen er separat fra familiekoden. Den som åpner lenken må logge inn med Google før voksenrollen legges til.</p>
        </article>
      </div>

      <section class="panel share-status-panel">
        <div class="section-title compact-title">
          <div>
            <h3>Status for deling</h3>
            <p class="muted">Dette er nyttig å sjekke før du sender lenker videre.</p>
          </div>
        </div>
        <div class="share-status-grid">
          <div><strong>Familie</strong><span>${escapeText(state.familyName || "-")}</span></div>
          <div><strong>Familie-id</strong><span>${escapeText(state.familyId || "-")}</span></div>
          <div><strong>Sky-sti</strong><span>${escapeText(cloudPathLabel())}</span></div>
          <div><strong>Google-eier</strong><span>${escapeText(googleOwnerLabel())}</span></div>
          <div><strong>Voksne</strong><span>${activeAdultUsers().length}</span></div>
          <div><strong>Enhetskode</strong><span>${escapeText(state.familyCode || "-")}</span></div>
        </div>
      </section>
    </section>
  `;
}

function shareReadinessItems(adultInvite) {
  const hasChildren = activeChildren().length > 0;
  const cloudOk = cloud.ready && !cloud.pendingSave && !cloud.error;
  const cloudPending = cloud.ready && cloud.pendingSave;
  const familyCodeOk = Boolean(state.familyCode);
  return [
    {
      title: "Google-eier",
      description: familyHasGoogleOwner() ? googleOwnerLabel() : "Logg inn med Google før familien deles med andre voksne.",
      status: familyHasGoogleOwner() ? "done" : "rejected"
    },
    {
      title: "Sky-synk",
      description: cloudOk ? cloudStatusLabel() : cloudPending ? "Venter på lagring til sky." : cloud.error || "Sky-synk er ikke klar ennå.",
      status: cloudOk ? "done" : cloudPending ? "pending" : "rejected"
    },
    {
      title: "Familiekode",
      description: familyCodeOk ? `Klar for barn og felles enheter: ${state.familyCode}` : "Mangler familiekode.",
      status: familyCodeOk ? "done" : "rejected"
    },
    {
      title: "Barneprofiler",
      description: hasChildren ? `${activeChildren().length} aktive barn kan kobles til.` : "Legg til minst ett barn før appen deles til barneenheter.",
      status: hasChildren ? "done" : "rejected"
    },
    {
      title: "Vokseninvitasjon",
      description: adultInvite ? inviteExpiryLabel(adultInvite) : "Valgfritt. Lag en vokseninvitasjon når en annen voksen skal få tilgang.",
      status: adultInvite ? "done" : "pending"
    }
  ];
}

function childForm(child) {
  const nextIndex = state.children.length;
  const avatar = child?.avatar || AVATAR_ICONS[nextIndex % AVATAR_ICONS.length];
  const color = child?.color || CHILD_COLORS[nextIndex % CHILD_COLORS.length];
  return `
    <form data-form="child" class="form-grid">
      <input type="hidden" name="id" value="${child?.id || ""}">
      ${field("name", "Navn", child?.name || "", "text")}
      ${iconSelect("avatar", "Ikon", avatar, AVATAR_ICONS)}
      <div class="field">
        <label>Farge</label>
        <input name="color" type="color" value="${escapeAttr(color)}" required>
      </div>
      <div class="field">
        <label>Status</label>
        <div class="check-row">${checkPill("active", "yes", "Synlig profil", child?.active ?? true)}</div>
      </div>
      <div class="actions" style="grid-column:1/-1">
        <button class="btn" type="submit">${child ? "Lagre barn" : "Legg til barn"}</button>
        ${child ? `<button class="btn secondary" type="button" data-action="cancel-edit-child">Avbryt</button>` : ""}
      </div>
    </form>
  `;
}

function adultHistory() {
  return `
    <section>
      <div class="section-title"><h2>Historikk</h2><span class="small">${state.history.length} hendelser</span></div>
      ${historyList(state.history, false)}
    </section>
  `;
}

function adultSettings() {
  if (view.settingsPage === "family") return settingsFamily();
  if (view.settingsPage === "devices") return settingsDevices();
  if (view.settingsPage === "security") return settingsSecurity();
  if (view.settingsPage === "backup") return settingsBackup();
  if (view.settingsPage === "starter") return settingsStarterPackages();
  if (view.settingsPage === "levels") return settingsLevels();
  if (view.settingsPage === "cloud") return settingsCloud();
  if (view.settingsPage === "reset") return settingsReset();
  return settingsMenu();
}

function settingsBackButton() {
  return `<button class="btn secondary" data-action="settings-page" data-page="menu">Tilbake</button>`;
}

function settingsMenu() {
  const items = [
    ["family", "Familie og voksne", "Navn, Google-eier og voksne"],
    ["devices", "Denne enheten", "Velg hva appen åpner med her"],
    ["security", "PIN og sikkerhet", "Endre voksen-PIN"],
    ["backup", "Backup og flytting", "Eksporter, importer og flytt data"],
    ["starter", "Startpakker", "Legg inn standard oppgaver og belønninger"],
    ["levels", "Nivåer", "Navn og grenser for livstidsstjerner"],
    ["cloud", "App, sky og diagnose", "Miljø, Firebase, synk og feilsøking"],
    ["reset", "Nullstilling", "Start helt på nytt"]
  ];
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Innstillinger</h2>
          <p class="muted">Velg området du vil endre.</p>
        </div>
      </div>
      <div class="settings-menu">
        ${items.map(([page, title, description]) => `
          <button class="settings-tile" data-action="settings-page" data-page="${page}">
            <span>
              <strong>${title}</strong>
              <small>${description}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function settingsFamily() {
  const adults = activeAdultUsers();
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Familie</h2>
          <p class="muted">Navn, intern id og voksne i familien.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <form data-form="family-settings" class="form-grid" style="margin-top:18px">
        ${field("familyName", "Familienavn", state.familyName || "", "text")}
        <div class="field">
          <label>Intern familie-id</label>
          <input name="familyId" type="text" value="${escapeAttr(state.familyId || "local-family")}" required>
        </div>
        <div class="field">
          <label>Familiekode</label>
          <input name="familyCode" type="text" value="${escapeAttr(state.familyCode || "")}" readonly>
          <small>Familiekode og invitasjonslenker styres fra fanen Deling.</small>
        </div>
        <div class="actions" style="align-self:end">
          <button class="btn" type="submit">Lagre familie</button>
        </div>
      </form>
      <div class="setup-block">
        <h3>Google-eier og voksne</h3>
        <div class="auth-status-card ${familyHasGoogleOwner() ? "ready" : "pending"}">
          <div>
            <strong>${familyHasGoogleOwner() ? "Familien har Google-eier" : "Legg til Google-eier før deling"}</strong>
            <small>${googleOwnerLabel()}</small>
          </div>
          <button class="btn secondary" type="button" data-action="google-owner-login">${familyHasGoogleOwner() ? "Logg inn / bytt konto" : "Logg inn med Google"}</button>
        </div>
        <div class="adult-user-list">
          ${adults.length ? adults.map((user) => `
            <div class="adult-user">
              <span>${escapeText(user.name || user.email || "Google-bruker")}</span>
              <small>${escapeText(user.email || "")} · ${user.role === "owner" ? "Eier" : "Voksen"}</small>
            </div>
          `).join("") : `<p class="small">Ingen voksne er lagt til ennå.</p>`}
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn secondary" type="button" data-action="adult-tab" data-tab="share">Åpne Deling</button>
        </div>
      </div>
      <p class="small">Datamodell: versjon ${state.schemaVersion || SCHEMA_VERSION}. Voksne: ${state.adultUsers?.length || 0}. Enheter: ${state.familyDevices?.length || 0}. Invitasjoner: ${state.inviteCodes?.length || 0}.</p>
    </section>
  `;
}

function settingsDevices() {
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Denne enheten</h2>
          <p class="muted">Velg hva appen åpner med på akkurat denne skjermen.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="pill-row">
        <span class="pill">Standard: ${deviceProfileLabel()}</span>
      </div>
      <div class="setup-options" style="margin-top:14px">
        <button class="settings-tile" data-action="set-device-home">
          <span>
            <strong>Profilvalg</strong>
            <small>Best for felles iPad eller skjerm i stua.</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
        <button class="settings-tile" data-action="set-device-adult">
          <span>
            <strong>Voksenoversikt</strong>
            <small>Best for en voksen sin telefon eller PC.</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
        ${activeChildren().map((child) => `
          <button class="settings-tile" data-action="set-device-child" data-child="${child.id}">
            <span>
              <strong>${child.avatar} ${escapeText(child.name)}</strong>
              <small>Åpner rett i denne barneprofilen.</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        `).join("")}
      </div>
      <p class="small">Lenker, familiekode og vokseninvitasjoner ligger nå samlet i fanen Deling.</p>
    </section>
  `;
}

function settingsSecurity() {
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>PIN og sikkerhet</h2>
          <p class="muted">Endre voksen-PIN for denne familien.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <form data-form="pin-change" class="form-grid" style="margin-top:18px">
        <div class="field">
          <label>Nåværende PIN</label>
          <input name="currentPin" type="password" inputmode="numeric" autocomplete="current-password" required>
        </div>
        <div class="field">
          <label>Ny PIN</label>
          <input name="newPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" required>
        </div>
        <div class="field">
          <label>Gjenta ny PIN</label>
          <input name="repeatPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" required>
        </div>
        <div class="actions" style="align-self:end">
          <button class="btn" type="submit">Endre PIN</button>
        </div>
      </form>
    </section>
  `;
}

function settingsBackup() {
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Backup og flytting</h2>
          <p class="muted">Eksporter før du flytter appen til nytt miljø.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="export-data">Eksporter data</button>
        <button class="btn secondary" data-action="choose-import">Importer data</button>
      </div>
      <input class="visually-hidden" id="import-file" type="file" accept="application/json,.json" data-import-file>
      <p class="small">Import erstatter dataene på denne enheten. Ta alltid eksport først.</p>
    </section>
  `;
}

function settingsStarterPackages() {
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Startpakker</h2>
          <p class="muted">Legg inn standard oppgaver og belønninger.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="dashboard-grid starter-grid">
        ${STARTER_PACKAGES.map((pack) => `
          <article class="card starter-card">
            <h3>${pack.title}</h3>
            <p class="muted">${pack.description}</p>
            <div class="pill-row">
              ${pack.tasks ? `<span class="pill">${pack.tasks.length} oppgaver</span>` : ""}
              ${pack.rewards ? `<span class="pill">${pack.rewards.length} belønninger</span>` : ""}
            </div>
            <button class="btn secondary" data-action="apply-starter" data-id="${pack.id}">Legg inn pakke</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function settingsLevels() {
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Nivåer</h2>
          <p class="muted">Endre navn og krav for hvert nivå.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <form data-form="levels" class="level-editor">
        ${getLevels().map((level, index) => `
          <div class="level-row">
            <div class="field">
              <label>Nivå ${index + 1}</label>
              <input name="levelName" type="text" value="${escapeAttr(level.name)}" required>
            </div>
            <div class="field">
              <label>Krever livstidspoeng</label>
              <input name="levelMin" type="number" min="0" value="${level.min}" required>
            </div>
          </div>
        `).join("")}
        <div class="actions">
          <button class="btn" type="submit">Lagre nivåer</button>
          <button class="btn secondary" type="button" data-action="reset-levels">Tilbakestill nivåer</button>
        </div>
      </form>
    </section>
  `;
}

function settingsCloud() {
  const diagnosis = syncDiagnosisText();
  const migrationTarget = suggestedCloudFamilyId();
  const canMigrate = cloud.ready && familyHasGoogleOwner() && cloudFamilyId() !== migrationTarget;
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>App, sky og diagnose</h2>
          <p class="muted">Miljø, Firebase, synk og feilsøking.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="pill-row">
        <span class="pill ${cloud.ready ? "done" : cloud.error ? "rejected" : "pending"}">${cloudStatusLabel()}</span>
        <span class="pill">${environmentLabel()}</span>
      </div>
      <p class="small">Firebase-prosjekt: ${escapeText(firebaseProjectLabel())}</p>
      <p class="small">Sky-sti: ${escapeText(cloudPathLabel())}</p>
      <p class="small">Anbefalt familie-sti: ${escapeText(cloudPathLabel(migrationTarget))}</p>
      ${state.cloudMigration?.migratedAt ? `<p class="small">Sist flyttet: ${formatDate(state.cloudMigration.migratedAt)} fra ${escapeText(state.cloudMigration.from)} til ${escapeText(state.cloudMigration.to)}</p>` : ""}
      ${state.cloudMigration?.status === "failed" ? `<p class="small">Siste flytting feilet: ${escapeText(state.cloudMigration.error || "ukjent feil")}</p>` : ""}
      ${state.cloudMigration?.status === "started" ? `<p class="small">Flytting startet: ${formatDate(state.cloudMigration.attemptedAt)}</p>` : ""}
      ${cloud.lastSavedAt ? `<p class="small">Sist lagret til sky: ${formatDate(cloud.lastSavedAt)}</p>` : ""}
      ${cloud.lastFetchedAt ? `<p class="small">Sist hentet fra sky: ${formatDate(cloud.lastFetchedAt)}</p>` : ""}
      ${state.syncDiagnostics?.lastTestAt ? `<p class="small">Siste synk-test: ${formatDate(state.syncDiagnostics.lastTestAt)} fra ${escapeText(state.syncDiagnostics.lastTestDevice || "ukjent enhet")}</p>` : ""}
      ${cloud.error ? `<p class="small">Sky-feil: ${escapeText(cloud.error)}</p>` : ""}
      <div class="diagnosis-box">
        <pre>${escapeText(diagnosis)}</pre>
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="force-cloud-save">Lagre til sky nå</button>
        <button class="btn secondary" data-action="migrate-cloud-family" ${canMigrate ? "" : "disabled"}>Flytt til familie-sti</button>
        <button class="btn secondary" data-action="test-cloud-sync">Test sky-synk</button>
        <button class="btn secondary" data-action="copy-diagnosis">Kopier diagnose</button>
        <button class="btn secondary" data-action="refresh-app">Oppdater app</button>
      </div>
    </section>
  `;
}

function settingsReset() {
  return `
    <section class="panel danger-zone">
      <div class="section-title compact-title">
        <div>
          <h2>Nullstilling</h2>
          <p class="muted">Starter denne enheten på nytt uten å slette familien i skyen.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="setup-note">
        Dette fjerner lokal familieprofil, standardprofil og mellomlagrede data på denne enheten. Andre enheter i familien og familiens Firestore-data blir ikke slettet.
      </div>
      <form data-form="start-over-local" class="form-grid" style="margin-top:18px">
        <div class="field">
          <label>Voksen-PIN</label>
          <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required>
          <small>PIN kreves for å starte førstegangsoppsettet på nytt.</small>
        </div>
        <div class="actions" style="align-self:end">
          <button class="btn warning" type="submit">Start på nytt på denne enheten</button>
        </div>
      </form>
    </section>
  `;
}

function historyList(items, compact) {
  if (!items.length) return `<div class="empty">Ingen historikk ennå.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Dato</th>${compact ? "" : "<th>Barn</th>"}<th>Hendelse</th><th>Stjerner</th></tr></thead>
        <tbody>
          ${items.slice().reverse().map((item) => `
            <tr>
              <td>${formatDate(item.createdAt)}</td>
              ${compact ? "" : `<td>${getChild(item.childId)?.name || "-"}</td>`}
              <td>${item.description}</td>
              <td>${item.pointsChange > 0 ? "+" : ""}${item.pointsChange}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function field(name, label, value, type) {
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${escapeAttr(value)}" required></div>`;
}

function iconSelect(name, label, current, icons) {
  const allIcons = icons.includes(current) ? icons : [current, ...icons];
  return `
    <div class="field">
      <label>${label}</label>
      <select name="${name}">
        ${allIcons.map((icon) => `<option value="${escapeAttr(icon)}" ${icon === current ? "selected" : ""}>${icon}</option>`).join("")}
      </select>
    </div>
  `;
}

function option(value, current) {
  return `<option value="${value}" ${value === current ? "selected" : ""}>${value}</option>`;
}

function checkPill(name, value, label, checked) {
  return `<label class="check-pill"><input type="checkbox" name="${name}" value="${value}" ${checked ? "checked" : ""}>${label}</label>`;
}

function taskDayOptions() {
  return [
    ["all", "Alle dager"],
    ["monday", "Mandag"],
    ["tuesday", "Tirsdag"],
    ["wednesday", "Onsdag"],
    ["thursday", "Torsdag"],
    ["friday", "Fredag"],
    ["saturday", "Lørdag"],
    ["sunday", "Søndag"]
  ];
}

function selectedTaskDays(task) {
  const days = task?.days?.length ? task.days : ["all"];
  if (days.includes("all")) return ["all"];
  const expanded = new Set(days);
  if (days.includes("weekdays")) {
    ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach((day) => expanded.add(day));
    expanded.delete("weekdays");
  }
  if (days.includes("weekend")) {
    ["saturday", "sunday"].forEach((day) => expanded.add(day));
    expanded.delete("weekend");
  }
  return taskDayOptions().map(([value]) => value).filter((value) => expanded.has(value));
}

function normalizeTaskDays(days) {
  const selected = days.filter(Boolean);
  if (!selected.length || selected.includes("all")) return ["all"];
  const valid = new Set(taskDayOptions().map(([value]) => value));
  return selected.filter((day) => valid.has(day) && day !== "all");
}

function completeTask(childId, taskId) {
  const task = getTask(taskId);
  const existing = findCompletion(task, childId);
  if (existing && !task.repeatable) return showToast("Oppdraget er allerede registrert.");

  const completion = {
    id: crypto.randomUUID(),
    kind: "task",
    taskId,
    childId,
    date: dateKey(),
    weekId: weekId(),
    status: task.requiresApproval ? "pending" : "completed",
    pointsAwarded: task.requiresApproval ? 0 : task.points,
    requiresApproval: task.requiresApproval,
    completedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    reversedAt: null
  };
  state.completions.push(completion);
  if (task.requiresApproval) {
    addHistory(childId, "Oppgave sendt til godkjenning", `${task.title} venter på voksen`, 0);
    showToast("Sendt til voksen for godkjenning.");
  } else {
    const result = awardPoints(childId, task.points, `Fullført: ${task.title}`, completion.id, "task");
    celebrateTaskResult(task.points, result);
  }
  saveState();
  render();
}

function approveTask(id) {
  const completion = state.completions.find((item) => item.id === id);
  if (!completion || completion.status !== "pending") return;
  const task = getTask(completion.taskId);
  completion.status = "approved";
  completion.approvedAt = new Date().toISOString();
  completion.pointsAwarded = task.points;
  awardPoints(completion.childId, task.points, `Godkjent: ${task.title}`, id, "task");
  saveState();
  showToast("Oppgave godkjent.");
  render();
}

function rejectTask(id) {
  const completion = state.completions.find((item) => item.id === id);
  if (!completion || completion.status !== "pending") return;
  const task = getTask(completion.taskId);
  completion.status = "rejected";
  completion.rejectedAt = new Date().toISOString();
  addHistory(completion.childId, "Oppgave avvist", `Avvist: ${task.title}`, 0);
  saveState();
  showToast("Oppgave avvist.");
  render();
}

function undoTaskCompletion(completionId) {
  const completion = state.completions.find((item) => item.id === completionId);
  if (!completion || !["completed", "approved", "pending"].includes(completion.status)) return;

  const task = getTask(completion.taskId);
  const child = getChild(completion.childId);
  const pointsToReverse = completion.pointsAwarded || 0;

  completion.status = "reversed";
  completion.reversedAt = new Date().toISOString();

  if (pointsToReverse > 0) {
    child.pointsBalance -= pointsToReverse;
    child.lifetimePoints = Math.max(0, child.lifetimePoints - pointsToReverse);
    const transaction = {
      id: crypto.randomUUID(),
      childId: completion.childId,
      type: "undo",
      sourceId: completion.id,
      description: `Angret: ${task.title}`,
      pointsChange: -pointsToReverse,
      balanceAfter: child.pointsBalance,
      createdAt: new Date().toISOString(),
      createdBy: completion.childId
    };
    state.transactions.push(transaction);
    addHistory(completion.childId, "Angret oppgave", `Angret: ${task.title}`, -pointsToReverse, transaction.createdAt);
  } else {
    addHistory(completion.childId, "Angret oppgave", `Angret: ${task.title}`, 0);
  }

  saveState();
  showToast("Oppgaven er angret.");
  render();
}

function requestReward(childId, rewardId) {
  const child = getChild(childId);
  const reward = getReward(rewardId);
  if (child.pointsBalance < reward.cost) return showToast("Ikke nok stjerner ennå.");
  state.redemptions.push({
    id: crypto.randomUUID(),
    kind: "reward",
    rewardId,
    childId,
    cost: reward.cost,
    status: "pending",
    requestedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null
  });
  addHistory(childId, "Belønning forespurt", `${reward.title} venter på voksen`, 0);
  saveState();
  showToast("Belønningen er sendt til voksen.");
  render();
}

function approveReward(id) {
  const redemption = state.redemptions.find((item) => item.id === id);
  if (!redemption || redemption.status !== "pending") return;
  const child = getChild(redemption.childId);
  const reward = getReward(redemption.rewardId);
  if (child.pointsBalance < redemption.cost) return showToast("Barnet har ikke nok stjerner lenger.");
  redemption.status = "approved";
  redemption.approvedAt = new Date().toISOString();
  awardPoints(redemption.childId, -redemption.cost, `Belønning: ${reward.title}`, id, "reward");
  awardBadges(redemption.childId);
  saveState();
  showToast("Belønning godkjent.");
  render();
}

function rejectReward(id) {
  const redemption = state.redemptions.find((item) => item.id === id);
  if (!redemption || redemption.status !== "pending") return;
  const reward = getReward(redemption.rewardId);
  redemption.status = "rejected";
  redemption.rejectedAt = new Date().toISOString();
  addHistory(redemption.childId, "Belønning avvist", `Avvist: ${reward.title}`, 0);
  saveState();
  showToast("Belønning avvist.");
  render();
}

function fulfillReward(id) {
  const redemption = state.redemptions.find((item) => item.id === id);
  if (!redemption || redemption.status !== "approved") return;
  const reward = getReward(redemption.rewardId);
  redemption.status = "fulfilled";
  redemption.fulfilledAt = new Date().toISOString();
  addHistory(redemption.childId, "Belønning gjennomført", `Gjennomført: ${reward.title}`, 0);
  saveState();
  showToast("Belønningen er markert gjennomført.");
  render();
}

function refundReward(id) {
  const redemption = state.redemptions.find((item) => item.id === id);
  if (!redemption || !["pending", "approved"].includes(redemption.status)) return;
  const reward = getReward(redemption.rewardId);

  if (redemption.status === "approved") {
    refundPoints(redemption.childId, redemption.cost, `Refundert: ${reward.title}`, id);
  } else {
    addHistory(redemption.childId, "Belønning refundert", `Avbrutt: ${reward.title}`, 0);
  }

  redemption.status = "refunded";
  redemption.refundedAt = new Date().toISOString();
  saveState();
  showToast("Belønningen er refundert.");
  render();
}

function hideChildReward(id) {
  const redemption = state.redemptions.find((item) => item.id === id);
  if (!redemption) return;
  redemption.hiddenFromChild = true;
  redemption.hiddenFromChildAt = new Date().toISOString();
  saveState();
  showToast("Belønningen er fjernet fra listen.");
  render();
}

async function refreshApp() {
  showToast("Oppdaterer appen ...");
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) await registration.update();
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("familieoppdrag-")).map((key) => caches.delete(key)));
    }
  } finally {
    window.setTimeout(() => window.location.reload(), 500);
  }
}

function awardPoints(childId, amount, description, sourceId = null, type = "manual") {
  const child = getChild(childId);
  const previousLevelNumber = currentLevelIndex(child.lifetimePoints);
  child.pointsBalance += amount;
  if (amount > 0) child.lifetimePoints += amount;
  const newLevelNumber = currentLevelIndex(child.lifetimePoints);
  const transaction = {
    id: crypto.randomUUID(),
    childId,
    type,
    sourceId,
    description,
    pointsChange: amount,
    balanceAfter: child.pointsBalance,
    createdAt: new Date().toISOString(),
    createdBy: view.adultUnlocked ? "adult" : childId
  };
  state.transactions.push(transaction);
  addHistory(childId, "Poeng", description, amount, transaction.createdAt);
  const newBadges = amount > 0 ? awardBadges(childId, transaction.createdAt) : [];
  return {
    transaction,
    levelUp: amount > 0 && newLevelNumber > previousLevelNumber,
    level: currentLevel(child.lifetimePoints),
    levelNumber: newLevelNumber,
    badges: newBadges
  };
}

function refundPoints(childId, amount, description, sourceId = null) {
  const child = getChild(childId);
  child.pointsBalance += amount;
  const transaction = {
    id: crypto.randomUUID(),
    childId,
    type: "refund",
    sourceId,
    description,
    pointsChange: amount,
    balanceAfter: child.pointsBalance,
    createdAt: new Date().toISOString(),
    createdBy: view.adultUnlocked ? "adult" : childId
  };
  state.transactions.push(transaction);
  addHistory(childId, "Belønning refundert", description, amount, transaction.createdAt);
}

function addHistory(childId, type, description, pointsChange, createdAt = new Date().toISOString()) {
  state.history.push({
    id: crypto.randomUUID(),
    childId,
    type,
    description,
    pointsChange,
    createdAt
  });
}

function saveTask(form) {
  const data = new FormData(form);
  const id = data.get("id") || `task-${crypto.randomUUID()}`;
  const current = state.tasks.find((item) => item.id === id);
  const task = {
    id,
    title: data.get("title").trim(),
    description: data.get("description").trim(),
    icon: data.get("icon").trim() || "⭐",
    points: Number(data.get("points")),
    category: data.get("category"),
    frequency: data.get("frequency"),
    days: normalizeTaskDays(data.getAll("days")),
    assignedChildren: data.getAll("assignedChildren"),
    requiresApproval: data.get("requiresApproval") === "yes",
    repeatable: data.get("repeatable") === "yes",
    active: data.get("active") === "yes",
    hiddenFromChildren: data.get("hiddenFromChildren") === "yes",
    sortOrder: current?.sortOrder || state.tasks.length + 1,
    createdAt: current?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!task.assignedChildren.length) task.assignedChildren = activeChildIds();
  if (current) Object.assign(current, task);
  else state.tasks.push(task);
  view.editingTaskId = null;
  view.creatingTask = false;
  saveState();
  showToast("Oppgaven er lagret.");
  render();
}

function saveReward(form) {
  const data = new FormData(form);
  const id = data.get("id") || `reward-${crypto.randomUUID()}`;
  const current = state.rewards.find((item) => item.id === id);
  const reward = {
    id,
    title: data.get("title").trim(),
    description: data.get("description").trim(),
    icon: data.get("icon").trim() || "🎁",
    cost: Number(data.get("cost")),
    type: data.get("type"),
    assignedChildren: data.getAll("assignedChildren"),
    active: data.get("active") === "yes",
    createdAt: current?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!reward.assignedChildren.length) reward.assignedChildren = activeChildIds();
  if (current) Object.assign(current, reward);
  else state.rewards.push(reward);
  view.editingRewardId = null;
  view.creatingReward = false;
  saveState();
  showToast("Belønningen er lagret.");
  render();
}

function collectSetupDraft() {
  ensureSetupDraft();
  const form = app.querySelector('[data-form="first-setup"]');
  if (!form) return view.setupDraft;
  const data = new FormData(form);
  if (data.has("familyName")) view.setupDraft.familyName = String(data.get("familyName") || "").trim();
  if (data.has("childCount")) view.setupDraft.childCount = Number(data.get("childCount")) || 1;
  const childNames = data.getAll("childName").map((name) => String(name).trim());
  if (childNames.length) {
    view.setupDraft.childNames = [...childNames, ...view.setupDraft.childNames.slice(childNames.length)].slice(0, 5);
  }
  if (app.querySelector('[name="starterPackage"]')) {
    view.setupDraft.starterPackages = data.getAll("starterPackage");
  }
  if (data.has("pin")) view.setupDraft.pin = String(data.get("pin") || "");
  if (data.has("repeatPin")) view.setupDraft.repeatPin = String(data.get("repeatPin") || "");
  return view.setupDraft;
}

function validateSetupStep(stepId) {
  const draft = collectSetupDraft();
  if (isSetupPreview()) return true;
  if (stepId === "google" && !familyHasGoogleOwner()) {
    showToast("Logg inn med Google før du går videre.");
    return false;
  }
  if (stepId === "family" && !draft.familyName) {
    showToast("Familien må ha et navn.");
    return false;
  }
  if (stepId === "children") {
    const requiredNames = draft.childNames.slice(0, Number(draft.childCount) || 1).filter(Boolean);
    if (!requiredNames.length || requiredNames.length < Number(draft.childCount)) {
      showToast("Legg inn navn på alle barna.");
      return false;
    }
  }
  if (stepId === "pin") {
    if (draft.pin.length < 4) {
      showToast("PIN må ha minst 4 tegn.");
      return false;
    }
    if (draft.pin !== draft.repeatPin) {
      showToast("PIN-kodene er ikke like.");
      return false;
    }
  }
  return true;
}

function setupNext() {
  const steps = setupSteps();
  const current = steps[view.setupStep || 0];
  if (!validateSetupStep(current.id)) return;
  view.setupStep = Math.min((view.setupStep || 0) + 1, steps.length - 1);
  render();
}

function setupBack() {
  collectSetupDraft();
  view.setupStep = Math.max((view.setupStep || 0) - 1, 0);
  render();
}

async function completeFirstSetup(form) {
  const draft = collectSetupDraft();
  if (isSetupPreview()) {
    view.setupStep = 0;
    view.setupDraft = null;
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    window.history.replaceState({}, "", url);
    showToast("Forhåndsvisning avsluttet. Ingenting ble lagret.");
    render();
    return;
  }
  const familyName = draft.familyName;
  const pin = draft.pin;
  const repeatPin = draft.repeatPin;
  const childNames = draft.childNames.slice(0, Number(draft.childCount) || 1).map((name) => String(name).trim()).filter(Boolean);

  if (!familyName) return showToast("Familien må ha et navn.");
  if (!familyHasGoogleOwner()) return showToast("Logg inn med Google før du starter familien.");
  if (pin.length < 4) return showToast("PIN må ha minst 4 tegn.");
  if (pin !== repeatPin) return showToast("PIN-kodene er ikke like.");
  if (!childNames.length) return showToast("Legg inn minst ett barn.");

  const now = new Date().toISOString();
  const ownerUid = state.ownerUid;
  const adultUsers = activeAdultUsers();
  state = normalizeLocalState({
    familyId: uniqueFamilyId(familyName),
    familyName,
    familyCode: createFamilyCode(),
    schemaVersion: SCHEMA_VERSION,
    setupCompleted: true,
    ownerUid,
    adultUsers,
    familyDevices: [],
    inviteCodes: [],
    parentPinHash: await hashPin(pin),
    children: childNames.map((name, index) => ({
      id: uniqueChildIdForList(name, childNames.slice(0, index)),
      name,
      avatar: AVATAR_ICONS[index % AVATAR_ICONS.length],
      color: CHILD_COLORS[index % CHILD_COLORS.length],
      pointsBalance: 0,
      lifetimePoints: 0,
      streak: 0,
      active: true
    })),
    tasks: [],
    completions: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    history: [],
    badges: [],
    levels: DEFAULT_LEVELS,
    createdAt: now,
    updatedAt: now
  }, true);

  draft.starterPackages.forEach((packageId) => {
    addStarterPackage(packageId, activeChildIds());
  });

  view.mode = "adult";
  view.childId = null;
  view.childTab = "tasks";
  view.adultTab = "share";
  view.adultUnlocked = true;
  view.setupStep = 0;
  view.setupDraft = null;
  queueScrollTop();
  localStorage.setItem(DEVICE_PROFILE_KEY, "home");
  saveState();
  showToast("Familien er satt opp. Deling er klar.");
  render();
}

function saveFamilySettings(form) {
  const data = new FormData(form);
  const familyName = String(data.get("familyName") || "").trim();
  const familyId = slugify(data.get("familyId") || "") || "local-family";
  if (!familyName) return showToast("Familien må ha et navn.");
  const previousFamilyId = state.familyId;
  state.familyName = familyName;
  state.familyId = familyId;
  state.familyCode = state.familyCode || createFamilyCode();
  state.setupCompleted = true;
  saveState();
  if (previousFamilyId !== familyId) {
    showToast("Familie-id er lagret. Sky-stien er oppdatert.");
  } else {
    showToast("Familieinnstillinger er lagret.");
  }
  render();
}

function exportState() {
  const payload = {
    exportedAt: new Date().toISOString(),
    appName: APP_CONFIG.appName,
    appVersion: APP_VERSION,
    environment: APP_CONFIG.environment,
    firebaseProjectId: APP_CONFIG.cloudSync.firebase?.projectId || null,
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `familieoppdrag-${state.familyId || "backup"}-${dateKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importStateFile(file) {
  if (!file) return;
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const importedState = parsed.state || parsed;
    const normalized = normalizeLocalState(importedState, true);
    const familyName = normalized.familyName || normalized.familyId || "ukjent familie";
    const ok = confirm(`Vil du importere backup for ${familyName}? Dette erstatter dataene som ligger på denne enheten.`);
    if (!ok) return;
    state = normalized;
    view.mode = "home";
    view.childId = null;
    view.childTab = "tasks";
    view.adultTab = "overview";
    view.editingTaskId = null;
    view.editingRewardId = null;
    view.editingChildId = null;
    view.creatingTask = false;
    view.creatingReward = false;
    view.creatingChild = false;
    view.gate = null;
    localStorage.setItem(DEVICE_PROFILE_KEY, "home");
    saveState();
    showToast("Backup er importert.");
    render();
  } catch (error) {
    console.warn("Import failed:", error);
    showToast("Kunne ikke importere filen.");
  }
}

function saveChild(form) {
  const data = new FormData(form);
  const current = getChild(data.get("id"));
  const name = String(data.get("name") || "").trim();
  if (!name) return showToast("Barnet må ha et navn.");

  if (current) {
    current.name = name;
    current.avatar = data.get("avatar") || current.avatar;
    current.color = data.get("color") || current.color;
    current.active = data.get("active") === "yes";
    if (!current.active && view.childId === current.id) {
      view.mode = "home";
      view.childId = null;
    }
    showToast("Barnet er oppdatert.");
  } else {
    const child = {
      id: uniqueChildId(name),
      name,
      avatar: data.get("avatar") || AVATAR_ICONS[state.children.length % AVATAR_ICONS.length],
      color: data.get("color") || CHILD_COLORS[state.children.length % CHILD_COLORS.length],
      pointsBalance: 0,
      lifetimePoints: 0,
      streak: 0,
      active: data.get("active") === "yes"
    };
    state.children.push(child);
    assignChildToExistingItems(child.id);
    showToast(`${child.name} er lagt til.`);
  }

  view.editingChildId = null;
  view.creatingChild = false;
  saveState();
  render();
}

function assignChildToExistingItems(childId) {
  state.tasks.forEach((task) => {
    if (task.active && !task.assignedChildren.includes(childId)) task.assignedChildren.push(childId);
  });
  state.rewards.forEach((reward) => {
    if (reward.active && !reward.assignedChildren.includes(childId)) reward.assignedChildren.push(childId);
  });
}

function uniqueChildId(name) {
  const base = slugify(name) || `barn-${state.children.length + 1}`;
  let id = base;
  let counter = 2;
  while (getChild(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function uniqueChildIdForList(name, previousNames) {
  const previousIds = new Set(previousNames.map((item) => slugify(item)).filter(Boolean));
  const base = slugify(name) || "barn";
  let id = base;
  let counter = 2;
  while (previousIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function uniqueFamilyId(name) {
  return `family-${slugify(name) || crypto.randomUUID().slice(0, 8)}`;
}

function createFamilyCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function familyCodeFromSeed(seed) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let hash = 0;
  String(seed).split("").forEach((char) => {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  });
  return Array.from({ length: 8 }, (_, index) => alphabet[(hash + index * 17) % alphabet.length]).join("");
}

function normalizeFamilyCode(code) {
  return String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function applyStarterPackage(packageId) {
  const childIds = activeChildIds();
  if (!childIds.length) return showToast("Legg til minst ett aktivt barn først.");
  const { addedTasks, addedRewards } = addStarterPackage(packageId, childIds);

  if (!addedTasks && !addedRewards) {
    showToast("Alt i denne pakken finnes allerede.");
    return;
  }
  saveState();
  showToast(`La til ${addedTasks} oppgaver og ${addedRewards} belønninger.`);
  render();
}

function addStarterPackage(packageId, childIds) {
  const pack = STARTER_PACKAGES.find((item) => item.id === packageId);
  if (!pack) return { addedTasks: 0, addedRewards: 0 };
  let addedTasks = 0;
  let addedRewards = 0;

  (pack.tasks || []).forEach((template) => {
    const exists = state.tasks.some((task) => sameText(task.title, template[0]) && task.category === template[4]);
    if (exists) return;
    state.tasks.push(taskFromTemplate(template, childIds));
    addedTasks += 1;
  });

  (pack.rewards || []).forEach((template) => {
    const exists = state.rewards.some((reward) => sameText(reward.title, template[0]) && reward.type === template[4]);
    if (exists) return;
    state.rewards.push(rewardFromTemplate(template, childIds));
    addedRewards += 1;
  });

  return { addedTasks, addedRewards };
}

function taskFromTemplate(template, assignedChildren) {
  return {
    id: `task-${crypto.randomUUID()}`,
    title: template[0],
    description: template[1],
    icon: template[2],
    points: template[3],
    category: template[4],
    frequency: template[5],
    days: template[6],
    assignedChildren: [...assignedChildren],
    requiresApproval: template[7],
    repeatable: template[5] === "once",
    active: true,
    sortOrder: state.tasks.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function rewardFromTemplate(template, assignedChildren) {
  return {
    id: `reward-${crypto.randomUUID()}`,
    title: template[0],
    description: template[1],
    icon: template[2],
    cost: template[3],
    type: template[4],
    assignedChildren: [...assignedChildren],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function childPeriodTasks(childId, frequency) {
  return state.tasks
    .filter((task) => task.active && !task.hiddenFromChildren && task.frequency === frequency && task.assignedChildren.includes(childId) && taskMatchesToday(task))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((task) => {
      const completion = findCompletion(task, childId);
      return { task, completion, status: completion?.status || "not-started" };
    });
}

function taskStatusText(task) {
  return [
    task.active ? "Aktiv" : "Deaktivert",
    task.hiddenFromChildren ? "<span class=\"small\">Skjult for barn</span>" : "",
    task.requiresApproval ? "<span class=\"small\">Krever voksen</span>" : ""
  ].filter(Boolean).join("<br>");
}

function findCompletion(task, childId) {
  return state.completions
    .slice()
    .reverse()
    .find((completion) => {
      if (completion.taskId !== task.id || completion.childId !== childId) return false;
      if (completion.status === "rejected" || completion.status === "reversed") return false;
      if (task.repeatable && task.frequency === "weekly") return completion.weekId === weekId();
      if (task.repeatable && task.frequency === "once") return completion.date === dateKey();
      if (task.repeatable) return completion.date === dateKey();
      if (task.frequency === "weekly") return completion.weekId === weekId();
      if (task.frequency === "once") return ["pending", "completed", "approved"].includes(completion.status);
      return completion.date === dateKey();
    });
}

function taskMatchesToday(task) {
  const day = new Date().getDay();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  if (task.days.includes("all")) return true;
  if (task.days.includes("weekdays") && day >= 1 && day <= 5) return true;
  if (task.days.includes("weekend") && (day === 0 || day === 6)) return true;
  return task.days.includes(dayNames[day]);
}

function childStats(childId) {
  const child = getChild(childId);
  const daily = childPeriodTasks(childId, "daily");
  const weekly = childPeriodTasks(childId, "weekly");
  const isDone = (item) => ["completed", "approved"].includes(item.status);
  return {
    dailyTotal: daily.length,
    dailyDone: daily.filter(isDone).length,
    weeklyTotal: weekly.length,
    weeklyDone: weekly.filter(isDone).length,
    level: currentLevel(child.lifetimePoints),
    levelNumber: currentLevelIndex(child.lifetimePoints)
  };
}

function pendingApprovals() {
  return [
    ...state.completions.filter((item) => item.status === "pending").map((item) => ({ ...item, kind: "task" })),
    ...state.redemptions.filter((item) => item.status === "pending").map((item) => ({ ...item, kind: "reward" }))
  ].sort((a, b) => new Date(a.completedAt || a.requestedAt) - new Date(b.completedAt || b.requestedAt));
}

function approvedRewardRedemptions(childId = null) {
  return state.redemptions
    .filter((item) => item.status === "approved" && (!childId || item.childId === childId))
    .sort((a, b) => new Date(a.approvedAt || a.requestedAt) - new Date(b.approvedAt || b.requestedAt));
}

function completedRewardRedemptions(childId) {
  return state.redemptions
    .filter((item) => ["fulfilled", "approved", "rejected", "refunded"].includes(item.status) && item.childId === childId && !item.hiddenFromChild)
    .sort((a, b) => new Date(b.fulfilledAt || b.refundedAt || b.approvedAt || b.rejectedAt || b.requestedAt) - new Date(a.fulfilledAt || a.refundedAt || a.approvedAt || a.rejectedAt || a.requestedAt));
}

function currentLevel(points) {
  const levels = getLevels();
  return levels.slice().reverse().find((level) => points >= level.min) || levels[0];
}

function currentLevelIndex(points) {
  const levels = getLevels();
  return levels.findIndex((level, index) => points >= level.min && (!levels[index + 1] || points < levels[index + 1].min)) + 1;
}

function nextLevelProgress(points) {
  const levels = getLevels();
  const currentIndex = Math.max(0, currentLevelIndex(points) - 1);
  const current = levels[Math.max(0, currentIndex)] || levels[0];
  const next = levels[currentIndex + 1] || null;
  if (!next) {
    return {
      current,
      next: null,
      currentNumber: currentIndex + 1,
      nextNumber: null,
      percent: 100,
      earnedInLevel: Math.max(0, points - current.min),
      neededInLevel: 0,
      missing: 0,
      totalPoints: points
    };
  }
  const neededInLevel = Math.max(1, next.min - current.min);
  const earnedInLevel = Math.min(neededInLevel, Math.max(0, points - current.min));
  return {
    current,
    next,
    currentNumber: currentIndex + 1,
    nextNumber: currentIndex + 2,
    percent: Math.round((earnedInLevel / neededInLevel) * 100),
    earnedInLevel,
    neededInLevel,
    missing: Math.max(0, next.min - points),
    totalPoints: points
  };
}

function levelProgressCard(child, variant = "compact") {
  const progress = nextLevelProgress(child.lifetimePoints);
  const isMaxLevel = !progress.next;
  const title = variant === "compact" ? "Neste nivå" : "Nivåfremdrift";
  const cardClass = variant === "compact" ? "level-card compact" : "card level-card";
  return `
    <article class="${cardClass}">
      <div class="level-card-head">
        <div>
          <p class="eyebrow">Nivå ${progress.currentNumber}</p>
          <h2>${progress.current.name}</h2>
        </div>
        <span class="level-badge">${child.avatar}</span>
      </div>
      <div class="level-next-row">
        <span>${title}</span>
        <strong>${isMaxLevel ? "Toppnivå!" : `Nivå ${progress.nextNumber}: ${progress.next.name}`}</strong>
      </div>
      <div class="progress level-progress" aria-label="${progress.percent}% mot neste nivå">
        <span style="width:${progress.percent}%"></span>
      </div>
      <p class="muted">
        ${isMaxLevel
          ? `${child.lifetimePoints} livstidsstjerner. Du er på høyeste nivå nå.`
          : `${child.lifetimePoints} av ${progress.next.min} livstidsstjerner. Du mangler ${progress.missing} stjerner.`}
      </p>
    </article>
  `;
}

function getLevels() {
  return (state.levels?.length ? state.levels : DEFAULT_LEVELS)
    .map((level) => ({ min: Number(level.min) || 0, name: level.name || "Nivå" }))
    .sort((a, b) => a.min - b.min);
}

function earnedBadges(childId) {
  return (state.badges || [])
    .filter((item) => item.childId === childId)
    .sort((a, b) => new Date(a.awardedAt) - new Date(b.awardedAt));
}

function awardBadges(childId, awardedAt = new Date().toISOString()) {
  if (!state.badges) state.badges = [];
  const childBadges = new Set(state.badges.filter((item) => item.childId === childId).map((item) => item.badgeId));
  const newBadges = BADGE_DEFINITIONS
    .filter((badge) => !childBadges.has(badge.id) && badge.isEarned(childId))
    .map((badge) => ({
      id: crypto.randomUUID(),
      childId,
      badgeId: badge.id,
      awardedAt
    }));
  state.badges.push(...newBadges);
  newBadges.forEach((badge) => {
    const definition = BADGE_DEFINITIONS.find((item) => item.id === badge.badgeId);
    addHistory(childId, "Merke", `Fikk merke: ${definition.icon} ${definition.name}`, 0, badge.awardedAt);
  });
  return newBadges;
}

function completedTaskCount(childId) {
  return state.completions.filter((item) => item.childId === childId && ["completed", "approved"].includes(item.status)).length;
}

function completedBonusCount(childId) {
  return state.completions.filter((item) => {
    if (item.childId !== childId || !["completed", "approved"].includes(item.status)) return false;
    const task = getTask(item.taskId);
    return task?.category === "Bonus" || task?.frequency === "once";
  }).length;
}

function categoryCompleteToday(childId, category) {
  const tasks = childPeriodTasks(childId, "daily").filter((item) => item.task.category === category);
  return tasks.length > 0 && tasks.every((item) => ["completed", "approved"].includes(item.status));
}

function activeChildren() {
  return state.children.filter((child) => child.active !== false);
}

function activeChildIds() {
  return activeChildren().map((child) => child.id);
}

function getChild(id) {
  return state.children.find((child) => child.id === id);
}

function getTask(id) {
  return state.tasks.find((task) => task.id === id);
}

function getReward(id) {
  return state.rewards.find((reward) => reward.id === id);
}

function statusLabel(status) {
  return {
    "not-started": "Ikke startet",
    pending: "Venter",
    completed: "Fullført",
    approved: "Godkjent",
    rejected: "Avvist",
    reversed: "Angret"
  }[status] || status;
}

function rewardStatusLabel(status) {
  return {
    pending: "Venter",
    approved: "Godkjent",
    fulfilled: "Gjennomført",
    rejected: "Avvist",
    refunded: "Refundert"
  }[status] || status;
}

function rewardStatusText(redemption) {
  if (redemption.status === "fulfilled") return `Gjennomført ${formatDate(redemption.fulfilledAt)}.`;
  if (redemption.status === "approved") return `Godkjent ${formatDate(redemption.approvedAt)}. Venter på gjennomføring.`;
  if (redemption.status === "rejected") return `Avvist ${formatDate(redemption.rejectedAt)}.`;
  if (redemption.status === "refunded") return `Refundert ${formatDate(redemption.refundedAt)}.`;
  return `Forespurt ${formatDate(redemption.requestedAt)}.`;
}

function frequencyLabel(frequency) {
  return { daily: "Daglig", weekly: "Ukentlig", once: "Bonus" }[frequency] || frequency;
}

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function weekId(date = new Date()) {
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("no-NO", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function addDays(value, days) {
  const date = new Date(value || Date.now());
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function hashPin(pin) {
  const encoded = new TextEncoder().encode(pin);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function deviceProfileLabel() {
  const profile = localStorage.getItem(DEVICE_PROFILE_KEY);
  if (!profile || profile === "home") return "Profilvalg";
  if (profile === "adult") return "Voksen/familieoversikt";
  if (profile.startsWith("child:")) return getChild(profile.replace("child:", ""))?.name || "Ukjent";
  return "Profilvalg";
}

function cloudStatusLabel() {
  if (!cloud.enabled) return "Lokal lagring";
  if (cloud.ready && cloud.pendingSave) return "Lagrer til sky ...";
  if (cloud.ready) return `Synker med ${cloudFamilyId()}`;
  if (cloud.error) return "Lokal fallback";
  return cloud.status;
}

function cloudStatusClass() {
  if (cloud.ready && !cloud.pendingSave) return "done";
  if (cloud.error) return "rejected";
  return "pending";
}

function cloudPathLabel(familyId = cloudFamilyId()) {
  const config = APP_CONFIG.cloudSync;
  return `${config.stateCollection}/${familyId}/${config.stateSubcollection}/${config.stateDocument}`;
}

function cloudFamilyId() {
  if (!state.setupCompleted && !pendingFamilyCode()) {
    return state.cloudFamilyId || state.familyId || "local-family";
  }
  return state.cloudFamilyId || APP_CONFIG.cloudSync.pinnedFamilyId || state.familyId || "local-family";
}

function suggestedCloudFamilyId() {
  const current = state.familyId || "";
  const pinned = APP_CONFIG.cloudSync.pinnedFamilyId || "";
  if (current && current !== "local-family" && current !== pinned) return current;
  const owner = familyOwner();
  const seed = owner?.name || owner?.email?.split("@")[0] || state.familyName || "familie";
  return slugify(`familie-${seed}`) || "familie";
}

function environmentLabel() {
  return `${APP_CONFIG.environmentLabel || APP_CONFIG.environment || "Ukjent"} (${APP_CONFIG.environment || "local"})`;
}

function firebaseProjectLabel() {
  if (!APP_CONFIG.cloudSync.enabled) return "Av";
  return APP_CONFIG.cloudSync.firebase?.projectId || "Ikke satt";
}

function activeAdultUsers() {
  return (state.adultUsers || []).filter((user) => user.status !== "removed");
}

function activeInvites(type) {
  const now = Date.now();
  return (state.inviteCodes || []).filter((invite) => {
    if (invite.type !== type || invite.status !== "active") return false;
    if (!invite.expiresAt) return true;
    return new Date(invite.expiresAt).getTime() > now;
  });
}

function adultInviteExpiresAt(createdAt = new Date().toISOString()) {
  return addDays(createdAt, ADULT_INVITE_LIFETIME_DAYS);
}

function inviteExpiryLabel(invite) {
  if (!invite?.expiresAt) return "Utløper ikke";
  const expires = new Date(invite.expiresAt).getTime();
  if (!Number.isFinite(expires)) return "Ukjent utløp";
  if (expires <= Date.now()) return `Utløpt ${formatDate(invite.expiresAt)}`;
  return `Utløper ${formatDate(invite.expiresAt)}`;
}

function findActiveInvite(code, type) {
  const normalizedCode = normalizeFamilyCode(code);
  return activeInvites(type).find((invite) => normalizeFamilyCode(invite.code) === normalizedCode) || null;
}

function familyOwner() {
  return activeAdultUsers().find((user) => user.role === "owner") || null;
}

function familyHasGoogleOwner() {
  return Boolean(state.ownerUid && familyOwner());
}

function googleOwnerLabel() {
  const owner = familyOwner();
  if (owner) return owner.email || owner.name || "Google-konto er koblet";
  if (cloud.authUser && !cloud.authUser.isAnonymous) return `${cloud.authUser.email || cloud.authUser.name || "Google-konto"} er innlogget`;
  return "Logg inn med Google for å gjøre en voksen til eier.";
}

function normalizeAuthUser(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    photoURL: user.photoURL || "",
    isAnonymous: Boolean(user.isAnonymous)
  };
}

function registerGoogleAdult(user, role = "owner") {
  if (!user || user.isAnonymous) return false;
  const now = new Date().toISOString();
  state.ownerUid = state.ownerUid || user.uid;
  if (!Array.isArray(state.adultUsers)) state.adultUsers = [];
  const existing = state.adultUsers.find((adult) => adult.uid === user.uid);
  const adultRole = role === "owner" || !familyOwner() ? "owner" : "adult";
  if (existing) {
    existing.email = user.email || existing.email || "";
    existing.name = user.displayName || existing.name || "";
    existing.photoURL = user.photoURL || existing.photoURL || "";
    existing.provider = "google";
    existing.status = "active";
    existing.role = existing.role || adultRole;
    existing.lastLoginAt = now;
  } else {
    state.adultUsers.push({
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      provider: "google",
      role: adultRole,
      status: "active",
      addedAt: now,
      lastLoginAt: now
    });
  }
  if (adultRole === "owner") state.ownerUid = user.uid;
  return true;
}

async function signInGoogleOwner() {
  if (!cloud.auth || !cloud.GoogleAuthProvider || !cloud.signInWithPopup) {
    showToast("Google-innlogging er ikke klar ennå.");
    return;
  }
  try {
    const provider = new cloud.GoogleAuthProvider();
    provider.setCustomParameters?.({ prompt: "select_account" });
    const result = await cloud.signInWithPopup(cloud.auth, provider);
    cloud.authUser = normalizeAuthUser(result.user);
    registerGoogleAdult(result.user, "owner");
    saveState();
    showToast("Google-eier er koblet til familien.");
    render();
  } catch (error) {
    const code = error?.code || "";
    const shouldTryRedirect = code.includes("popup-blocked") || code.includes("operation-not-supported") || code.includes("web-storage");
    if (cloud.signInWithRedirect && shouldTryRedirect) {
      const provider = new cloud.GoogleAuthProvider();
      await cloud.signInWithRedirect(cloud.auth, provider);
      return;
    }
    cloud.error = error?.message || "Kunne ikke logge inn med Google";
    showToast("Google-innlogging feilet.");
    render();
  }
}

async function acceptAdultInvite() {
  const inviteCode = pendingAdultInviteCode();
  const invite = findActiveInvite(inviteCode, "adult");
  if (!invite) {
    showToast("Vokseninvitasjonen er ikke gyldig.");
    return;
  }
  if (!cloud.auth || !cloud.GoogleAuthProvider || !cloud.signInWithPopup) {
    showToast("Google-innlogging er ikke klar ennå.");
    return;
  }
  try {
    const provider = new cloud.GoogleAuthProvider();
    provider.setCustomParameters?.({ prompt: "select_account" });
    const result = await cloud.signInWithPopup(cloud.auth, provider);
    cloud.authUser = normalizeAuthUser(result.user);
    registerGoogleAdult(result.user, "adult");
    invite.status = "used";
    invite.usedByUid = result.user.uid;
    invite.usedAt = new Date().toISOString();
    saveState();
    clearPendingFamilyCode();
    view.mode = "adult";
    view.adultUnlocked = true;
    view.adultTab = "overview";
    showToast("Voksen er lagt til familien.");
    render();
  } catch (error) {
    cloud.error = error?.message || "Kunne ikke godta vokseninvitasjon";
    showToast("Google-innlogging feilet.");
    render();
  }
}

function syncDiagnosisText() {
  return [
    `App: ${APP_CONFIG.appName}`,
    `Versjon: ${APP_VERSION}`,
    `Miljø: ${environmentLabel()}`,
    `Firebase-prosjekt: ${firebaseProjectLabel()}`,
    `Sky aktiv: ${cloud.enabled ? "ja" : "nei"}`,
    `Sky klar: ${cloud.ready ? "ja" : "nei"}`,
    `Venter på sky-lagring: ${cloud.pendingSave ? "ja" : "nei"}`,
    `Sky-status: ${cloudStatusLabel()}`,
    `Sky-sti: ${cloudPathLabel()}`,
    `Familiekode-oppslag: ${cloud.familyCodeLookupStatus || "ikke brukt"}`,
    `Familiekode-oppslagsfeil: ${cloud.familyCodeLookupError || "ingen"}`,
    `Anbefalt familie-sti: ${cloudPathLabel(suggestedCloudFamilyId())}`,
    `Sky-familie-id: ${cloudFamilyId()}`,
    `Migrert sky-sti: ${state.cloudMigration?.migratedAt ? `${state.cloudMigration.from} -> ${state.cloudMigration.to}` : "nei"}`,
    `Migreringsstatus: ${state.cloudMigration?.status || "ikke startet"}`,
    `Migreringsfeil: ${state.cloudMigration?.error || "ingen"}`,
    `Sist lagret til sky: ${cloud.lastSavedAt ? formatDate(cloud.lastSavedAt) : "aldri i denne økten"}`,
    `Sist hentet fra sky: ${cloud.lastFetchedAt ? formatDate(cloud.lastFetchedAt) : "aldri i denne økten"}`,
    `Siste synk-test: ${state.syncDiagnostics?.lastTestAt ? formatDate(state.syncDiagnostics.lastTestAt) : "ingen"}`,
    `Synk-test enhet: ${state.syncDiagnostics?.lastTestDevice || "-"}`,
    `Sky-feil: ${cloud.error || "ingen"}`,
    `Google-bruker: ${cloud.authUser?.isAnonymous ? "anonym" : cloud.authUser?.email || "ikke innlogget"}`,
    `Google-eier: ${googleOwnerLabel()}`,
    `Voksne: ${activeAdultUsers().length}`,
    `Aktive vokseninvitasjoner: ${activeInvites("adult").length}`,
    `Familie-id: ${state.familyId || "-"}`,
    `Familiekode: ${state.familyCode || "-"}`,
    `Datamodell: ${state.schemaVersion || SCHEMA_VERSION}`,
    `Barn: ${state.children?.length || 0}`,
    `Oppgaver: ${state.tasks?.length || 0}`,
    `Fullføringer: ${state.completions?.length || 0}`,
    `Sist oppdatert: ${state.updatedAt ? formatDate(state.updatedAt) : "-"}`
  ].join("\n");
}

async function copyDiagnosis() {
  const text = syncDiagnosisText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Diagnose kopiert.");
  } catch {
    prompt("Kopier diagnose:", text);
  }
}

function runCloudSyncTest() {
  state.syncDiagnostics = {
    lastTestAt: new Date().toISOString(),
    lastTestDevice: deviceProfileLabel(),
    appVersion: APP_VERSION
  };
  saveState();
  flushCloudSave();
  showToast("Synk-test sendt til sky.");
  render();
}

async function migrateCloudFamilyPath() {
  if (!cloud.ready || !cloud.setDoc || !cloud.doc) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  if (!familyHasGoogleOwner()) {
    showToast("Koble Google-eier før du flytter sky-stien.");
    return;
  }
  const fromFamilyId = cloudFamilyId();
  const toFamilyId = suggestedCloudFamilyId();
  if (fromFamilyId === toFamilyId) {
    showToast("Familien bruker allerede anbefalt sky-sti.");
    return;
  }
  const ok = confirm(`Vil du kopiere familiedata fra ${cloudPathLabel(fromFamilyId)} til ${cloudPathLabel(toFamilyId)}? Gammel sti beholdes som fallback.`);
  if (!ok) return;

  const now = new Date().toISOString();
  state.cloudMigration = {
    from: fromFamilyId,
    to: toFamilyId,
    status: "started",
    attemptedAt: now,
    migratedAt: "",
    error: "",
    appVersion: APP_VERSION
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const migratedState = normalizeLocalState({
    ...state,
    familyId: toFamilyId,
    cloudFamilyId: toFamilyId,
    cloudMigration: {
      from: fromFamilyId,
      to: toFamilyId,
      status: "completed",
      attemptedAt: now,
      migratedAt: now,
      error: "",
      appVersion: APP_VERSION
    },
    updatedAt: now
  }, true);

  try {
    cloud.applyingRemote = true;
    const targetDocRef = cloudDocRefForFamily(toFamilyId);
    await cloud.setDoc(targetDocRef, {
      familyId: toFamilyId,
      familyName: migratedState.familyName || "",
      migratedFrom: fromFamilyId,
      state: migratedState,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    const sourceDocRef = cloudDocRefForFamily(fromFamilyId);
    await cloud.setDoc(sourceDocRef, {
      familyId: fromFamilyId,
      familyName: migratedState.familyName || "",
      migratedTo: toFamilyId,
      state: migratedState,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    state = migratedState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setCloudDocRef(toFamilyId);
    cloud.applyingRemote = false;
    subscribeCloudState();
    cloud.pendingSave = false;
    cloud.lastSavedAt = now;
    cloud.error = "";
    showToast("Familien er flyttet til ny sky-sti.");
    render();
  } catch (error) {
    cloud.applyingRemote = false;
    const message = error?.message || "Kunne ikke flytte sky-stien";
    cloud.error = message;
    state.cloudMigration = {
      from: fromFamilyId,
      to: toFamilyId,
      status: "failed",
      attemptedAt: now,
      migratedAt: "",
      error: message,
      appVersion: APP_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    queueCloudSave();
    showToast("Flytting til ny sky-sti feilet.");
    render();
  }
}

function setDeviceProfile(profile) {
  localStorage.setItem(DEVICE_PROFILE_KEY, profile);
  showToast("Standardprofil er lagret for denne enheten.");
}

function queueScrollTop() {
  view.scrollTopPending = true;
}

function scrollToTopIfNeeded() {
  if (!view.scrollTopPending) return;
  view.scrollTopPending = false;
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function pendingFamilyCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("familiekode") || params.get("join") || "";
}

function isSetupPreview() {
  const params = new URLSearchParams(window.location.search);
  return params.get("preview") === "setup";
}

function pendingAdultInviteCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("voksenkode") || params.get("adultInvite") || "";
}

function clearPendingFamilyCode() {
  const url = new URL(window.location.href);
  url.searchParams.delete("familiekode");
  url.searchParams.delete("join");
  url.searchParams.delete("voksenkode");
  url.searchParams.delete("adultInvite");
  window.history.replaceState({}, "", url);
}

function familyLink() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("familiekode", state.familyCode || "");
  return url.toString();
}

function adultInviteLink() {
  const invite = ensureAdultInvite();
  return adultInviteLinkFor(invite);
}

function adultInviteLinkFor(invite) {
  const url = new URL(familyLink());
  url.searchParams.set("voksenkode", invite?.code || "");
  return url.toString();
}

function ensureAdultInvite() {
  if (!Array.isArray(state.inviteCodes)) state.inviteCodes = [];
  const existing = activeInvites("adult")[0];
  if (existing) {
    if (!existing.expiresAt) {
      existing.expiresAt = adultInviteExpiresAt(existing.createdAt);
      saveState();
    }
    return existing;
  }
  const createdAt = new Date().toISOString();
  const invite = {
    id: crypto.randomUUID(),
    code: createFamilyCode(),
    type: "adult",
    status: "active",
    createdAt,
    expiresAt: adultInviteExpiresAt(createdAt),
    usedByUid: null,
    usedAt: null
  };
  state.inviteCodes.push(invite);
  saveState();
  return invite;
}

async function copyFamilyLink() {
  const link = familyLink();
  try {
    await navigator.clipboard.writeText(link);
    showToast("Koblingslenke kopiert.");
  } catch {
    prompt("Kopier koblingslenken:", link);
  }
}

async function copyAdultInviteLink() {
  const link = adultInviteLink();
  try {
    await navigator.clipboard.writeText(link);
    showToast("Vokseninvitasjon kopiert.");
  } catch {
    prompt("Kopier vokseninvitasjon:", link);
  }
}

function createNewAdultInvite() {
  if (!Array.isArray(state.inviteCodes)) state.inviteCodes = [];
  state.inviteCodes = state.inviteCodes.map((invite) =>
    invite.type === "adult" && invite.status === "active" ? { ...invite, status: "revoked" } : invite
  );
  const createdAt = new Date().toISOString();
  state.inviteCodes.push({
    id: crypto.randomUUID(),
    code: createFamilyCode(),
    type: "adult",
    status: "active",
    createdAt,
    expiresAt: adultInviteExpiresAt(createdAt),
    usedByUid: null,
    usedAt: null
  });
  saveState();
  showToast("Ny vokseninvitasjon er laget.");
  render();
}

function revokeAdultInvite() {
  if (!Array.isArray(state.inviteCodes)) state.inviteCodes = [];
  state.inviteCodes = state.inviteCodes.map((invite) =>
    invite.type === "adult" && invite.status === "active" ? { ...invite, status: "revoked" } : invite
  );
  saveState();
  showToast("Vokseninvitasjonen er deaktivert.");
  render();
}

async function startOverLocal(form) {
  const data = new FormData(form);
  const hash = await hashPin(data.get("pin"));
  if (hash !== state.parentPinHash) {
    showToast("Feil PIN.");
    return;
  }
  const ok = confirm("Vil du starte på nytt på denne enheten? Familien i skyen slettes ikke, men lokal appdata på denne enheten fjernes.");
  if (!ok) return;

  window.clearTimeout(cloud.saveTimer);
  cloud.pendingSave = false;
  cloud.applyingRemote = false;
  if (cloud.unsubscribe) {
    cloud.unsubscribe();
    cloud.unsubscribe = null;
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DEVICE_PROFILE_KEY);
  if ("caches" in window) {
    await caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {});
  }

  state = loadState();
  view.mode = "home";
  view.childId = null;
  view.childTab = "tasks";
  view.adultTab = "overview";
  view.adultUnlocked = false;
  view.editingTaskId = null;
  view.editingRewardId = null;
  view.editingChildId = null;
  view.settingsPage = "menu";
  view.creatingTask = false;
  view.creatingReward = false;
  view.creatingChild = false;
  view.setupStep = 0;
  view.setupDraft = null;
  view.avatarPickerChildId = null;
  view.gate = null;
  queueScrollTop();
  showToast("Denne enheten er klar for nytt oppsett.");
  render();
}

function connectDevice(profile) {
  if (!profile) return;
  if (profile.startsWith("child:")) {
    const childId = profile.replace("child:", "");
    if (!getChild(childId)?.active) return showToast("Barnet er ikke aktivt.");
  }
  setDeviceProfile(profile);
  clearPendingFamilyCode();
  if (profile === "adult") {
    view.mode = "adult";
    view.childId = null;
  } else if (profile.startsWith("child:")) {
    view.mode = "child";
    view.childId = profile.replace("child:", "");
  } else {
    view.mode = "home";
    view.childId = null;
  }
  render();
}

function requiresPinForHome() {
  const profile = localStorage.getItem(DEVICE_PROFILE_KEY);
  return view.mode === "child" && profile === `child:${view.childId}` && !view.adultUnlocked;
}

function goHome() {
  if (requiresPinForHome()) {
    view.gate = { type: "home", returnMode: view.mode, returnChildId: view.childId };
    render();
    return;
  }
  view.mode = "home";
  view.childId = null;
  render();
}

function rememberCurrentView() {
  previousView = {
    mode: view.mode,
    childId: view.childId,
    childTab: view.childTab
  };
}

function restorePreviousView() {
  view.mode = previousView.mode || "home";
  view.childId = previousView.childId || null;
  view.childTab = previousView.childTab || "tasks";
  view.gate = null;
  render();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function celebrate(points) {
  showToast(`Bra jobbet! Du fikk ${points} stjerner.`);
  if (navigator.vibrate) navigator.vibrate(60);
  const layer = document.createElement("div");
  layer.className = "confetti";
  layer.innerHTML = Array.from({ length: 18 }, (_, index) => `<span style="left:${Math.random() * 100}%;animation-delay:${index * 20}ms">⭐</span>`).join("");
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 1200);
}

function celebrateTaskResult(points, result = {}) {
  if (result.levelUp) {
    celebrateLevelUp(result.levelNumber, result.level.name);
    return;
  }
  if (result.badges?.length) {
    const badge = BADGE_DEFINITIONS.find((item) => item.id === result.badges[0].badgeId);
    celebrateBadge(badge);
    return;
  }
  celebrate(points);
}

function celebrateLevelUp(levelNumber, levelName) {
  showToast(`Nytt nivå! Nivå ${levelNumber}: ${levelName}`);
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  const layer = document.createElement("div");
  layer.className = "confetti level-confetti";
  layer.innerHTML = Array.from({ length: 28 }, (_, index) => `<span style="left:${Math.random() * 100}%;animation-delay:${index * 18}ms">🏆</span>`).join("");
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 1500);
}

function celebrateBadge(badge) {
  if (!badge) return celebrate(0);
  showToast(`Nytt merke: ${badge.icon} ${badge.name}`);
  if (navigator.vibrate) navigator.vibrate(70);
  const layer = document.createElement("div");
  layer.className = "confetti badge-confetti";
  layer.innerHTML = Array.from({ length: 22 }, (_, index) => `<span style="left:${Math.random() * 100}%;animation-delay:${index * 20}ms">${badge.icon}</span>`).join("");
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 1300);
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function escapeText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sameText(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, child, task, reward, id, tab } = button.dataset;
  const scrollActions = new Set([
    "home",
    "setup-next",
    "setup-back",
    "cancel-connect",
    "connect-device",
    "cancel-gate",
    "open-child",
    "adult-login",
    "cancel-adult-login",
    "lock-adult",
    "child-tab",
    "adult-tab",
    "new-task",
    "edit-task",
    "cancel-edit-task",
    "new-reward",
    "edit-reward",
    "cancel-edit-reward",
    "new-child",
    "edit-child",
    "cancel-edit-child",
    "settings-page",
    "set-device-child",
    "set-device-adult",
    "set-device-home"
  ]);
  if (scrollActions.has(action)) queueScrollTop();

  if (action === "home") {
    goHome();
  }
  if (action === "setup-next") {
    setupNext();
  }
  if (action === "setup-back") {
    setupBack();
  }
  if (action === "cancel-connect") {
    clearPendingFamilyCode();
    render();
  }
  if (action === "connect-device") {
    connectDevice(button.dataset.profile);
  }
  if (action === "accept-adult-invite") {
    acceptAdultInvite();
  }
  if (action === "cancel-gate") {
    view.gate = null;
    render();
  }
  if (action === "open-child") {
    if (getChild(child)?.active === false) return;
    view.mode = "child";
    view.childId = child;
    view.childTab = "tasks";
    render();
  }
  if (action === "adult-login") {
    rememberCurrentView();
    view.mode = "adult";
    render();
  }
  if (action === "cancel-adult-login") {
    restorePreviousView();
  }
  if (action === "lock-adult") {
    view.adultUnlocked = false;
    render();
  }
  if (action === "child-tab") {
    view.childTab = tab;
    render();
  }
  if (action === "open-avatar-picker") {
    view.avatarPickerChildId = child;
    render();
  }
  if (action === "close-avatar-picker") {
    view.avatarPickerChildId = null;
    render();
  }
  if (action === "choose-avatar") {
    changeChildAvatar(child, button.dataset.avatar);
  }
  if (action === "adult-tab") {
    view.adultTab = tab;
    view.editingTaskId = null;
    view.creatingTask = false;
    view.editingRewardId = null;
    view.editingChildId = null;
    view.creatingReward = false;
    view.creatingChild = false;
    view.settingsPage = "menu";
    render();
  }
  if (action === "complete-task") completeTask(child, task);
  if (action === "undo-task") undoTaskCompletion(button.dataset.completion);
  if (action === "request-reward") requestReward(child, reward);
  if (action === "approve-task") approveTask(id);
  if (action === "reject-task") rejectTask(id);
  if (action === "approve-reward") approveReward(id);
  if (action === "reject-reward") rejectReward(id);
  if (action === "fulfill-reward") fulfillReward(id);
  if (action === "refund-reward" && confirm("Vil du refundere denne belønningen?")) refundReward(id);
  if (action === "hide-child-reward" && confirm("Er du sikker på at du vil fjerne denne belønningen fra listen?")) hideChildReward(id);
  if (action === "new-task") {
    view.creatingTask = true;
    view.editingTaskId = null;
    render();
  }
  if (action === "edit-task") {
    view.editingTaskId = id;
    view.creatingTask = false;
    render();
  }
  if (action === "cancel-edit-task") {
    view.editingTaskId = null;
    view.creatingTask = false;
    render();
  }
  if (action === "new-reward") {
    view.creatingReward = true;
    view.editingRewardId = null;
    render();
  }
  if (action === "edit-reward") {
    view.editingRewardId = id;
    view.creatingReward = false;
    render();
  }
  if (action === "cancel-edit-reward") {
    view.editingRewardId = null;
    view.creatingReward = false;
    render();
  }
  if (action === "new-child") {
    view.creatingChild = true;
    view.editingChildId = null;
    render();
  }
  if (action === "edit-child") {
    view.editingChildId = child;
    view.creatingChild = false;
    render();
  }
  if (action === "cancel-edit-child") {
    view.editingChildId = null;
    view.creatingChild = false;
    render();
  }
  if (action === "apply-starter" && confirm("Vil du legge inn denne startpakken? Eksisterende oppgaver og belønninger blir ikke slettet.")) {
    applyStarterPackage(id);
  }
  if (action === "set-device-child") {
    setDeviceProfile(`child:${child}`);
    render();
  }
  if (action === "set-device-adult") {
    setDeviceProfile("adult");
    render();
  }
  if (action === "set-device-home") {
    setDeviceProfile("home");
    render();
  }
  if (action === "refresh-app") {
    refreshApp();
  }
  if (action === "google-owner-login") {
    signInGoogleOwner();
  }
  if (action === "force-cloud-save") {
    cloud.pendingSave = true;
    flushCloudSave();
  }
  if (action === "migrate-cloud-family") {
    migrateCloudFamilyPath();
  }
  if (action === "test-cloud-sync") {
    runCloudSyncTest();
  }
  if (action === "copy-diagnosis") {
    copyDiagnosis();
  }
  if (action === "choose-import") {
    app.querySelector("[data-import-file]")?.click();
  }
  if (action === "settings-page") {
    view.settingsPage = button.dataset.page || "menu";
    render();
  }
  if (action === "copy-family-link") {
    copyFamilyLink();
  }
  if (action === "copy-adult-invite") {
    copyAdultInviteLink();
  }
  if (action === "new-adult-invite" && confirm("Vil du lage en ny vokseninvitasjon? Gamle vokseninvitasjoner blir deaktivert.")) {
    createNewAdultInvite();
  }
  if (action === "revoke-adult-invite" && confirm("Vil du deaktivere aktiv vokseninvitasjon? Lenken slutter å gi voksen-tilgang.")) {
    revokeAdultInvite();
  }
  if (action === "new-family-code" && confirm("Vil du lage en ny familiekode? Gamle koblingslenker vil slutte å passe.")) {
    state.familyCode = createFamilyCode();
    state.inviteCodes = (state.inviteCodes || []).map((invite) =>
      invite.type === "device" ? { ...invite, status: "revoked" } : invite
    );
    saveState();
    showToast("Ny familiekode er laget.");
    render();
  }
  if (action === "reset-levels" && confirm("Vil du tilbakestille nivåene til standardoppsettet?")) {
    state.levels = DEFAULT_LEVELS;
    saveState();
    showToast("Nivåer er tilbakestilt.");
    render();
  }
  if (action === "export-data") {
    exportState();
  }
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-import-file]")) {
    importStateFile(event.target.files?.[0]);
    event.target.value = "";
    return;
  }
  const filter = event.target.dataset.filter;
  if (!filter) return;
  if (filter === "task-search") view.taskFilters.search = event.target.value;
  if (filter === "task-category") view.taskFilters.category = event.target.value;
  if (filter === "task-child") view.taskFilters.child = event.target.value;
  if (filter === "task-status") view.taskFilters.status = event.target.value;
  render();
});

function changeChildAvatar(childId, avatar) {
  const child = getChild(childId);
  if (!child || !AVATAR_ICONS.includes(avatar)) return;
  child.avatar = avatar;
  view.avatarPickerChildId = null;
  saveState();
  showToast("Ikonet er oppdatert.");
  render();
}

app.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === "pin") {
    const hash = await hashPin(new FormData(form).get("pin"));
    if (hash === state.parentPinHash) {
      view.adultUnlocked = true;
      view.adultTab = "overview";
      showToast("Voksenmodus åpnet.");
      render();
    } else {
      showToast("Feil PIN.");
    }
  }
  if (form.dataset.form === "pin-gate") {
    const hash = await hashPin(new FormData(form).get("pin"));
    if (hash === state.parentPinHash) {
      view.gate = null;
      view.mode = "home";
      view.childId = null;
      showToast("Profilvalg åpnet.");
      render();
    } else {
      showToast("Feil PIN.");
    }
  }
  if (form.dataset.form === "pin-change") {
    const data = new FormData(form);
    const currentHash = await hashPin(data.get("currentPin"));
    const newPin = String(data.get("newPin") || "");
    const repeatPin = String(data.get("repeatPin") || "");

    if (currentHash !== state.parentPinHash) {
      showToast("Nåværende PIN er feil.");
      return;
    }
    if (newPin.length < 4) {
      showToast("Ny PIN må ha minst 4 tegn.");
      return;
    }
    if (newPin !== repeatPin) {
      showToast("Ny PIN er ikke lik i begge feltene.");
      return;
    }

    state.parentPinHash = await hashPin(newPin);
    saveState();
    form.reset();
    showToast("PIN-koden er endret.");
    render();
  }
  if (form.dataset.form === "start-over-local") {
    await startOverLocal(form);
    return;
  }
  if (form.dataset.form === "first-setup") {
    await completeFirstSetup(form);
    return;
  }
  if (form.dataset.form === "family-settings") saveFamilySettings(form);
  if (form.dataset.form === "task") saveTask(form);
  if (form.dataset.form === "reward") saveReward(form);
  if (form.dataset.form === "child") saveChild(form);
  if (form.dataset.form === "points") {
    const data = new FormData(form);
    const direction = event.submitter?.value === "minus" ? -1 : 1;
    const points = Math.abs(Number(data.get("points"))) * direction;
    awardPoints(data.get("childId"), points, data.get("description") || "Manuell justering", null, "manual");
    saveState();
    showToast("Stjerner justert.");
    render();
  }
  if (form.dataset.form === "lifetime-points") {
    const data = new FormData(form);
    const child = getChild(data.get("childId"));
    const direction = event.submitter?.value === "minus" ? -1 : 1;
    const points = Math.abs(Number(data.get("points"))) * direction;
    child.lifetimePoints = Math.max(0, child.lifetimePoints + points);
    addHistory(child.id, "Livstidspoeng", data.get("description") || "Korrigert livstidspoeng", 0);
    saveState();
    showToast("Livstidspoeng justert.");
    render();
  }
  if (form.dataset.form === "levels") {
    const data = new FormData(form);
    const names = data.getAll("levelName").map((name) => String(name).trim()).filter(Boolean);
    const mins = data.getAll("levelMin").map((min) => Math.max(0, Number(min) || 0));
    state.levels = names.map((name, index) => ({ name, min: mins[index] ?? 0 })).sort((a, b) => a.min - b.min);
    saveState();
    showToast("Nivåer er lagret.");
    render();
  }
});

async function initFirebaseSync() {
  if (!cloud.enabled) return;
  try {
    view.bootMessage = "Kobler til Firestore";
    render();
    const [{ initializeApp }, { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult }, { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js")
    ]);

    const firebaseApp = initializeApp(APP_CONFIG.cloudSync.firebase);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    cloud.db = db;
    cloud.auth = auth;
    cloud.GoogleAuthProvider = GoogleAuthProvider;
    cloud.signInWithPopup = signInWithPopup;
    cloud.signInWithRedirect = signInWithRedirect;
    cloud.doc = doc;
    cloud.getDoc = getDoc;
    cloud.setDoc = setDoc;
    cloud.onSnapshot = onSnapshot;
    cloud.serverTimestamp = serverTimestamp;
    setCloudDocRef();

    await getRedirectResult(auth).then((result) => {
      if (result?.user && !result.user.isAnonymous) {
        cloud.authUser = normalizeAuthUser(result.user);
        registerGoogleAdult(result.user, "owner");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }).catch((error) => {
      console.warn("Google redirect result unavailable:", error);
    });

    await new Promise((resolve, reject) => {
      let anonymousStarted = false;
      const stop = onAuthStateChanged(auth, (user) => {
        if (user) {
          cloud.authUser = normalizeAuthUser(user);
          stop();
          resolve(user);
        } else if (!anonymousStarted) {
          anonymousStarted = true;
          signInAnonymously(auth).catch(reject);
        }
      }, reject);
    });
    if (auth.currentUser && !auth.currentUser.isAnonymous && registerGoogleAdult(auth.currentUser, "owner")) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    await resolvePendingFamilyCode();

    view.bootMessage = "Henter familiedata";
    render();
    const remoteState = await loadBestCloudState();
    if (remoteState) {
      cloud.lastFetchedAt = new Date().toISOString();
      cloud.applyingRemote = true;
      state = normalizeRemoteState(remoteState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloud.applyingRemote = false;
      setCloudDocRef();
      await writeCloudState();
    } else {
      if (!pendingFamilyCode() && state.setupCompleted) await writeCloudState();
    }

    subscribeCloudState();

    cloud.ready = true;
    cloud.status = `Synker med ${cloudFamilyId()}`;
    cloud.error = "";
    if (cloud.pendingSave) queueCloudSave();
  } catch (error) {
    cloud.ready = false;
    cloud.error = error?.message || "Kunne ikke koble til Firestore";
    console.warn("Firestore sync unavailable:", error);
  }
}

function setCloudDocRef(familyId = cloudFamilyId()) {
  if (!cloud.doc) return;
  const config = APP_CONFIG.cloudSync;
  cloud.familyId = familyId || "local-family";
  cloud.docRef = cloud.doc(
    cloud.db,
    config.stateCollection,
    cloud.familyId,
    config.stateSubcollection,
    config.stateDocument
  );
}

function familyCodeDocRef(code = state.familyCode) {
  if (!cloud.doc) return null;
  const normalizedCode = normalizeFamilyCode(code);
  if (!normalizedCode) return null;
  return cloud.doc(
    cloud.db,
    APP_CONFIG.cloudSync.codeCollection || "familyCodes",
    normalizedCode
  );
}

async function resolvePendingFamilyCode() {
  const code = normalizeFamilyCode(pendingFamilyCode());
  if (!code || !cloud.getDoc || !cloud.doc) return null;
  try {
    cloud.familyCodeLookupStatus = `Søker etter ${code}`;
    cloud.familyCodeLookupError = "";
    const docRef = familyCodeDocRef(code);
    const snapshot = docRef ? await cloud.getDoc(docRef) : null;
    if (!snapshot?.exists()) {
      cloud.familyCodeLookupStatus = "ikke funnet";
      cloud.familyCodeLookupError = "Familiekoden finnes ikke i Firestore-registeret.";
      return null;
    }
    const data = snapshot.data() || {};
    const familyId = data.cloudFamilyId || data.familyId || "";
    if (!familyId) {
      cloud.familyCodeLookupStatus = "ugyldig register";
      cloud.familyCodeLookupError = "Familiekoden mangler familie-id.";
      return null;
    }
    state.cloudFamilyId = familyId;
    state.familyId = familyId;
    state.familyCode = code;
    cloud.familyCodeLookupStatus = `fant ${familyId}`;
    cloud.familyCodeLookupError = "";
    setCloudDocRef(familyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return familyId;
  } catch (error) {
    cloud.familyCodeLookupStatus = "feilet";
    cloud.familyCodeLookupError = error?.message || "Kunne ikke slå opp familiekoden.";
    console.warn("Family code lookup failed:", error);
    return null;
  }
}

async function loadBestCloudState() {
  const familyIds = cloudFamilyCandidates();
  const snapshots = await Promise.all(familyIds.map(async (familyId) => {
    try {
      const docRef = cloudDocRefForFamily(familyId);
      const snapshot = await cloud.getDoc(docRef);
      const remoteState = snapshot.exists() ? snapshot.data()?.state : null;
      return remoteState ? { familyId, state: remoteState } : null;
    } catch (error) {
      console.warn(`Could not read cloud state for ${familyId}:`, error);
      return null;
    }
  }));
  const candidates = snapshots.filter(Boolean);
  if (!candidates.length) return null;
  candidates.sort((a, b) => remoteStateTime(b.state) - remoteStateTime(a.state));
  return candidates[0].state;
}

function cloudFamilyCandidates() {
  if (!state.setupCompleted && !pendingFamilyCode()) {
    return [cloudFamilyId()];
  }
  const ids = [
    cloudFamilyId(),
    state.cloudFamilyId,
    state.familyId || "local-family",
    ...(APP_CONFIG.cloudSync.legacyFamilyIds || [])
  ];
  return [...new Set(ids.filter(Boolean))];
}

function cloudDocRefForFamily(familyId) {
  const config = APP_CONFIG.cloudSync;
  return cloud.doc(
    cloud.db,
    config.stateCollection,
    familyId,
    config.stateSubcollection,
    config.stateDocument
  );
}

function remoteStateTime(remoteState) {
  const time = new Date(remoteState?.updatedAt || remoteState?.createdAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function subscribeCloudState() {
  if (!cloud.onSnapshot || !cloud.docRef) return;
  if (cloud.unsubscribe) cloud.unsubscribe();
  cloud.unsubscribe = cloud.onSnapshot(cloud.docRef, (remote) => {
    if (!remote.exists() || !remote.data().state || cloud.applyingRemote) return;
    cloud.lastFetchedAt = new Date().toISOString();
    const remoteState = normalizeRemoteState(remote.data().state);
    if (remoteState.updatedAt && remoteState.updatedAt !== state.updatedAt) {
      cloud.applyingRemote = true;
      state = remoteState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloud.applyingRemote = false;
      ensureCloudFamilyPath();
      render();
    }
  });
}

function ensureCloudFamilyPath() {
  if (!cloud.enabled || !cloud.ready || !cloud.doc || !cloud.db) return;
  const currentFamilyId = cloudFamilyId();
  if (cloud.familyId === currentFamilyId) return;
  setCloudDocRef();
  subscribeCloudState();
  writeCloudState().catch((error) => {
    cloud.error = error?.message || "Kunne ikke lagre i Firestore";
    console.warn("Firestore family switch failed:", error);
    render();
  });
}

function normalizeRemoteState(remoteState) {
  return {
    ...loadState(),
    ...remoteState,
    familyCode: remoteState.familyCode || familyCodeFromSeed(`${remoteState.familyId || "local-family"}-${remoteState.createdAt || "remote"}`),
    cloudFamilyId: remoteState.cloudFamilyId || remoteState.cloudMigration?.to || state.cloudFamilyId || null,
    setupCompleted: remoteState.setupCompleted ?? true,
    ownerUid: remoteState.ownerUid || state.ownerUid || null,
    adultUsers: normalizeAdultUsers((remoteState.adultUsers?.length ? remoteState.adultUsers : state.adultUsers) || []),
    children: normalizeChildren(remoteState.children || []),
    tasks: normalizeTasks(remoteState.tasks || []),
    completions: remoteState.completions || [],
    rewards: normalizeRewards(remoteState.rewards || []),
    redemptions: remoteState.redemptions || [],
    transactions: remoteState.transactions || [],
    history: remoteState.history || [],
    badges: remoteState.badges || [],
    syncDiagnostics: normalizeSyncDiagnostics(remoteState.syncDiagnostics),
    cloudMigration: normalizeCloudMigration(remoteState.cloudMigration),
    levels: remoteState.levels || DEFAULT_LEVELS
  };
}

function queueCloudSave() {
  if (!cloud.enabled || cloud.applyingRemote) return;
  cloud.pendingSave = true;
  if (!cloud.ready || !cloud.docRef || !cloud.setDoc) return;
  window.clearTimeout(cloud.saveTimer);
  cloud.saveTimer = window.setTimeout(() => {
    flushCloudSave();
  }, 350);
}

async function flushCloudSave() {
  if (!cloud.enabled || cloud.applyingRemote || !cloud.ready || !cloud.docRef || !cloud.setDoc) return;
  try {
    await writeCloudState();
    cloud.pendingSave = false;
    cloud.lastSavedAt = new Date().toISOString();
    cloud.error = "";
    render();
  } catch (error) {
    cloud.pendingSave = true;
    cloud.error = error?.message || "Kunne ikke lagre i Firestore";
    console.warn("Firestore save failed:", error);
    render();
  }
}

async function writeCloudState() {
  if (!cloud.docRef || !cloud.setDoc) return;
  await cloud.setDoc(cloud.docRef, {
    familyId: state.familyId || "local-family",
    familyName: state.familyName || "",
    state,
    updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
  await writeFamilyCodeIndex().catch((error) => {
    cloud.familyCodeLookupStatus = "register kunne ikke lagres";
    cloud.familyCodeLookupError = error?.message || "Kunne ikke lagre familiekode-register.";
    console.warn("Family code index write failed:", error);
  });
}

async function writeFamilyCodeIndex() {
  if (!cloud.setDoc || !state.familyCode || !state.setupCompleted) return;
  const docRef = familyCodeDocRef(state.familyCode);
  if (!docRef) return;
  await cloud.setDoc(docRef, {
    code: normalizeFamilyCode(state.familyCode),
    familyId: cloudFamilyId(),
    cloudFamilyId: cloudFamilyId(),
    familyName: state.familyName || "",
    ownerUid: state.ownerUid || null,
    updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
}

async function registerServiceWorkerAndUpdate() {
  if (!("serviceWorker" in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  try {
    view.bootMessage = "Sjekker appversjon";
    render();
    const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`);
    await registration.update();
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  } catch (error) {
    console.warn("Service worker update unavailable:", error);
  }
}

function validateStartupProfile() {
  if (view.mode?.startsWith("child:")) {
    view.childId = view.mode.replace("child:", "");
    view.mode = "child";
  }
  const childId = view.childId || "";
  if (view.mode === "child" && getChild(childId)?.active === false) {
    view.mode = "home";
    view.childId = null;
    localStorage.setItem(DEVICE_PROFILE_KEY, "home");
  }
  if (view.mode === "child" && !getChild(view.childId)) {
    view.mode = "home";
    view.childId = null;
    localStorage.setItem(DEVICE_PROFILE_KEY, "home");
  }
  if (view.mode === "adult") {
    view.mode = "adult";
  }
}

async function startApp() {
  render();
  await registerServiceWorkerAndUpdate();
  if (!isSetupPreview()) {
    await initFirebaseSync();
  }
  validateStartupProfile();
  view.booting = false;
  queueScrollTop();
  render();
}

startApp();
