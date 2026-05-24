const STORAGE_KEY = "familieoppdrag.v1";
const DEVICE_PROFILE_KEY = "familieoppdrag.deviceProfile";
const CLOUD_BACKUP_KEY = "familieoppdrag.cloudBackups.v1";
const PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
const APP_VERSION = "92";
const MIN_SUPPORTED_APP_VERSION = 85;
const SCHEMA_VERSION = 2;
const ADULT_INVITE_LIFETIME_DAYS = 7;
const DEVELOPER_ADMIN_EMAILS = ["espen.viig.syversen@gmail.com"];
const APP_CONFIG = {
  appName: "Familieoppdrag",
  environment: "production",
  environmentLabel: "Produksjon",
  cloudSync: {
    enabled: true,
    provider: "firebase",
    stateCollection: "families",
    codeCollection: "familyCodes",
    adminHealthCollection: "adminFamilyHealth",
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
  collection: null,
  query: null,
  where: null,
  limit: null,
  docRef: null,
  getDoc: null,
  getDocs: null,
  setDoc: null,
  runTransaction: null,
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
  initialFetchComplete: false,
  remoteRevision: 0,
  staleWriteBlockedAt: null,
  staleWriteMessage: "",
  backupLastAt: null,
  backupLastRevision: 0,
  backupStatus: "",
  backupError: "",
  mergeLastAt: null,
  mergeLastSummary: "",
  manualFetchLastAt: null,
  manualFetchStatus: "",
  manualFetchError: "",
  backupList: [],
  backupListStatus: "",
  backupRestoreStatus: "",
  backupRestoreError: "",
  adminFamilies: [],
  adminStatus: "",
  adminError: "",
  adminSource: "adminFamilyHealth",
  minSupportedAppVersion: MIN_SUPPORTED_APP_VERSION,
  versionBlocked: false,
  versionBlockedMessage: "",
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
  { id: "sofia", name: "Sofia", avatar: "🌟", color: "#8B5CF6", pointsBalance: 0, lifetimePoints: 0, streak: 0, bestStreak: 0, lastStreakDate: null, active: true },
  { id: "finn", name: "Finn", avatar: "🚀", color: "#00A8B5", pointsBalance: 0, lifetimePoints: 0, streak: 0, bestStreak: 0, lastStreakDate: null, active: true },
  { id: "ellie", name: "Ellie", avatar: "🌈", color: "#F472B6", pointsBalance: 0, lifetimePoints: 0, streak: 0, bestStreak: 0, lastStreakDate: null, active: true }
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
  setupMode: "new",
  setupDraft: null,
  avatarPickerChildId: null,
  badgeCelebration: null,
  restoreBackupId: null,
  gate: null,
  pinResetMode: false,
  pinResetVerified: false,
  pinResetUser: null,
  pinResetError: "",
  appUpdateAvailable: false,
  appUpdateInstalling: false,
  appUpdateReloading: false,
  serviceWorkerRegistration: null,
  serviceWorkerWaiting: null,
  scrollTopPending: true,
  adminPortal: adminPortalRequested()
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
    appVersion: APP_VERSION,
    minSupportedAppVersion: MIN_SUPPORTED_APP_VERSION,
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
    pilotShareText: "",
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
    appVersion: savedState.appVersion || APP_VERSION,
    minSupportedAppVersion: Math.max(Number(savedState.minSupportedAppVersion) || 0, MIN_SUPPORTED_APP_VERSION),
    setupCompleted: savedState.setupCompleted ?? (existingInstall && hasConfiguredData),
    ownerUid: savedState.ownerUid || null,
    adultUsers: normalizeAdultUsers(savedState.adultUsers || []),
    familyDevices: normalizeFamilyDevices(savedState.familyDevices || []),
    inviteCodes: normalizeInviteCodes(savedState.inviteCodes || [], savedState.familyCode),
    parentPinHash: savedState.parentPinHash || PIN_HASH,
    cloudRevision: Number(savedState.cloudRevision) || 0,
    lastCloudSyncAt: savedState.lastCloudSyncAt || null,
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
    pilotShareText: savedState.pilotShareText || "",
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
    bestStreak: Number(child.bestStreak) || Number(child.streak) || 0,
    lastStreakDate: child.lastStreakDate || null,
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
  state.appVersion = APP_VERSION;
  state.minSupportedAppVersion = Math.max(Number(state.minSupportedAppVersion) || 0, MIN_SUPPORTED_APP_VERSION);
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
  } else if (view.adminPortal) {
    renderDeveloperAdminPortal();
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
  renderGlobalOverlays();
  scrollToTopIfNeeded();
}

function adminPortalRequested() {
  const params = new URLSearchParams(window.location.search);
  return params.has("admin") || params.get("view") === "admin";
}

function renderGlobalOverlays() {
  const banner = syncStatusBanner();
  if (banner) {
    app.insertAdjacentHTML("afterbegin", banner);
  }
  if (view.badgeCelebration) {
    app.insertAdjacentHTML("beforeend", badgeCelebrationModal(view.badgeCelebration));
  }
  if (view.restoreBackupId) {
    app.insertAdjacentHTML("beforeend", restoreBackupModal(view.restoreBackupId));
  }
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

function renderDeveloperAdminPortal() {
  const canRead = isDeveloperAdmin();
  app.innerHTML = `
    <main class="app-layout admin-portal-layout">
      <header class="app-header adult-header">
        <div class="brand">
          <div class="logo">🔐</div>
          <div>
            <p class="eyebrow">Utvikleradmin</p>
            <h1>Driftsstatus</h1>
          </div>
        </div>
        <div class="top-actions">
          <span class="pill ${canRead ? "done" : "pending"}">${canRead ? "Admin innlogget" : "Google kreves"}</span>
          <button class="btn secondary" type="button" data-action="leave-admin-portal">Til appen</button>
        </div>
      </header>
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h2>Pilotfamilier</h2>
            <p class="muted">Teknisk status uten barnenavn, oppgaveinnhold eller detaljert aktivitet.</p>
          </div>
        </div>
        <div class="setup-note">
          Dette panelet leser kun anonymisert driftsmetadata fra <strong>${escapeText(adminHealthCollectionName())}</strong>: appversjon, siste synk, revisjon, backupstatus, feil og antall elementer.
        </div>
        ${canRead ? "" : `
          <div class="auth-status-card pending">
            <div>
              <strong>Kun utvikleradmin</strong>
              <small>Logg inn med ${escapeText(DEVELOPER_ADMIN_EMAILS[0])} for å se driftsstatus.</small>
            </div>
            <button class="btn secondary" type="button" data-action="developer-admin-login">Logg inn med Google</button>
          </div>
        `}
        <div class="actions" style="margin-top:14px">
          <button class="btn secondary" data-action="load-admin-families" ${canRead ? "" : "disabled"}>Hent driftsstatus</button>
          <button class="btn secondary" data-action="copy-admin-summary" ${cloud.adminFamilies.length ? "" : "disabled"}>Kopier oversikt</button>
          <button class="btn secondary" data-action="force-cloud-save">Oppdater min families status</button>
        </div>
        ${cloud.adminStatus ? `<p class="small">${escapeText(cloud.adminStatus)}</p>` : ""}
        ${cloud.adminError ? `<p class="small">Admin-feil: ${escapeText(cloud.adminError)}</p>` : ""}
        ${cloud.adminError ? adminRulesHint() : ""}
        ${cloud.adminFamilies.length ? adminFamilyTable() : `<div class="empty">Ingen driftsstatus hentet i denne økten.</div>`}
      </section>
    </main>
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
  if (view.setupMode === "existing" && !isSetupPreview()) {
    renderExistingFamilySetup();
    return;
  }
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

function renderExistingFamilySetup() {
  app.innerHTML = `
    <header class="topbar setup-topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Koble til familie</h1>
        </div>
      </div>
    </header>
    <section class="setup-shell">
      <div class="setup-intro setup-wizard-intro">
        <h2>Har allerede familie</h2>
        <p>Koble denne enheten til en familie som allerede finnes i skyen.</p>
        <div class="setup-progress" aria-hidden="true">
          <span class="active"></span><span></span><span></span>
        </div>
      </div>
      <div class="panel setup-form">
        <div class="setup-block">
          <h3>Finn familien din</h3>
          <p class="muted">Bruk familiekoden fra Deling-fanen, eller logg inn med Google hvis denne kontoen allerede er koblet til familien.</p>
          <div class="setup-connect-grid">
            <form data-form="join-existing-family" class="setup-connect-card">
              <div>
                <strong>Bruk familiekode</strong>
                <p class="muted">Passer for barnas enheter, felles tablet og nye nettlesere.</p>
              </div>
              <div class="field">
                <label>Familiekode</label>
                <input name="familyCode" type="text" inputmode="text" autocomplete="off" placeholder="F.eks. H2K4M6P8" required>
              </div>
              <button class="btn" type="submit">Koble til familie</button>
            </form>
            <div class="setup-connect-card">
              <div>
                <strong>Logg inn med Google</strong>
                <p class="muted">Passer for voksne. Fungerer når kontoen er registrert som voksen/eier i appen.</p>
              </div>
              <button class="btn secondary" type="button" data-action="existing-family-google-login">Logg inn og finn familie</button>
            </div>
          </div>
          ${cloud.familyCodeLookupStatus ? `<div class="setup-note">Familiekode: ${escapeText(cloud.familyCodeLookupStatus)}</div>` : ""}
          ${cloud.familyCodeLookupError ? `<div class="setup-note warning-note">Kunne ikke koble til: ${escapeText(cloud.familyCodeLookupError)}</div>` : ""}
          ${cloud.error ? `<div class="setup-note warning-note">Google/sky: ${escapeText(cloud.error)}</div>` : ""}
        </div>
        <div class="actions setup-actions">
          <button class="btn secondary" type="button" data-action="setup-new-family">Lag ny familie i stedet</button>
        </div>
      </div>
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
    { id: "homescreen", hero: "Hjemskjerm", description: "Etter oppsettet bør appen lagres på hjemskjermen på barnas enheter og felles iPad/tablet." },
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
        ${!preview ? `<div class="actions" style="margin-top:16px"><button class="btn secondary" type="button" data-action="setup-existing-family">Har allerede familie</button></div>` : ""}
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
  if (stepId === "homescreen") {
    return `
      <div class="setup-block">
        <h3>Husk dette etter oppsettet</h3>
        <p class="muted">Ikke forlat oppstartsveilederen nå. Når familien er startet, åpnes Deling-fanen. Derfra kan du åpne familielenken på riktig enhet og lagre appen på hjemskjermen.</p>
        <div class="setup-summary">
          <div><strong>iPhone og iPad</strong><span>Etter oppsettet: åpne familielenken i Safari, trykk Del-knappen og velg Legg til på Hjem-skjerm.</span></div>
          <div><strong>Android og Chrome</strong><span>Etter oppsettet: åpne familielenken i Chrome, trykk menyen og velg Installer app eller Legg til på startskjerm.</span></div>
          <div><strong>PC og Mac</strong><span>Etter oppsettet: bruk Installer-ikonet i nettleseren når det vises, eller lag bokmerke hvis installering ikke tilbys.</span></div>
        </div>
        <div class="setup-note">Dette er en påminnelse, ikke et steg du må gjøre akkurat nå. Fullfør veilederen først.</div>
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

function badgeCelebrationModal(badge) {
  return `
    <div class="modal-backdrop badge-celebration-backdrop">
      <div class="modal badge-celebration-modal" role="dialog" aria-modal="true" aria-labelledby="badge-celebration-title">
        <div class="badge-celebration-icon">${badge.icon}</div>
        <p class="eyebrow">Nytt merke</p>
        <h2 id="badge-celebration-title">${escapeText(badge.name)}</h2>
        <p class="muted">${escapeText(badge.description)}</p>
        <div class="badge-celebration-actions">
          <button class="btn" data-action="view-my-badges">Se merkene mine</button>
          <button class="btn secondary" data-action="close-badge-celebration">Fortsett</button>
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
    ${weeklyGoalCard(child)}
    ${groupedTaskSection("Dagens oppdrag", daily, child.id)}
    ${taskSection("Ukens oppdrag", weekly, child.id)}
    ${taskSection("Ekstraoppdrag", bonus, child.id)}
  `;
}

function weeklyGoalCard(child) {
  const progress = weeklyGoalProgress(child.id);
  return `
    <section>
      <article class="weekly-goal-card">
        <div class="weekly-goal-main">
          <div class="weekly-goal-icon">🎯</div>
          <div>
            <p class="eyebrow">Ukens mål</p>
            <h2>${progress.done} av ${progress.target} oppdrag</h2>
            <p>${progress.done >= progress.target ? "Målet er nådd. Neste mål er allerede klart." : `${progress.missing} oppdrag igjen til neste ukemål.`}</p>
          </div>
        </div>
        <div class="weekly-goal-progress">
          <div class="weekly-goal-row">
            <span>${progress.percent}%</span>
            <strong>${progress.badgeText}</strong>
          </div>
          ${progressBar(progress.percent, `${progress.percent}% av ukens mål`)}
        </div>
      </article>
    </section>
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
  const stats = childStats(child.id);
  const nextBadges = badgeProgressList(child.id).slice(0, 3);
  return `
    ${levelProgressCard(child, "full")}
    <section>
      <div class="section-title"><h2>Min fremdrift</h2><span class="small">I dag</span></div>
      <div class="motivation-grid">
        <article class="card focus-card">
          <div class="focus-icon">🔥</div>
          <div>
            <p class="eyebrow">Streak</p>
            <h2>${child.streak || 0} dager</h2>
            <p class="muted">${streakMessage(child.streak || 0)}</p>
            <p class="small">Beste streak: ${child.bestStreak || child.streak || 0} dager</p>
          </div>
        </article>
        ${miniProgressCard("⭐", "Dagens oppdrag", stats.dailyDone, stats.dailyTotal, stats.dailyTotal ? `${Math.max(0, stats.dailyTotal - stats.dailyDone)} igjen i dag` : "Ingen faste oppdrag i dag")}
        ${miniProgressCard("🏅", "Ukens oppdrag", stats.weeklyDone, stats.weeklyTotal, stats.weeklyTotal ? `${Math.max(0, stats.weeklyTotal - stats.weeklyDone)} igjen denne uken` : "Ingen ukesoppdrag akkurat nå")}
      </div>
    </section>
    <section>
      <div class="section-title"><h2>Neste merker</h2><span class="small">Nesten i mål</span></div>
      <div class="badge-grid">
        ${nextBadges.length ? nextBadges.map(nextBadgeCard).join("") : `<div class="empty">Alle merker er låst opp akkurat nå. Sterkt jobbet!</div>`}
      </div>
    </section>
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
  const progress = new Map(badgeProgressList(childId).map((item) => [item.badge.id, item]));
  return `
    <div class="badge-grid">
      ${BADGE_DEFINITIONS.map((badge) => {
        const childBadge = earned.find((item) => item.badgeId === badge.id);
        const badgeProgress = progress.get(badge.id);
        return `
          <article class="badge-card ${childBadge ? "earned" : "locked"}">
            <div class="badge-icon">${childBadge ? badge.icon : "🔒"}</div>
            <div>
              <h3>${badge.name}</h3>
              <p class="muted">${badge.description}</p>
              <p class="small">${childBadge ? `Fikk ${formatDate(childBadge.awardedAt)}` : badgeProgress ? badgeProgress.hint : "Ikke låst opp ennå"}</p>
              ${!childBadge && badgeProgress ? progressBar(badgeProgress.percent, `${badgeProgress.percent}% mot ${escapeAttr(badge.name)}`) : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function streakMessage(streak) {
  if (streak >= 7) return "Du er på en skikkelig god rekke.";
  if (streak >= 3) return "Tre eller flere dager på rad. Klarer du en dag til?";
  if (streak >= 1) return "Bra start. Neste oppdrag holder rekken levende.";
  return "Fullfør et oppdrag i dag for å starte en streak.";
}

function miniProgressCard(icon, title, done, total, hint) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return `
    <article class="card mini-progress-card">
      <div class="mini-progress-head">
        <span class="mini-icon">${icon}</span>
        <div>
          <h3>${title}</h3>
          <p class="muted">${hint}</p>
        </div>
      </div>
      <div class="mini-progress-row">
        <strong>${done}/${total}</strong>
        <span>${percent}%</span>
      </div>
      ${progressBar(percent, `${percent}% fullført`)}
    </article>
  `;
}

function nextBadgeCard(item) {
  return `
    <article class="badge-card next-badge-card">
      <div class="badge-icon">${item.badge.icon}</div>
      <div>
        <h3>${item.badge.name}</h3>
        <p class="muted">${item.badge.description}</p>
        <p class="small">${item.hint}</p>
        ${progressBar(item.percent, `${item.percent}% mot ${escapeAttr(item.badge.name)}`)}
      </div>
    </article>
  `;
}

function progressBar(percent, label) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="progress mini-progress" aria-label="${label}"><span style="width:${safePercent}%"></span></div>`;
}

function badgeProgressList(childId) {
  const earned = new Set(earnedBadges(childId).map((item) => item.badgeId));
  return BADGE_DEFINITIONS
    .filter((badge) => !earned.has(badge.id))
    .map((badge) => badgeProgress(childId, badge))
    .sort((a, b) => b.percent - a.percent || a.missing - b.missing || a.badge.name.localeCompare(b.badge.name, "no"));
}

function badgeProgress(childId, badge) {
  const completed = completedTaskCount(childId);
  const bonus = completedBonusCount(childId);
  const morning = categoryProgressToday(childId, "Morgen");
  const evening = categoryProgressToday(childId, "Kveld");
  const rewardDone = state.redemptions.some((item) => item.childId === childId && ["approved", "fulfilled"].includes(item.status));
  const progressByBadge = {
    "first-task": goalProgress(completed, 1, "Fullfør ett oppdrag for å låse opp."),
    "task-10": goalProgress(completed, 10, `${Math.max(0, 10 - completed)} oppdrag igjen.`),
    "task-50": goalProgress(completed, 50, `${Math.max(0, 50 - completed)} oppdrag igjen.`),
    "morning-master": goalProgress(morning.done, morning.total, morning.total ? `${Math.max(0, morning.total - morning.done)} morgenoppdrag igjen i dag.` : "Ingen morgenoppdrag i dag."),
    "evening-hero": goalProgress(evening.done, evening.total, evening.total ? `${Math.max(0, evening.total - evening.done)} kveldsoppdrag igjen i dag.` : "Ingen kveldsoppdrag i dag."),
    "bonus-star": goalProgress(bonus, 1, "Fullfør ett ekstraoppdrag."),
    "reward-picker": goalProgress(rewardDone ? 1 : 0, 1, "Be om en belønning og få den godkjent.")
  };
  return {
    badge,
    ...(progressByBadge[badge.id] || goalProgress(0, 1, "Fortsett å samle oppdrag."))
  };
}

function goalProgress(done, total, hint) {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeDone = Math.max(0, Math.min(safeTotal, Number(done) || 0));
  return {
    done: safeDone,
    total: safeTotal,
    missing: Math.max(0, safeTotal - safeDone),
    percent: Math.round((safeDone / safeTotal) * 100),
    hint
  };
}

function categoryProgressToday(childId, category) {
  const tasks = childPeriodTasks(childId, "daily").filter((item) => item.task.category === category);
  const done = tasks.filter((item) => ["completed", "approved"].includes(item.status)).length;
  return { done, total: tasks.length };
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
        <span class="sync-pill ${currentRoleClass()}">${currentRoleLabel()}</span>
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
  if (view.pinResetMode) {
    renderPinResetModal();
    return;
  }
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
        <button class="btn secondary" type="button" data-action="forgot-pin">Glemt PIN?</button>
      </form>
    </div>
  `;
}

function renderPinResetModal() {
  const verified = Boolean(view.pinResetVerified);
  const userLabel = view.pinResetUser?.email || view.pinResetUser?.name || "";
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">🔐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Nullstill PIN</h1>
        </div>
      </div>
      <button class="btn secondary" data-action="cancel-pin-reset">Tilbake</button>
    </header>
    <div class="modal-backdrop">
      <form class="modal" data-form="pin-reset">
        <h2>Lag ny voksen-PIN</h2>
        <p class="muted">Logg inn med Google-kontoen som er voksen i familien før du setter ny PIN.</p>
        ${view.pinResetError ? `<div class="setup-note warning-note">${escapeText(view.pinResetError)}</div>` : ""}
        <div class="auth-status-card ${verified ? "done" : "pending"}">
          <div>
            <strong>${verified ? "Google-konto bekreftet" : "Google-bekreftelse kreves"}</strong>
            <small>${verified ? escapeText(userLabel) : "Bare registrert voksen/eier i denne familien kan nullstille PIN."}</small>
          </div>
          <button class="btn secondary" type="button" data-action="google-pin-reset-login">${verified ? "Bytt konto" : "Logg inn med Google"}</button>
        </div>
        <div class="field">
          <label>Ny PIN</label>
          <input name="newPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" ${verified ? "required autofocus" : "disabled"}>
        </div>
        <div class="field">
          <label>Gjenta ny PIN</label>
          <input name="repeatPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" ${verified ? "required" : "disabled"}>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" type="submit" ${verified ? "" : "disabled"}>Lagre ny PIN</button>
          <button class="btn secondary" type="button" data-action="cancel-pin-reset">Avbryt</button>
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
  const ownerAccess = hasOwnerAccess();
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Del familie</h2>
          <p class="muted">Send riktig lenke til riktig type enhet eller person.</p>
        </div>
      </div>
      ${sharingReadinessPanel()}
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
            <button class="btn secondary" data-action="new-family-code" ${ownerAccess ? "" : "disabled"}>Lag ny familiekode</button>
          </div>
          <p class="small">Denne lenken gir ikke tilgang til voksenpanelet alene. På enheten velger dere profilvelger, et barn eller voksenoversikt som standard.</p>
          <div class="setup-note">
            For best opplevelse: åpne lenken på barnets iPad/tablet eller felles enhet, velg startprofil, og legg appen på hjemskjermen etterpå.
          </div>
          ${ownerAccess ? "" : `<p class="small">Bare Google-eier kan lage ny familiekode.</p>`}
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
              <button class="btn" data-action="copy-adult-invite" ${ownerAccess ? "" : "disabled"}>Kopier vokseninvitasjon</button>
              <button class="btn secondary" data-action="new-adult-invite" ${ownerAccess ? "" : "disabled"}>Lag ny vokseninvitasjon</button>
              ${adultInvite ? `<button class="btn danger" data-action="revoke-adult-invite" ${ownerAccess ? "" : "disabled"}>Deaktiver</button>` : ""}
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
          ${ownerAccess ? "" : `<p class="small">Bare Google-eier kan lage, kopiere eller deaktivere vokseninvitasjoner.</p>`}
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
          <div><strong>Denne økten</strong><span>${escapeText(currentRoleLabel())}</span></div>
          <div><strong>Voksne</strong><span>${activeAdultUsers().length}</span></div>
          <div><strong>Enhetskode</strong><span>${escapeText(state.familyCode || "-")}</span></div>
        </div>
      </section>
    </section>
  `;
}

function shareReadinessItems(adultInvite) {
  const hasChildren = activeChildren().length > 0;
  const cloudOk = cloud.ready && cloud.initialFetchComplete && !cloud.pendingSave && !cloud.error;
  const cloudPending = cloud.pendingSave || !cloud.initialFetchComplete;
  const familyCodeOk = Boolean(state.familyCode);
  const backupOk = Boolean(cloud.backupLastAt || cloud.backupList?.length);
  const appVersionOk = String(APP_VERSION).trim() !== "";
  return [
    {
      title: "Google-eier",
      description: familyHasGoogleOwner() ? googleOwnerLabel() : "Logg inn med Google før familien deles med andre voksne.",
      status: familyHasGoogleOwner() ? "done" : "rejected",
      action: familyHasGoogleOwner() ? "" : "google-owner-login",
      actionLabel: familyHasGoogleOwner() ? "" : "Logg inn"
    },
    {
      title: "Sky-synk",
      description: cloudOk ? cloudStatusLabel() : cloudPending ? "Venter på lagring til sky." : cloud.error || "Sky-synk er ikke klar ennå.",
      status: cloudOk ? "done" : cloudPending ? "pending" : "rejected",
      action: cloudOk ? "" : "force-cloud-fetch",
      actionLabel: cloudOk ? "" : "Hent nyeste",
      secondaryAction: cloudOk ? "" : "force-cloud-save",
      secondaryActionLabel: cloudOk ? "" : "Lagre nå"
    },
    {
      title: "Familiekode",
      description: familyCodeOk ? `Klar for barn og felles enheter: ${state.familyCode}` : "Mangler familiekode.",
      status: familyCodeOk ? "done" : "rejected",
      action: familyCodeOk ? "copy-family-link" : "new-family-code",
      actionLabel: familyCodeOk ? "Kopier lenke" : "Lag kode"
    },
    {
      title: "Barneprofiler",
      description: hasChildren ? `${activeChildren().length} aktive barn kan kobles til.` : "Legg til minst ett barn før appen deles til barneenheter.",
      status: hasChildren ? "done" : "rejected",
      action: hasChildren ? "" : "adult-tab",
      actionLabel: hasChildren ? "" : "Åpne Barn",
      actionDataset: hasChildren ? null : { tab: "children" }
    },
    {
      title: "Vokseninvitasjon",
      description: adultInvite ? inviteExpiryLabel(adultInvite) : "Valgfritt. Lag en vokseninvitasjon når en annen voksen skal få tilgang.",
      status: adultInvite ? "done" : "pending",
      action: adultInvite ? "copy-adult-invite" : "new-adult-invite",
      actionLabel: adultInvite ? "Kopier" : "Lag invitasjon"
    },
    {
      title: "Backup",
      description: backupOk ? "Backup finnes i denne økten." : "Hent skybackuper eller lag en sky-lagring før du deler bredt.",
      status: backupOk ? "done" : "pending",
      action: "list-cloud-backups",
      actionLabel: backupOk ? "Se backuper" : "Hent backuper",
      secondaryAction: "force-cloud-save",
      secondaryActionLabel: "Lagre nå"
    },
    {
      title: "Appversjon",
      description: appVersionOk ? `Versjon ${APP_VERSION} er aktiv.` : "Appversjon mangler.",
      status: appVersionOk ? "done" : "rejected"
    },
    {
      title: "Lokale endringer",
      description: cloud.pendingSave ? "Det finnes endringer som ikke er ferdig lagret til sky." : "Ingen ventende lokal sky-lagring.",
      status: cloud.pendingSave ? "pending" : "done",
      action: cloud.pendingSave ? "force-cloud-save" : "",
      actionLabel: cloud.pendingSave ? "Lagre nå" : ""
    }
  ];
}

function readinessActionButton(item, key = "action") {
  const action = item[key];
  const label = item[key === "action" ? "actionLabel" : "secondaryActionLabel"];
  if (!action || !label) return "";
  const dataset = key === "action" ? item.actionDataset : item.secondaryActionDataset;
  const attrs = dataset ? Object.entries(dataset).map(([name, value]) => ` data-${name}="${escapeAttr(value)}"`).join("") : "";
  return `<button class="btn secondary compact-btn" data-action="${escapeAttr(action)}"${attrs}>${escapeText(label)}</button>`;
}

function sharingReadinessSummary(items = shareReadinessItems(activeInvites("adult")[0])) {
  const rejected = items.filter((item) => item.status === "rejected").length;
  const pending = items.filter((item) => item.status === "pending").length;
  if (rejected) return { status: "rejected", title: "Ikke klar for deling", text: `${rejected} punkt må rettes før du deler med en ny familie.` };
  if (pending) return { status: "pending", title: "Nesten klar", text: `${pending} punkt bør sjekkes før du deler bredt.` };
  return { status: "done", title: "Klar for deling", text: "Alle tekniske delingssjekker ser gode ut." };
}

function sharingReadinessPanel() {
  const adultInvite = activeInvites("adult")[0];
  const items = shareReadinessItems(adultInvite);
  const summary = sharingReadinessSummary(items);
  return `
    <section class="panel share-ready-panel">
      <div class="section-title compact-title">
        <div>
          <h2>${escapeText(summary.title)}</h2>
          <p class="muted">${escapeText(summary.text)}</p>
        </div>
        <span class="pill ${summary.status}">${summary.status === "done" ? "Klar" : summary.status === "pending" ? "Sjekk" : "Stopp"}</span>
      </div>
      <div class="share-checklist expanded">
        ${items.map((item) => `
          <div class="share-check ${item.status}">
            <span class="share-check-mark">${item.status === "done" ? "✓" : item.status === "rejected" ? "!" : "…"}</span>
            <span>
              <strong>${escapeText(item.title)}</strong>
              <small>${escapeText(item.description)}</small>
              ${(item.action || item.secondaryAction) ? `
                <span class="share-check-actions">
                  ${readinessActionButton(item)}
                  ${readinessActionButton(item, "secondaryAction")}
                </span>
              ` : ""}
            </span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
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
  if (view.settingsPage === "help") return settingsHelpGuide();
  if (view.settingsPage === "advanced") return settingsAdvancedMenu();
  if (view.settingsPage === "cloud") return settingsCloud();
  if (view.settingsPage === "sharing-ready") return settingsSharingReady();
  if (view.settingsPage === "share-new-family") return settingsShareNewFamily();
  if (view.settingsPage === "pilot") return settingsPilotShare();
  if (view.settingsPage === "admin") return isDeveloperAdmin() ? settingsAdmin() : settingsAdvancedMenu();
  if (view.settingsPage === "migration") return settingsDataMigration();
  if (view.settingsPage === "reset") return settingsReset();
  return settingsMenu();
}

function settingsBackButton(page = "menu") {
  return `<button class="btn secondary" data-action="settings-page" data-page="${escapeAttr(page)}">Tilbake</button>`;
}

function settingsMenu() {
  const items = [
    ["family", "Familie og voksne", "Navn, Google-eier og voksne"],
    ["devices", "Denne enheten", "Velg hva appen åpner med her"],
    ["security", "PIN og sikkerhet", "Endre voksen-PIN"],
    ["backup", "Backup og flytting", "Eksporter, importer og flytt data"],
    ["starter", "Startpakker", "Legg inn standard oppgaver og belønninger"],
    ["levels", "Nivåer", "Navn og grenser for livstidsstjerner"],
    ["help", "Hjelp og brukerveileder", "Forklaring av knapper og vanlige oppgaver"],
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
      <div class="settings-advanced-entry">
        <button class="settings-tile advanced" data-action="settings-page" data-page="advanced">
          <span>
            <strong>Avansert og drift</strong>
            <small>Feilsøking, deling med nye familier, admin og datamodell</small>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  `;
}

function settingsAdvancedMenu() {
  const items = [
    ["cloud", "App, sky og diagnose", "Miljø, Firebase, synk og feilsøking"],
    ["sharing-ready", "Klar for deling", "Siste kontroll før du sender appen videre"],
    ["share-new-family", "Del med ny familie", "Startlenke og trygg forklaring for en ny familie"],
    ["pilot", "Send til pilotfamilie", "Ferdig tekst du kan kopiere og sende"],
    ["migration", "Datamodell og migrering", "Plan og validering før neste Firestore-modell"]
  ];
  if (isDeveloperAdmin()) {
    items.splice(4, 0, ["admin", "Drift/admin", "Oversikt over familier og skyhelse"]);
  }
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Avansert og drift</h2>
          <p class="muted">For feilsøking, deling og teknisk drift. Vanlig familiebruk krever normalt ikke disse valgene.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="setup-note advanced-note">
        Dette området er nyttig for deg som utvikler eller familieeier ved support, backup, sky-synk og deling med nye familier.
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

function settingsHelpGuide() {
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Hjelp og brukerveileder</h2>
          <p class="muted">Kort forklaring av hvordan appen brukes i praksis.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <section class="panel">
        <div class="help-grid">
          <article class="help-card">
            <h3>Toppknapper</h3>
            <dl>
              <dt>Standard</dt>
              <dd>Setter denne enheten til å åpne rett her neste gang. Brukes ofte på barnets tablet eller voksen sin mobil.</dd>
              <dt>Hjem</dt>
              <dd>Går tilbake til profilvelgeren, der dere kan velge barn eller voksenmodus.</dd>
              <dt>Lås</dt>
              <dd>Låser voksenpanelet. På felles enheter må voksen-PIN skrives inn for å åpne igjen.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Oppgaver</h3>
            <dl>
              <dt>Ny oppgave</dt>
              <dd>Åpne Voksenmodus, gå til Oppgaver og trykk Ny oppgave. Velg dager, barn, stjerner og om voksen må godkjenne.</dd>
              <dt>Endre oppgave</dt>
              <dd>Gå til Oppgaver og trykk Endre på oppgaven. Der kan du endre navn, kategori, dager, poeng og hvem den gjelder for.</dd>
              <dt>Godkjenninger</dt>
              <dd>Oppgaver som krever voksen havner under Godkjenninger før stjernene deles ut.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Belønninger</h3>
            <dl>
              <dt>Ny belønning</dt>
              <dd>Gå til Belønninger og trykk Ny belønning. Sett kostnad i stjerner og hvilke barn som kan bruke den.</dd>
              <dt>Be om belønning</dt>
              <dd>Barna går til Belønning i sin profil og ber om en belønning når de har nok stjerner.</dd>
              <dt>Godkjenn belønning</dt>
              <dd>Voksen godkjenner eller avviser ønsket under Godkjenninger.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Barn og stjerner</h3>
            <dl>
              <dt>Legg til barn</dt>
              <dd>Gå til Barn og trykk Legg til barn. Nye barn legges automatisk til på aktive oppgaver og belønninger.</dd>
              <dt>Gi eller trekk stjerner</dt>
              <dd>Gå til Barn, finn barnet og bruk Juster saldo. Skriv årsak og trykk Gi eller Trekk.</dd>
              <dt>Livstidsstjerner</dt>
              <dd>Brukes til nivåer. Juster bare ved korreksjon eller test, siden dette påvirker nivåfremdriften.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Deling i familien</h3>
            <dl>
              <dt>Barneenhet</dt>
              <dd>Gå til Deling og bruk familiekode eller koblingslenke. Barn trenger ikke Google-innlogging.</dd>
              <dt>Felles iPad/tablet</dt>
              <dd>Koble til med familiekode og velg Profilvalg som standard. Da kan alle velge sin profil.</dd>
              <dt>Ny voksen</dt>
              <dd>Lag vokseninvitasjon fra Deling. Den voksne åpner lenken og logger inn med Google.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Synk og sikkerhet</h3>
            <dl>
              <dt>Sky-synk</dt>
              <dd>Grønn synk betyr at appen lagrer mot Firestore. Hvis noe virker feil, åpne appen på nytt og vent litt.</dd>
              <dt>Backup</dt>
              <dd>Backup og flytting lar voksne hente skybackuper og gjenopprette data hvis noe går galt.</dd>
              <dt>Nullstilling</dt>
              <dd>Nullstilling starter enheten/familien på nytt og krever voksen-PIN. Brukes med varsomhet.</dd>
            </dl>
          </article>
          <article class="help-card">
            <h3>Driftsstatus</h3>
            <dl>
              <dt>Hva deles</dt>
              <dd>Appen kan sende enkel teknisk status til utvikler: appversjon, siste synk, backupstatus, feil og antall barn/oppgaver/fullføringer.</dd>
              <dt>Hva deles ikke</dt>
              <dd>Barnenavn, oppgaveinnhold, belønninger, stjerner per barn og detaljert aktivitet vises ikke i driftspanelet.</dd>
              <dt>Hvorfor</dt>
              <dd>Dette gjør det enklere å oppdage synkfeil og gamle appversjoner hos pilotfamilier uten innsyn i familiens bruk.</dd>
            </dl>
          </article>
        </div>
      </section>
    </section>
  `;
}

function settingsFamily() {
  const adults = activeAdultUsers();
  const ownerAccess = hasOwnerAccess();
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
          <input name="familyId" type="text" value="${escapeAttr(state.familyId || "local-family")}" ${ownerAccess ? "" : "readonly"} required>
          <small>${ownerAccess ? "Endring av familie-id påvirker sky-stien." : "Bare Google-eier kan endre familie-id."}</small>
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
          <p class="muted">Eksporter lokalt, hent skybackuper og sammenlign før du gjenoppretter.</p>
        </div>
        ${settingsBackButton()}
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="export-data">Eksporter data</button>
        <button class="btn secondary" data-action="choose-import">Importer data</button>
        <button class="btn secondary" data-action="list-cloud-backups">Hent skybackuper</button>
      </div>
      <input class="visually-hidden" id="import-file" type="file" accept="application/json,.json" data-import-file>
      <p class="small">Import erstatter dataene på denne enheten. Ta alltid eksport først.</p>
      <div class="backup-restore-box">
        <div class="section-title compact-title">
          <div>
            <h3>Skybackup</h3>
            <p class="muted">Se forskjeller, last ned JSON eller gjenopprett hele eller deler av en backup.</p>
          </div>
        </div>
        ${cloud.backupListStatus ? `<p class="small">${escapeText(cloud.backupListStatus)}</p>` : ""}
        ${cloud.backupRestoreStatus ? `<p class="small">Gjenoppretting: ${escapeText(cloud.backupRestoreStatus)}</p>` : ""}
        ${cloud.backupRestoreError ? `<p class="small">Gjenopprettingsfeil: ${escapeText(cloud.backupRestoreError)}</p>` : ""}
        ${cloud.backupList?.length ? cloudBackupList() : `<div class="empty">Ingen skybackuper hentet i denne økten.</div>`}
      </div>
    </section>
  `;
}

function settingsSharingReady() {
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Klar for deling</h2>
          <p class="muted">Siste tekniske kontroll før appen deles med andre enheter eller familier.</p>
        </div>
        ${settingsBackButton("advanced")}
      </div>
      ${sharingReadinessPanel()}
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h3>Anbefalt før du sender lenke</h3>
            <p class="muted">Dette reduserer risikoen for forvirring og gamle data.</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn secondary" data-action="force-cloud-fetch">Hent nyeste data</button>
          <button class="btn secondary" data-action="force-cloud-save">Lagre til sky nå</button>
          <button class="btn secondary" data-action="list-cloud-backups">Hent skybackuper</button>
          <button class="btn secondary" data-action="adult-tab" data-tab="share">Åpne Deling</button>
          <button class="btn secondary" data-action="settings-page" data-page="share-new-family">Del med ny familie</button>
        </div>
        <div class="share-status-grid" style="margin-top:14px">
          <div><strong>Familie</strong><span>${escapeText(state.familyName || "-")}</span></div>
          <div><strong>Familie-id</strong><span>${escapeText(state.familyId || "-")}</span></div>
          <div><strong>Sky-sti</strong><span>${escapeText(cloudPathLabel())}</span></div>
          <div><strong>Appversjon</strong><span>${APP_VERSION}</span></div>
          <div><strong>Skyrevisjon</strong><span>${Number(state.cloudRevision) || 0}</span></div>
          <div><strong>Siste synk</strong><span>${state.lastCloudSyncAt ? formatDate(state.lastCloudSyncAt) : "-"}</span></div>
        </div>
      </section>
    </section>
  `;
}

function settingsShareNewFamily() {
  const startLink = newFamilyStartLink();
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Del med ny familie</h2>
          <p class="muted">Lenken under starter en helt ny familie uten å koble til dine familiedata.</p>
        </div>
        ${settingsBackButton("advanced")}
      </div>
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h3>Startlenke for første voksne</h3>
            <p class="muted">Send denne til den voksne som skal eie sin egen familie i appen.</p>
          </div>
          <span class="pill done">Trygg å dele</span>
        </div>
        <div class="share-link-box">${escapeText(startLink)}</div>
        <div class="actions" style="margin-top:14px">
          <button class="btn" data-action="copy-new-family-link">Kopier startlenke</button>
          <button class="btn secondary" data-action="settings-page" data-page="sharing-ready">Sjekk din deling</button>
        </div>
      </section>
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h3>Slik starter en ny familie</h3>
            <p class="muted">Dette er flyten personen møter når appen åpnes for første gang.</p>
          </div>
        </div>
        <div class="guide-steps">
          <div>
            <strong>1. Åpne startlenken</strong>
            <span>Appen viser oppstartsveilederen, ikke dine barn, oppgaver eller belønninger.</span>
          </div>
          <div>
            <strong>2. Logg inn med Google</strong>
            <span>Minst én voksen blir Google-eier. Det gjør deling og voksenrettigheter ryddige.</span>
          </div>
          <div>
            <strong>3. Sett opp familien</strong>
            <span>Legg inn barn, velg startpakker og importer standardoppgaver eller belønninger.</span>
          </div>
          <div>
            <strong>4. Del internt</strong>
            <span>Etterpå kan familien bruke familiekode til barnas enheter og vokseninvitasjon til andre voksne.</span>
          </div>
        </div>
        <div class="setup-note">
          Alt kan endres senere fra voksenpanelet. Startlenken er bare inngangen til en ny familie, og den inneholder ikke din familiekode.
        </div>
      </section>
    </section>
  `;
}

function settingsPilotShare() {
  const text = currentPilotShareText();
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Send til pilotfamilie</h2>
          <p class="muted">Kopier en ferdig introduksjonstekst når appen skal testes av en ny familie.</p>
        </div>
        ${settingsBackButton("advanced")}
      </div>
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h3>Pilotmelding</h3>
            <p class="muted">Teksten bruker startlenken for ny familie og forklarer første oppsett.</p>
          </div>
          <div class="actions">
            <button class="btn" data-action="save-pilot-message">Lagre tekst</button>
            <button class="btn secondary" data-action="copy-pilot-message">Kopier tekst</button>
          </div>
        </div>
        <textarea class="copy-textarea" data-pilot-message>${escapeText(text)}</textarea>
        <div class="actions" style="margin-top:14px">
          <button class="btn secondary" data-action="reset-pilot-message">Tilbakestill til standardtekst</button>
        </div>
      </section>
      <section class="panel">
        <div class="section-title compact-title">
          <div>
            <h3>Før du sender</h3>
            <p class="muted">Kort intern sjekkliste for pilot.</p>
          </div>
        </div>
        <div class="guide-steps">
          <div><strong>Startlenke</strong><span>Send bare startlenken uten familiekode, slik at de lager sin egen familie.</span></div>
          <div><strong>Google-eier</strong><span>Minst en voksen i pilotfamilien logger inn med Google og blir eier.</span></div>
          <div><strong>Familiekode</strong><span>Barna og felles tablet kobles etterpå fra Deling-fanen i deres egen familie.</span></div>
          <div><strong>Support</strong><span>Ved feil kan de sende bilde fra Innstillinger, Avansert og drift, App, sky og diagnose.</span></div>
        </div>
      </section>
    </section>
  `;
}

function currentPilotShareText() {
  return state.pilotShareText || defaultPilotShareText();
}

function defaultPilotShareText() {
  return [
    "Hei! Her er lenken til Familieoppdrag, slik at dere kan teste appen med deres egen familie:",
    "",
    newFamilyStartLink(),
    "",
    "Slik kommer dere i gang:",
    "1. Åpne lenken på telefon eller PC.",
    "2. En voksen logger inn med Google og blir eier av familien.",
    "3. Følg oppstartsveilederen: legg inn barn, velg startpakker og sett voksen-PIN.",
    "4. Når familien er opprettet, åpne Deling i voksenpanelet.",
    "5. Bruk familiekode eller koblingslenke for barnas iPad/tablet eller en felles enhet.",
    "6. På barnas enheter trenger dere ikke Google-innlogging. Velg barnets profil eller Profilvalg som standard.",
    "7. For best opplevelse bør appen legges på hjemskjermen på iPad/tablet/mobil.",
    "",
    "Kort forklart:",
    "- Standard gjør at enheten åpner rett på valgt skjerm neste gang.",
    "- Hjem går tilbake til profilvelgeren.",
    "- Lås låser voksenpanelet og krever PIN for å åpne igjen.",
    "- Oppgaver, belønninger, barn og ekstra stjerner styres fra voksenpanelet.",
    "- Hjelp og brukerveileder ligger under Innstillinger.",
    "",
    "Hvis noe ikke synker eller oppfører seg rart, send meg gjerne et skjermbilde fra Innstillinger > Avansert og drift > App, sky og diagnose."
  ].join("\n");
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
        ${settingsBackButton("advanced")}
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
      <p class="small">Lokal sky-revisjon: ${Number(state.cloudRevision) || 0}</p>
      <p class="small">Siste sky-revisjon sett: ${Number(cloud.remoteRevision) || 0}</p>
      ${cloud.staleWriteBlockedAt ? `<p class="small">Sist blokkert gammel lagring: ${formatDate(cloud.staleWriteBlockedAt)}</p>` : ""}
      ${cloud.staleWriteMessage ? `<p class="small">Synkvern: ${escapeText(cloud.staleWriteMessage)}</p>` : ""}
      ${cloud.backupLastAt ? `<p class="small">Siste skybackup: ${formatDate(cloud.backupLastAt)} (rev. ${Number(cloud.backupLastRevision) || 0})</p>` : ""}
      ${cloud.backupStatus ? `<p class="small">Backup-status: ${escapeText(cloud.backupStatus)}</p>` : ""}
      ${cloud.backupError ? `<p class="small">Backup-feil: ${escapeText(cloud.backupError)}</p>` : ""}
      ${cloud.backupListStatus ? `<p class="small">Backup-liste: ${escapeText(cloud.backupListStatus)}</p>` : ""}
      ${cloud.backupRestoreStatus ? `<p class="small">Gjenoppretting: ${escapeText(cloud.backupRestoreStatus)}</p>` : ""}
      ${cloud.backupRestoreError ? `<p class="small">Gjenopprettingsfeil: ${escapeText(cloud.backupRestoreError)}</p>` : ""}
      ${cloud.mergeLastAt ? `<p class="small">Siste safe merge: ${formatDate(cloud.mergeLastAt)}</p>` : ""}
      ${cloud.mergeLastSummary ? `<p class="small">Safe merge: ${escapeText(cloud.mergeLastSummary)}</p>` : ""}
      ${cloud.manualFetchLastAt ? `<p class="small">Sist hentet manuelt: ${formatDate(cloud.manualFetchLastAt)}</p>` : ""}
      ${cloud.manualFetchStatus ? `<p class="small">Manuell henting: ${escapeText(cloud.manualFetchStatus)}</p>` : ""}
      ${cloud.manualFetchError ? `<p class="small">Manuell hente-feil: ${escapeText(cloud.manualFetchError)}</p>` : ""}
      ${cloud.lastSavedAt ? `<p class="small">Sist lagret til sky: ${formatDate(cloud.lastSavedAt)}</p>` : ""}
      ${cloud.lastFetchedAt ? `<p class="small">Sist hentet fra sky: ${formatDate(cloud.lastFetchedAt)}</p>` : ""}
      ${state.syncDiagnostics?.lastTestAt ? `<p class="small">Siste synk-test: ${formatDate(state.syncDiagnostics.lastTestAt)} fra ${escapeText(state.syncDiagnostics.lastTestDevice || "ukjent enhet")}</p>` : ""}
      ${cloud.error ? `<p class="small">Sky-feil: ${escapeText(cloud.error)}</p>` : ""}
      <div class="diagnosis-box">
        <pre>${escapeText(diagnosis)}</pre>
      </div>
      ${cloudOpsOverview()}
      <div class="backup-restore-box">
        <div class="section-title compact-title">
          <div>
            <h3>Skybackup</h3>
            <p class="muted">Hent siste backupkopier og gjenopprett bare hvis familiedata faktisk må rulles tilbake.</p>
          </div>
          <button class="btn secondary" data-action="list-cloud-backups">Hent backuper</button>
        </div>
        ${cloud.backupList?.length ? cloudBackupList() : `<div class="empty">Ingen backuper hentet i denne økten.</div>`}
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="force-cloud-fetch">Hent nyeste data</button>
        <button class="btn secondary" data-action="force-cloud-save">Lagre til sky nå</button>
        <button class="btn secondary" data-action="migrate-cloud-family" ${canMigrate ? "" : "disabled"}>Flytt til familie-sti</button>
        <button class="btn secondary" data-action="test-cloud-sync">Test sky-synk</button>
        <button class="btn secondary" data-action="copy-diagnosis">Kopier diagnose</button>
        <button class="btn secondary" data-action="refresh-app">Oppdater app</button>
      </div>
    </section>
  `;
}

function cloudBackupList() {
  return `
    <div class="backup-list">
      ${cloud.backupList.map((backup) => `
        <article class="backup-item">
          <div>
            <strong>${escapeText(backup.reason || "Backup")}</strong>
            <p class="muted">${backup.createdAt ? formatDate(backup.createdAt) : "Ukjent tidspunkt"} · rev. ${Number(backup.cloudRevision) || 0}</p>
            <p class="small">${backupSummaryText(backup.state)} · ${escapeText(backup.id)}</p>
            <p class="small">${backupDiffSummary(backup.state)}</p>
          </div>
          <div class="actions">
            <button class="btn secondary" data-action="export-cloud-backup" data-backup-id="${escapeAttr(backup.id)}">Last ned JSON</button>
            <button class="btn warning" data-action="preview-cloud-backup" data-backup-id="${escapeAttr(backup.id)}" ${isCurrentOwner() ? "" : "disabled"}>Sammenlign</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function cloudOpsOverview() {
  const health = dataModelHealth();
  return `
    <div class="ops-grid">
      <article class="ops-card">
        <strong>Datamodell</strong>
        <p class="muted">Nå: samlet appState med revisjonsvern.</p>
        <div class="pill-row">
          <span class="pill ${health.status}">${health.label}</span>
          <span class="pill">Schema ${state.schemaVersion || SCHEMA_VERSION}</span>
        </div>
      </article>
      <article class="ops-card">
        <strong>Drift</strong>
        <p class="muted">Siste synk og backup for denne familien.</p>
        <div class="pill-row">
          <span class="pill ${cloud.ready ? "done" : "pending"}">${cloud.ready ? "Sky klar" : "Sky venter"}</span>
          <span class="pill">${Number(state.cloudRevision) || 0} rev.</span>
        </div>
      </article>
      <article class="ops-card">
        <strong>Neste datamodell</strong>
        <p class="muted">Anbefalt neste større steg er delt Firestore-modell for oppgaver, barn og fullføringer.</p>
        <span class="pill pending">Planlagt, ikke migrert</span>
      </article>
    </div>
  `;
}

function dataModelHealth() {
  if (!state.setupCompleted) return { status: "pending", label: "Ikke satt opp" };
  if (cloud.ready && Number(state.cloudRevision) > 0) return { status: "done", label: "Beskyttet" };
  return { status: "pending", label: "Venter på revisjon" };
}

function backupSummaryText(snapshotState) {
  if (!snapshotState) return "Ingen innholdsoversikt";
  return `${snapshotState.children?.length || 0} barn · ${snapshotState.tasks?.length || 0} oppgaver · ${snapshotState.completions?.length || 0} fullføringer`;
}

function backupDiffSummary(snapshotState) {
  const changes = compareStateSnapshots(state, snapshotState).filter((item) => item.changed);
  if (!changes.length) return "Ingen tydelige forskjeller mot lokal data.";
  return changes.slice(0, 3).map((item) => `${item.label}: ${item.current} nå / ${item.backup} i backup`).join(" · ");
}

function compareStateSnapshots(currentState = {}, backupState = {}) {
  const rows = [
    ["children", "Barn"],
    ["tasks", "Oppgaver"],
    ["rewards", "Belønninger"],
    ["completions", "Fullføringer"],
    ["transactions", "Transaksjoner"],
    ["redemptions", "Belønninger i flyt"],
    ["history", "Historikk"],
    ["badges", "Merker"],
    ["adultUsers", "Voksne"],
    ["familyDevices", "Enheter"],
    ["inviteCodes", "Invitasjoner"]
  ].map(([key, label]) => {
    const current = Array.isArray(currentState[key]) ? currentState[key].length : 0;
    const backup = Array.isArray(backupState?.[key]) ? backupState[key].length : 0;
    return { key, label, current, backup, changed: current !== backup };
  });
  rows.unshift({
    key: "cloudRevision",
    label: "Skyrevisjon",
    current: Number(currentState.cloudRevision) || 0,
    backup: Number(backupState?.cloudRevision) || 0,
    changed: (Number(currentState.cloudRevision) || 0) !== (Number(backupState?.cloudRevision) || 0)
  });
  rows.unshift({
    key: "updatedAt",
    label: "Sist oppdatert",
    current: currentState.updatedAt ? formatDate(currentState.updatedAt) : "-",
    backup: backupState?.updatedAt ? formatDate(backupState.updatedAt) : "-",
    changed: Boolean(currentState.updatedAt || backupState?.updatedAt) && currentState.updatedAt !== backupState?.updatedAt
  });
  return rows;
}

function backupDiffTable(snapshotState) {
  const rows = compareStateSnapshots(state, snapshotState);
  return `
    <div class="table-wrap backup-diff">
      <table>
        <thead>
          <tr><th>Område</th><th>Nå</th><th>Backup</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${escapeText(row.label)}</td>
              <td>${escapeText(row.current)}</td>
              <td>${escapeText(row.backup)}</td>
              <td><span class="pill ${row.changed ? "pending" : "done"}">${row.changed ? "Forskjell" : "Lik"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function restoreBackupModal(backupId) {
  const backup = cloud.backupList.find((item) => item.id === backupId);
  if (!backup) return "";
  const snapshot = backup.state || {};
  return `
    <div class="modal-backdrop">
      <form class="modal restore-modal" data-form="restore-cloud-backup">
        <input type="hidden" name="backupId" value="${escapeAttr(backupId)}">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Skybackup</p>
            <h2>Gjenopprett backup</h2>
          </div>
          <button class="btn secondary icon-btn" type="button" data-action="close-restore-backup" aria-label="Lukk">✕</button>
        </div>
        <div class="setup-note warning-note">
          Dette ruller familien tilbake til valgt backup. Nåværende skydata sikkerhetskopieres først. Bare Google-eier kan gjøre dette.
        </div>
        <div class="setup-summary">
          <div><strong>Tidspunkt</strong><span>${backup.createdAt ? formatDate(backup.createdAt) : "Ukjent"}</span></div>
          <div><strong>Revisjon</strong><span>${Number(backup.cloudRevision) || 0}</span></div>
          <div><strong>Familie</strong><span>${escapeText(snapshot.familyName || backup.familyName || "-")}</span></div>
          <div><strong>Innhold</strong><span>${backupSummaryText(snapshot)}</span></div>
        </div>
        <h3>Sammenligning</h3>
        ${backupDiffTable(snapshot)}
        <div class="field">
          <label>Hva skal gjenopprettes?</label>
          <select name="restoreScope">
            <option value="full">Hele familien</option>
            <option value="tasks">Bare oppgaver</option>
            <option value="rewards">Bare belønninger</option>
            <option value="children">Bare barn/profiler</option>
            <option value="activity">Fullføringer, stjerner og historikk</option>
          </select>
          <small>Ved delvis gjenoppretting beholdes resten av dagens data.</small>
        </div>
        <div class="field">
          <label>Voksen-PIN</label>
          <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus>
          <small>PIN kreves i tillegg til Google-eier.</small>
        </div>
        <div class="field">
          <label>Skriv GJENOPPRETT</label>
          <input name="confirmText" type="text" autocomplete="off" required>
          <small>Dette er en ekstra sperre før data endres.</small>
        </div>
        <div class="actions" style="margin-top:14px">
          <button class="btn warning" type="submit">Gjenopprett backup</button>
          <button class="btn secondary" type="button" data-action="export-cloud-backup" data-backup-id="${escapeAttr(backupId)}">Last ned JSON</button>
          <button class="btn secondary" type="button" data-action="close-restore-backup">Avbryt</button>
        </div>
      </form>
    </div>
  `;
}

function settingsAdmin() {
  const canRead = isDeveloperAdmin();
  const currentSnapshot = currentFamilyAdminSnapshot();
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Drift/admin</h2>
          <p class="muted">Teknisk status for pilotfamilier uten innsyn i barnas innhold.</p>
        </div>
        ${settingsBackButton("advanced")}
      </div>
      <div class="setup-note ${canRead ? "" : "warning-note"}">
        ${canRead
          ? `Denne visningen leser driftsmetadata fra ${adminHealthCollectionName()}. Den endrer ikke familiedata.`
          : `Drift/admin krever Google-innlogging som utvikleradmin (${DEVELOPER_ADMIN_EMAILS[0]}). Du kan fortsatt bruke resten av appen normalt.`}
      </div>
      <div class="admin-local-snapshot">
        <div>
          <strong>Denne familien</strong>
          <span>${escapeText(currentSnapshot.familyName || "-")} · ${escapeText(currentSnapshot.cloudFamilyId || "-")}</span>
        </div>
        <div>
          <strong>Siste synk</strong>
          <span>${formatMaybeDate(currentSnapshot.lastCloudSyncAt || currentSnapshot.updatedAt)}</span>
        </div>
        <div>
          <strong>Innhold</strong>
          <span>${Number(currentSnapshot.childrenCount) || 0} barn · ${Number(currentSnapshot.tasksCount) || 0} oppgaver · ${Number(currentSnapshot.completionsCount) || 0} fullføringer</span>
        </div>
      </div>
      ${canRead ? "" : `
        <div class="auth-status-card pending">
          <div>
            <strong>Google-eier kreves</strong>
            <small>${escapeText(googleOwnerLabel())}</small>
          </div>
          <button class="btn secondary" type="button" data-action="developer-admin-login">Logg inn med Google</button>
        </div>
      `}
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="load-admin-families" ${canRead ? "" : "disabled"}>Hent driftsstatus</button>
        <button class="btn secondary" data-action="force-cloud-save">Oppdater min families status</button>
        <button class="btn secondary" data-action="load-current-admin-family">Vis denne familien</button>
        <button class="btn secondary" data-action="copy-admin-summary" ${cloud.adminFamilies.length ? "" : "disabled"}>Kopier oversikt</button>
      </div>
      ${cloud.adminStatus ? `<p class="small">${escapeText(cloud.adminStatus)}</p>` : ""}
      ${cloud.adminError ? `<p class="small">Admin-feil: ${escapeText(cloud.adminError)}</p>` : ""}
      ${cloud.adminError ? adminRulesHint() : ""}
      ${cloud.adminFamilies.length ? adminFamilyTable() : `<div class="empty">Ingen familier hentet i denne økten.</div>`}
    </section>
  `;
}

function adminRulesHint() {
  return `
    <div class="setup-note warning-note">
      Hvis du vil se alle familier her, må Firestore rules tillate utvikleradmin å lese <strong>${escapeText(adminHealthCollectionName())}</strong>.
      Inntil videre kan du bruke <strong>Vis denne familien</strong> for trygg lokal drift uten ekstra rules.
    </div>
  `;
}

function adminFamilyTable() {
  return `
    <div class="table-wrap admin-table">
      <table>
        <thead>
          <tr>
            <th>Familie</th>
            <th>App</th>
            <th>Siste synk</th>
            <th>Rev.</th>
            <th>Innhold</th>
            <th>Backup</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${cloud.adminFamilies.map((family) => `
            <tr>
              <td>
                <strong>${escapeText(family.familyName || "-")}</strong>
                <div class="small">${escapeText(family.cloudFamilyId || family.familyId || "-")}</div>
                <div class="small">${escapeText(family.source || cloud.adminSource || adminHealthCollectionName())}</div>
              </td>
              <td>${escapeText(family.appVersion || "-")}</td>
              <td>${formatMaybeDate(family.lastCloudSyncAt || family.lastSeenAt || family.updatedAt)}</td>
              <td>${Number(family.cloudRevision) || 0}</td>
              <td>${Number(family.childrenCount) || 0} barn<br>${Number(family.tasksCount) || 0} oppg.<br>${Number(family.completionsCount) || 0} fullf.</td>
              <td>${family.lastBackupAt ? formatMaybeDate(family.lastBackupAt) : "-"}<br>rev. ${Number(family.lastBackupRevision) || 0}</td>
              <td><span class="pill ${adminFamilyStatusClass(family)}">${escapeText(adminFamilyStatusLabel(family))}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminFamilyStatusClass(family) {
  if (family.error || family.lastError) return "rejected";
  if (appVersionNumber(family.appVersion) < appVersionNumber(family.minSupportedAppVersion || MIN_SUPPORTED_APP_VERSION)) return "warning";
  if (appVersionNumber(family.appVersion) < appVersionNumber(APP_VERSION)) return "warning";
  if (family.pendingSave && !family.lastCloudSyncAt) return "pending";
  if (!family.lastCloudSyncAt && !family.updatedAt) return "pending";
  return "done";
}

function adminFamilyStatusLabel(family) {
  if (family.error || family.lastError) return family.error || family.lastError;
  if (appVersionNumber(family.appVersion) < appVersionNumber(family.minSupportedAppVersion || MIN_SUPPORTED_APP_VERSION)) return "Bør oppdatere";
  if (appVersionNumber(family.appVersion) < appVersionNumber(APP_VERSION)) return "Ny versjon finnes";
  if (family.pendingSave && !family.lastCloudSyncAt) return "Venter på lagring";
  if (!family.lastCloudSyncAt && !family.updatedAt) return "Mangler synk";
  return "OK";
}

function settingsDataMigration() {
  const plan = migrationPlanItems();
  const checks = migrationReadinessChecks();
  const ready = checks.every((item) => item.ok);
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>Datamodell og migrering</h2>
          <p class="muted">Forbered neste Firestore-modell uten å flytte data ennå.</p>
        </div>
        ${settingsBackButton("advanced")}
      </div>
      <div class="setup-note">
        Dagens modell lagrer hele familien i ett dokument: ${escapeText(cloudPathLabel())}. Neste modell bør dele opp barn, oppgaver, fullføringer og belønninger i egne samlinger når flere familier bruker appen.
      </div>
      <div class="ops-grid">
        <article class="ops-card">
          <strong>Dagens modell</strong>
          <p class="muted">Én samlet appState med cloudRevision, backup og stale-write-vern.</p>
          <span class="pill done">I drift</span>
        </article>
        <article class="ops-card">
          <strong>Neste modell</strong>
          <p class="muted">families/{id}/children, tasks, completions, rewards, redemptions og settings.</p>
          <span class="pill pending">Planlagt</span>
        </article>
        <article class="ops-card">
          <strong>Klarhet</strong>
          <p class="muted">${ready ? "Data ser klar ut for en fremtidig testmigrering." : "Noen punkter bør ryddes før migrering."}</p>
          <span class="pill ${ready ? "done" : "pending"}">${ready ? "Klar" : "Må sjekkes"}</span>
        </article>
      </div>
      <h3>Validering</h3>
      <div class="checklist migration-checklist">
        ${checks.map((item) => `
          <div class="check-item ${item.ok ? "done" : "pending"}">
            <span>${item.ok ? "✓" : "!"}</span>
            <div>
              <strong>${escapeText(item.title)}</strong>
              <small>${escapeText(item.description)}</small>
            </div>
          </div>
        `).join("")}
      </div>
      <h3>Migreringsplan</h3>
      <div class="migration-plan">
        ${plan.map((item, index) => `
          <article class="migration-step">
            <span>${index + 1}</span>
            <div>
              <strong>${escapeText(item.title)}</strong>
              <p class="muted">${escapeText(item.description)}</p>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="copy-migration-report">Kopier migreringsrapport</button>
      </div>
    </section>
  `;
}

function migrationReadinessChecks() {
  const ids = new Set();
  const duplicateTaskIds = (state.tasks || []).some((task) => {
    if (!task.id) return true;
    if (ids.has(task.id)) return true;
    ids.add(task.id);
    return false;
  });
  return [
    {
      title: "Familie har stabil sky-sti",
      description: cloudFamilyId() && cloudFamilyId() === suggestedCloudFamilyId()
        ? `Bruker ${cloudFamilyId()}.`
        : `Anbefalt sti er ${suggestedCloudFamilyId()}.`,
      ok: Boolean(cloudFamilyId()) && cloudFamilyId() === suggestedCloudFamilyId()
    },
    {
      title: "Første skyhent er ferdig",
      description: cloud.initialFetchComplete ? "Denne enheten har hentet skydata i økten." : "Vent til skydata er hentet før migrering planlegges.",
      ok: cloud.initialFetchComplete
    },
    {
      title: "Revisjonsvern er aktivt",
      description: Number(state.cloudRevision) > 0 ? `Lokal revisjon ${Number(state.cloudRevision)}.` : "Mangler skyrevisjon.",
      ok: Number(state.cloudRevision) > 0
    },
    {
      title: "Oppgave-id-er er unike",
      description: duplicateTaskIds ? "Fant manglende eller dupliserte oppgave-id-er." : `${state.tasks?.length || 0} oppgaver har unike id-er.`,
      ok: !duplicateTaskIds
    },
    {
      title: "Backup finnes",
      description: cloud.backupLastAt || cloud.backupList?.length ? "Backup er registrert i denne økten." : "Hent eller lag en backup før migrering.",
      ok: Boolean(cloud.backupLastAt || cloud.backupList?.length)
    }
  ];
}

function migrationPlanItems() {
  return [
    {
      title: "Frys dagens appState som backup",
      description: "Skriv en skybackup rett før migreringen starter, slik at hele familien kan rulles tilbake."
    },
    {
      title: "Opprett nye samlinger parallelt",
      description: "Skriv barn, oppgaver, belønninger, fullføringer og innstillinger til egne Firestore-samlinger uten å slette appState."
    },
    {
      title: "Les fra ny modell i testmodus",
      description: "La appen validere at ny modell gir samme tall som gammel modell før produksjon slås over."
    },
    {
      title: "Slå over familie for familie",
      description: "Bruk en migreringsstatus per familie slik at én familie kan testes før flere følger etter."
    }
  ];
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
    const streakResult = updateChildStreak(childId, completion.date);
    const result = awardPoints(childId, task.points, `Fullført: ${task.title}`, completion.id, "task");
    celebrateTaskResult(task.points, result, { childId, task, streakResult });
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
  updateChildStreak(completion.childId, completion.date);
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
  view.appUpdateAvailable = false;
  view.appUpdateReloading = true;
  view.serviceWorkerWaiting = null;
  render();
  showToast("Oppdaterer appen ...");
  try {
    await hardRefreshAppShell();
  } finally {
    window.setTimeout(() => reloadWithoutAppCache(), 500);
  }
}

async function applyAppUpdate() {
  view.appUpdateReloading = true;
  view.appUpdateAvailable = false;
  view.serviceWorkerWaiting = null;
  render();
  showToast("Oppdaterer appen ...");
  try {
    if (cloud.pendingSave) {
      await flushCloudSave();
    }
    await hardRefreshAppShell();
  } catch (error) {
    console.warn("Could not apply app update:", error);
  }
  window.setTimeout(() => reloadWithoutAppCache(), 500);
}

async function hardRefreshAppShell() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(async (registration) => {
      try {
        await registration.update();
        const waiting = registration.waiting || registration.installing;
        waiting?.postMessage?.({ type: "SKIP_WAITING" });
        await registration.unregister();
      } catch (error) {
        console.warn("Could not reset service worker:", error);
      }
    }));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("familieoppdrag-")).map((key) => caches.delete(key)));
  }
}

function reloadWithoutAppCache() {
  const url = new URL(window.location.href);
  url.searchParams.set("appRefresh", Date.now().toString());
  window.location.replace(url.toString());
  window.setTimeout(() => {
    window.location.href = url.toString();
  }, 1200);
}

function markAppUpdateAvailable(registration) {
  if (view.appUpdateReloading) return;
  view.serviceWorkerRegistration = registration || view.serviceWorkerRegistration;
  view.serviceWorkerWaiting = registration?.waiting || view.serviceWorkerWaiting;
  view.appUpdateAvailable = true;
  view.appUpdateInstalling = false;
  if (!view.booting) render();
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
      bestStreak: 0,
      lastStreakDate: null,
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
  if (familyId !== previousFamilyId && !requireOwnerAccess("Bare Google-eier kan endre familie-id.")) return;
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
  downloadJson(payload, `familieoppdrag-${state.familyId || "backup"}-${dateKey()}.json`);
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
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
      bestStreak: 0,
      lastStreakDate: null,
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

function completedTaskCountThisWeek(childId) {
  const currentWeek = weekId();
  return state.completions.filter((item) =>
    item.childId === childId &&
    ["completed", "approved"].includes(item.status) &&
    (item.weekId || weekId(new Date(item.completedAt || item.approvedAt || Date.now()))) === currentWeek
  ).length;
}

function weeklyGoalProgress(childId) {
  const done = completedTaskCountThisWeek(childId);
  const target = Math.max(10, done > 0 && done % 10 === 0 ? done : Math.ceil(Math.max(1, done + 1) / 10) * 10);
  return {
    done,
    target,
    missing: Math.max(0, target - done),
    percent: Math.min(100, Math.round((done / target) * 100)),
    badgeText: target <= 10 ? "Første ukemål" : `Neste: ${target} oppdrag`
  };
}

function updateChildStreak(childId, completionDate = dateKey()) {
  const child = getChild(childId);
  if (!child) return { current: 0, previous: 0, increased: false, best: 0, newBest: false };
  const previous = Number(child.streak) || 0;
  const current = calculateTaskStreak(childId, completionDate);
  const previousBest = Number(child.bestStreak) || previous;
  child.streak = current;
  child.bestStreak = Math.max(previousBest, current);
  child.lastStreakDate = completionDate;
  return {
    current,
    previous,
    increased: current > previous,
    best: child.bestStreak,
    newBest: current > previousBest
  };
}

function calculateTaskStreak(childId, endDate = dateKey()) {
  const dates = new Set(state.completions
    .filter((item) => item.childId === childId && ["completed", "approved"].includes(item.status))
    .map((item) => item.date || dateKey(new Date(item.completedAt || item.approvedAt || Date.now()))));
  let streak = 0;
  let cursor = endDate;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
}

function previousDateKey(value) {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return dateKey(date);
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

function formatMaybeDate(value) {
  if (!value) return "-";
  if (typeof value?.toDate === "function") return formatDate(value.toDate());
  if (typeof value?.seconds === "number") return formatDate(new Date(value.seconds * 1000));
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : formatDate(date);
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

function syncStatusBanner() {
  if (view.booting || isSetupPreview()) return "";
  const status = syncBannerStatus();
  if (!status) return "";
  return `
    <aside class="sync-banner ${status.kind}" role="status" aria-live="polite">
      <div class="sync-banner-icon">${status.icon}</div>
      <div>
        <strong>${escapeText(status.title)}</strong>
        <p>${escapeText(status.text)}</p>
      </div>
      ${status.action ? `<button class="btn secondary" type="button" data-action="${status.action}">${status.actionLabel}</button>` : ""}
    </aside>
  `;
}

function syncBannerStatus() {
  if (view.appUpdateReloading) return null;
  if (view.appUpdateAvailable) {
    return {
      kind: "update",
      icon: "↻",
      title: "Ny versjon er klar",
      text: view.appUpdateReloading ? "Oppdaterer appen ..." : "Trykk Oppdater app når det passer, så lastes siste versjon inn.",
      action: view.appUpdateReloading ? "" : "apply-app-update",
      actionLabel: "Oppdater app"
    };
  }
  if (!isAppVersionSupported()) {
    return {
      kind: "rejected",
      icon: "!",
      title: "Appen må oppdateres",
      text: versionBlockedMessage(),
      action: view.serviceWorkerWaiting ? "apply-app-update" : "refresh-app",
      actionLabel: "Oppdater app"
    };
  }
  if (!cloud.enabled) return null;
  if (cloud.error) {
    const canFetch = cloud.ready && cloud.initialFetchComplete;
    return {
      kind: "rejected",
      icon: "!",
      title: "Sky-synk trenger oppmerksomhet",
      text: cloud.error,
      action: canFetch ? "force-cloud-fetch" : "refresh-app",
      actionLabel: canFetch ? "Hent nyeste" : "Prøv igjen"
    };
  }
  if (!cloud.ready || !cloud.initialFetchComplete) {
    return {
      kind: "pending",
      icon: "...",
      title: "Henter nyeste familiedata",
      text: "Vent litt før du registrerer nye oppgaver på denne enheten."
    };
  }
  if (cloud.pendingSave) {
    return {
      kind: "pending",
      icon: "...",
      title: "Lagrer til sky",
      text: "Endringer på denne enheten er ikke ferdig lagret ennå."
    };
  }
  if (cloud.staleWriteBlockedAt && isRecentEvent(cloud.staleWriteBlockedAt, 10)) {
    return {
      kind: "warning",
      icon: "!",
      title: "Gammel lokal data ble stoppet",
      text: cloud.staleWriteMessage || "Nyeste familiedata er hentet fra skyen.",
      action: "force-cloud-fetch",
      actionLabel: "Sjekk igjen"
    };
  }
  if (cloud.mergeLastAt && isRecentEvent(cloud.mergeLastAt, 10)) {
    return {
      kind: "done",
      icon: "✓",
      title: "Offline-endringer ble flettet inn",
      text: cloud.mergeLastSummary || "Lokale endringer er tatt vare på og synkes videre.",
      action: "force-cloud-fetch",
      actionLabel: "Sjekk sky"
    };
  }
  return null;
}

function isRecentEvent(value, minutes) {
  const time = new Date(value || 0).getTime();
  if (!Number.isFinite(time)) return false;
  return Date.now() - time < minutes * 60 * 1000;
}

function appVersionNumber(value = APP_VERSION) {
  return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
}

function requiredAppVersion() {
  return Math.max(
    appVersionNumber(MIN_SUPPORTED_APP_VERSION),
    appVersionNumber(state.minSupportedAppVersion),
    appVersionNumber(cloud.minSupportedAppVersion)
  );
}

function isAppVersionSupported() {
  return appVersionNumber(APP_VERSION) >= requiredAppVersion();
}

function versionBlockedMessage() {
  return `Denne appversjonen (${APP_VERSION}) er for gammel til å lagre trygt. Oppdater til versjon ${requiredAppVersion()} eller nyere før du registrerer nye endringer.`;
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

function currentAdultUser() {
  const uid = cloud.authUser?.uid;
  if (!uid) return null;
  return activeAdultUsers().find((user) => user.uid === uid) || null;
}

function adultUserForAuth(user) {
  if (!user || user.isAnonymous) return null;
  const email = (user.email || "").toLowerCase();
  return activeAdultUsers().find((adult) =>
    adult.uid === user.uid || (email && (adult.email || "").toLowerCase() === email)
  ) || null;
}

function canResetPinWithAuth(user) {
  if (!user || user.isAnonymous) return false;
  const adult = adultUserForAuth(user);
  const owner = familyOwner();
  const email = (user.email || "").toLowerCase();
  const ownerMatch = Boolean(owner && (owner.uid === user.uid || (email && (owner.email || "").toLowerCase() === email)));
  return Boolean(adult || ownerMatch);
}

function hasOwnerAccess() {
  const uid = cloud.authUser?.uid;
  return Boolean(uid && state.ownerUid === uid && familyOwner()?.uid === uid);
}

function isCurrentOwner() {
  return hasOwnerAccess();
}

function isDeveloperAdmin() {
  const email = (cloud.authUser?.email || "").toLowerCase();
  return Boolean(email && !cloud.authUser?.isAnonymous && DEVELOPER_ADMIN_EMAILS.includes(email));
}

function adminHealthCollectionName() {
  return APP_CONFIG.cloudSync.adminHealthCollection || "adminFamilyHealth";
}

function currentRoleLabel() {
  if (hasOwnerAccess()) return "Du er eier";
  const adult = currentAdultUser();
  if (adult) return "Du er voksen";
  if (cloud.authUser?.isAnonymous) return "Anonym enhet";
  if (cloud.authUser) return "Google-bruker uten rolle";
  return "PIN-åpnet enhet";
}

function currentRoleClass() {
  if (hasOwnerAccess()) return "done";
  if (currentAdultUser()) return "pending";
  return "rejected";
}

function requireOwnerAccess(message = "Bare Google-eier kan gjøre dette.") {
  if (hasOwnerAccess()) return true;
  showToast(message);
  return false;
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

async function signInDeveloperAdmin() {
  if (!cloud.auth || !cloud.GoogleAuthProvider || !cloud.signInWithPopup) {
    showToast("Google-innlogging er ikke klar ennå.");
    return;
  }
  try {
    const provider = new cloud.GoogleAuthProvider();
    provider.setCustomParameters?.({ prompt: "select_account" });
    const result = await cloud.signInWithPopup(cloud.auth, provider);
    cloud.authUser = normalizeAuthUser(result.user);
    if (!isDeveloperAdmin()) {
      showToast("Denne Google-kontoen har ikke admin-tilgang.");
    } else {
      showToast("Utvikleradmin er innlogget.");
      loadAdminFamilies();
    }
    render();
  } catch (error) {
    cloud.error = error?.message || "Kunne ikke logge inn som utvikleradmin";
    showToast("Google-innlogging feilet.");
    render();
  }
}

async function signInForPinReset() {
  if (!cloud.auth || !cloud.GoogleAuthProvider || !cloud.signInWithPopup) {
    view.pinResetError = "Google-innlogging er ikke klar ennå. Prøv igjen om litt.";
    render();
    return;
  }
  try {
    const provider = new cloud.GoogleAuthProvider();
    provider.setCustomParameters?.({ prompt: "select_account" });
    const result = await cloud.signInWithPopup(cloud.auth, provider);
    const user = normalizeAuthUser(result.user);
    cloud.authUser = user;
    if (!canResetPinWithAuth(user)) {
      view.pinResetVerified = false;
      view.pinResetUser = user;
      view.pinResetError = "Denne Google-kontoen er ikke registrert som voksen i familien.";
      showToast("Google-kontoen har ikke tilgang til PIN-reset.");
      render();
      return;
    }
    view.pinResetVerified = true;
    view.pinResetUser = user;
    view.pinResetError = "";
    showToast("Google-konto bekreftet.");
    render();
  } catch (error) {
    view.pinResetError = error?.message || "Google-innlogging feilet.";
    showToast("Google-innlogging feilet.");
    render();
  }
}

async function signInExistingFamilyWithGoogle() {
  if (!cloud.auth || !cloud.GoogleAuthProvider || !cloud.signInWithPopup || !cloud.getDoc) {
    showToast("Google-innlogging er ikke klar ennå.");
    return;
  }
  try {
    const provider = new cloud.GoogleAuthProvider();
    provider.setCustomParameters?.({ prompt: "select_account" });
    const result = await cloud.signInWithPopup(cloud.auth, provider);
    cloud.authUser = normalizeAuthUser(result.user);
    const linkRef = userFamilyLinkRef(result.user.uid);
    const snapshot = linkRef ? await cloud.getDoc(linkRef) : null;
    let data = snapshot?.exists() ? snapshot.data() : null;
    if (!data?.cloudFamilyId && !data?.familyId) {
      data = await findFamilyLinkByOwner(result.user);
    }
    const familyId = data?.cloudFamilyId || data?.familyId || "";
    if (!familyId) {
      cloud.error = "Fant ingen familie koblet til denne Google-kontoen. Bruk familiekode, eller åpne appen én gang som eier på en enhet som allerede er koblet til.";
      showToast("Fant ingen familie på Google-kontoen.");
      render();
      return;
    }
    const loaded = await loadFamilyFromCloud(familyId, { familyCode: data.familyCode || "" });
    if (!loaded) {
      showToast("Fant ikke familiedata i skyen.");
      render();
      return;
    }
    registerGoogleAdult(result.user, data.role || "adult");
    saveState();
    await writeUserFamilyLink().catch((error) => {
      console.warn("Could not refresh user family link:", error);
    });
    showToast("Familien er hentet fra Google-kontoen.");
    render();
  } catch (error) {
    cloud.error = error?.message || "Kunne ikke logge inn med Google";
    showToast("Google-innlogging feilet.");
    render();
  }
}

async function findFamilyLinkByOwner(user) {
  if (!user?.uid || !cloud.collection || !cloud.query || !cloud.where || !cloud.getDocs) return null;
  try {
    const codeCollection = APP_CONFIG.cloudSync.codeCollection || "familyCodes";
    const familyCodesRef = cloud.collection(cloud.db, codeCollection);
    const constraints = [cloud.where("ownerUid", "==", user.uid)];
    if (cloud.limit) constraints.push(cloud.limit(1));
    const queryByUid = cloud.query(familyCodesRef, ...constraints);
    const snapshot = await cloud.getDocs(queryByUid);
    const doc = snapshot.docs?.[0];
    if (!doc) return null;
    const data = doc.data() || {};
    return {
      familyId: data.familyId || data.cloudFamilyId || "",
      cloudFamilyId: data.cloudFamilyId || data.familyId || "",
      familyCode: data.code || doc.id || "",
      role: "owner"
    };
  } catch (error) {
    console.warn("Owner family lookup failed:", error);
    return null;
  }
}

async function connectExistingFamilyByCode(form) {
  if (!cloud.ready || !cloud.getDoc || !cloud.doc) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  const code = normalizeFamilyCode(new FormData(form).get("familyCode"));
  if (!code) {
    showToast("Skriv inn familiekode.");
    return;
  }
  const familyId = await familyIdForCode(code);
  if (!familyId) {
    showToast("Fant ikke familiekoden.");
    render();
    return;
  }
  const loaded = await loadFamilyFromCloud(familyId, { familyCode: code });
  if (!loaded) {
    showToast("Fant ikke familiedata i skyen.");
    render();
    return;
  }
  showToast("Familien er koblet til.");
  render();
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
    `Minimum støttet versjon: ${requiredAppVersion()}`,
    `Versjon kan lagre: ${isAppVersionSupported() ? "ja" : "nei"}`,
    `Versjonssperre: ${cloud.versionBlocked ? cloud.versionBlockedMessage || "aktiv" : "nei"}`,
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
    `Lokal sky-revisjon: ${Number(state.cloudRevision) || 0}`,
    `Siste sky-revisjon sett: ${Number(cloud.remoteRevision) || 0}`,
    `Første sky-hent ferdig: ${cloud.initialFetchComplete ? "ja" : "nei"}`,
    `Sist blokkert gammel lagring: ${cloud.staleWriteBlockedAt ? formatDate(cloud.staleWriteBlockedAt) : "ingen"}`,
    `Synkvern: ${cloud.staleWriteMessage || "ingen blokkering"}`,
    `Siste skybackup: ${cloud.backupLastAt ? formatDate(cloud.backupLastAt) : "ingen i denne økten"}`,
    `Skybackup revisjon: ${Number(cloud.backupLastRevision) || 0}`,
    `Skybackup status: ${cloud.backupStatus || "-"}`,
    `Skybackup feil: ${cloud.backupError || "ingen"}`,
    `Backup-liste: ${cloud.backupListStatus || "-"}`,
    `Backup-gjenoppretting: ${cloud.backupRestoreStatus || "-"}`,
    `Backup-gjenopprettingsfeil: ${cloud.backupRestoreError || "ingen"}`,
    `Siste safe merge: ${cloud.mergeLastAt ? formatDate(cloud.mergeLastAt) : "ingen"}`,
    `Safe merge: ${cloud.mergeLastSummary || "ingen lokale endringer flettet"}`,
    `Sist hentet manuelt: ${cloud.manualFetchLastAt ? formatDate(cloud.manualFetchLastAt) : "ingen"}`,
    `Manuell henting: ${cloud.manualFetchStatus || "-"}`,
    `Manuell hente-feil: ${cloud.manualFetchError || "ingen"}`,
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
    cloudRevision: (Number(state.cloudRevision) || 0) + 1,
    lastCloudSyncAt: now,
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
    await writeCloudBackup("before-cloud-migration", state, Number(state.cloudRevision) || 0, fromFamilyId).catch((error) => {
      cloud.backupError = error?.message || "Kunne ikke lagre backup før flytting.";
      console.warn("Cloud migration backup failed:", error);
    });
    const targetDocRef = cloudDocRefForFamily(toFamilyId);
    await cloud.setDoc(targetDocRef, {
      familyId: toFamilyId,
      familyName: migratedState.familyName || "",
      migratedFrom: fromFamilyId,
      state: migratedState,
      cloudRevision: migratedState.cloudRevision,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    const sourceDocRef = cloudDocRefForFamily(fromFamilyId);
    await cloud.setDoc(sourceDocRef, {
      familyId: fromFamilyId,
      familyName: migratedState.familyName || "",
      migratedTo: toFamilyId,
      state: migratedState,
      cloudRevision: migratedState.cloudRevision,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    state = migratedState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setCloudDocRef(toFamilyId);
    cloud.applyingRemote = false;
    subscribeCloudState();
    cloud.pendingSave = false;
    cloud.remoteRevision = Number(state.cloudRevision) || cloud.remoteRevision;
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

function newFamilyStartLink() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
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

async function copyNewFamilyStartLink() {
  const link = newFamilyStartLink();
  try {
    await navigator.clipboard.writeText(link);
    showToast("Startlenke for ny familie kopiert.");
  } catch {
    prompt("Kopier startlenken:", link);
  }
}

async function copyPilotMessage() {
  const text = document.querySelector("[data-pilot-message]")?.value || currentPilotShareText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Pilottekst kopiert.");
  } catch {
    prompt("Kopier pilotteksten:", text);
  }
}

function savePilotMessage() {
  state.pilotShareText = document.querySelector("[data-pilot-message]")?.value || "";
  saveState();
  showToast("Pilottekst er lagret.");
}

function resetPilotMessage() {
  if (!confirm("Vil du tilbakestille pilotteksten til standardmalen?")) return;
  state.pilotShareText = "";
  saveState();
  showToast("Pilottekst er tilbakestilt.");
  render();
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
  toast.classList.remove("motivation-toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function showMotivationToast({ icon = "⭐", title, text, meta = [] }) {
  toast.classList.add("motivation-toast");
  toast.innerHTML = `
    <div class="motivation-toast-icon">${icon}</div>
    <div>
      <strong>${escapeText(title)}</strong>
      <p>${escapeText(text)}</p>
      ${meta.length ? `<div class="motivation-toast-meta">${meta.map((item) => `<span>${escapeText(item)}</span>`).join("")}</div>` : ""}
    </div>
  `;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.remove("motivation-toast");
  }, 4200);
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

function celebrateTaskResult(points, result = {}, context = {}) {
  if (result.levelUp) {
    celebrateLevelUp(result.levelNumber, result.level.name);
    if (result.badges?.length) {
      const badge = BADGE_DEFINITIONS.find((item) => item.id === result.badges[0].badgeId);
      prepareBadgeCelebration(badge);
    }
    return;
  }
  if (result.badges?.length) {
    const badge = BADGE_DEFINITIONS.find((item) => item.id === result.badges[0].badgeId);
    celebrateBadge(badge);
    return;
  }
  celebrateMotivation(points, context);
}

function celebrateMotivation(points, context = {}) {
  const nextBadge = context.childId ? badgeProgressList(context.childId).at(0) : null;
  const streak = context.streakResult;
  const weeklyGoal = context.childId ? weeklyGoalProgress(context.childId) : null;
  const meta = [`+${points} stjerner`];
  if (streak?.increased && streak.current > 1) meta.push(`${streak.current} dager på rad`);
  if (streak?.newBest && streak.current > 1) meta.push("Ny streak-rekord");
  if (weeklyGoal?.done === weeklyGoal?.target) meta.push("Ukens mål nådd");
  if (nextBadge && nextBadge.percent >= 50) meta.push(`${nextBadge.percent}% mot ${nextBadge.badge.name}`);
  showMotivationToast({
    icon: weeklyGoal?.done === weeklyGoal?.target ? "🎯" : streak?.increased && streak.current > 1 ? "🔥" : "⭐",
    title: weeklyGoal?.done === weeklyGoal?.target ? "Ukens mål er nådd!" : streak?.increased && streak.current > 1 ? `${streak.current} dager på rad!` : "Bra jobbet!",
    text: weeklyGoal?.done === weeklyGoal?.target ? "Neste ukemål er klart." : nextBadge ? nextBadge.hint : "Du er litt nærmere neste merke.",
    meta
  });
  if (navigator.vibrate) navigator.vibrate(60);
  dropConfetti("⭐", 18, 1200);
}

function celebrateLevelUp(levelNumber, levelName) {
  showMotivationToast({
    icon: "🏆",
    title: "Nytt nivå!",
    text: `Nivå ${levelNumber}: ${levelName}`,
    meta: ["Nivå opp"]
  });
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  dropConfetti("🏆", 28, 1500, "level-confetti");
}

function celebrateBadge(badge) {
  if (!badge) return celebrate(0);
  prepareBadgeCelebration(badge);
  showMotivationToast({
    icon: badge.icon,
    title: "Nytt merke!",
    text: badge.name,
    meta: [badge.description]
  });
  if (navigator.vibrate) navigator.vibrate(70);
  dropConfetti(badge.icon, 22, 1300, "badge-confetti");
}

function prepareBadgeCelebration(badge) {
  if (!badge) return;
  view.badgeCelebration = {
    id: badge.id,
    icon: badge.icon,
    name: badge.name,
    description: badge.description
  };
}

function dropConfetti(icon, count, duration, className = "") {
  const layer = document.createElement("div");
  layer.className = `confetti ${className}`.trim();
  layer.innerHTML = Array.from({ length: count }, (_, index) => `<span style="left:${Math.random() * 100}%;animation-delay:${index * 20}ms">${icon}</span>`).join("");
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), duration);
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
  const { action, child, task, reward, id, tab, backupId } = button.dataset;
  const scrollActions = new Set([
    "home",
    "setup-next",
    "setup-back",
    "setup-existing-family",
    "setup-new-family",
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
  if (action === "setup-existing-family") {
    view.setupMode = "existing";
    queueScrollTop();
    render();
  }
  if (action === "setup-new-family") {
    view.setupMode = "new";
    view.setupStep = 0;
    queueScrollTop();
    render();
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
  if (action === "forgot-pin") {
    view.pinResetMode = true;
    view.pinResetVerified = false;
    view.pinResetUser = null;
    view.pinResetError = "";
    render();
  }
  if (action === "cancel-pin-reset") {
    view.pinResetMode = false;
    view.pinResetVerified = false;
    view.pinResetUser = null;
    view.pinResetError = "";
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
  if (action === "close-badge-celebration") {
    view.badgeCelebration = null;
    render();
  }
  if (action === "view-my-badges") {
    view.badgeCelebration = null;
    if (view.mode === "child" && view.childId) {
      view.childTab = "me";
      queueScrollTop();
    }
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
  if (action === "apply-app-update") {
    applyAppUpdate();
  }
  if (action === "google-owner-login") {
    signInGoogleOwner();
  }
  if (action === "developer-admin-login") {
    signInDeveloperAdmin();
  }
  if (action === "google-pin-reset-login") {
    signInForPinReset();
  }
  if (action === "existing-family-google-login") {
    signInExistingFamilyWithGoogle();
  }
  if (action === "force-cloud-fetch") {
    fetchLatestCloudState();
  }
  if (action === "force-cloud-save") {
    cloud.pendingSave = true;
    flushCloudSave();
  }
  if (action === "migrate-cloud-family") {
    if (!requireOwnerAccess("Bare Google-eier kan flytte sky-sti.")) return;
    migrateCloudFamilyPath();
  }
  if (action === "test-cloud-sync") {
    runCloudSyncTest();
  }
  if (action === "list-cloud-backups") {
    listCloudBackups();
  }
  if (action === "preview-cloud-backup") {
    if (!requireOwnerAccess("Bare Google-eier kan gjenopprette skybackup.")) return;
    view.restoreBackupId = backupId;
    render();
  }
  if (action === "export-cloud-backup") {
    exportCloudBackup(backupId);
  }
  if (action === "close-restore-backup") {
    view.restoreBackupId = null;
    render();
  }
  if (action === "restore-cloud-backup") {
    restoreCloudBackup(button.dataset.backupId);
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
  if (action === "leave-admin-portal") {
    view.adminPortal = false;
    window.history.replaceState({}, "", window.location.pathname);
    render();
  }
  if (action === "load-admin-families") {
    loadAdminFamilies();
  }
  if (action === "load-current-admin-family") {
    loadCurrentAdminFamily();
  }
  if (action === "copy-admin-summary") {
    copyAdminSummary();
  }
  if (action === "copy-migration-report") {
    copyMigrationReport();
  }
  if (action === "copy-family-link") {
    copyFamilyLink();
  }
  if (action === "copy-new-family-link") {
    copyNewFamilyStartLink();
  }
  if (action === "copy-pilot-message") {
    copyPilotMessage();
  }
  if (action === "save-pilot-message") {
    savePilotMessage();
  }
  if (action === "reset-pilot-message") {
    resetPilotMessage();
  }
  if (action === "copy-adult-invite") {
    if (!requireOwnerAccess("Bare Google-eier kan kopiere vokseninvitasjon.")) return;
    copyAdultInviteLink();
  }
  if (action === "new-adult-invite" && confirm("Vil du lage en ny vokseninvitasjon? Gamle vokseninvitasjoner blir deaktivert.")) {
    if (!requireOwnerAccess("Bare Google-eier kan lage vokseninvitasjon.")) return;
    createNewAdultInvite();
  }
  if (action === "revoke-adult-invite" && confirm("Vil du deaktivere aktiv vokseninvitasjon? Lenken slutter å gi voksen-tilgang.")) {
    if (!requireOwnerAccess("Bare Google-eier kan deaktivere vokseninvitasjon.")) return;
    revokeAdultInvite();
  }
  if (action === "new-family-code" && confirm("Vil du lage en ny familiekode? Gamle koblingslenker vil slutte å passe.")) {
    if (!requireOwnerAccess("Bare Google-eier kan lage ny familiekode.")) return;
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
  if (form.dataset.form === "pin-reset") {
    if (!view.pinResetVerified || !canResetPinWithAuth(view.pinResetUser)) {
      showToast("Google-konto må bekreftes først.");
      return;
    }
    const data = new FormData(form);
    const newPin = String(data.get("newPin") || "");
    const repeatPin = String(data.get("repeatPin") || "");
    if (newPin.length < 4) {
      showToast("Ny PIN må ha minst 4 tegn.");
      return;
    }
    if (newPin !== repeatPin) {
      showToast("Ny PIN er ikke lik i begge feltene.");
      return;
    }
    state.parentPinHash = await hashPin(newPin);
    view.pinResetMode = false;
    view.pinResetVerified = false;
    view.pinResetUser = null;
    view.pinResetError = "";
    view.adultUnlocked = true;
    view.adultTab = "settings";
    saveState();
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
  if (form.dataset.form === "join-existing-family") {
    await connectExistingFamilyByCode(form);
    return;
  }
  if (form.dataset.form === "restore-cloud-backup") {
    await restoreCloudBackupFromForm(form);
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
  const startupUpdatedAt = state.updatedAt || "";
  const startupRevision = Number(state.cloudRevision) || 0;
  try {
    view.bootMessage = "Kobler til Firestore";
    render();
    const [{ initializeApp }, { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult }, { getFirestore, doc, collection, query, where, limit, getDoc, getDocs, setDoc, runTransaction, onSnapshot, serverTimestamp }] = await Promise.all([
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
    cloud.collection = collection;
    cloud.query = query;
    cloud.where = where;
    cloud.limit = limit;
    cloud.getDoc = getDoc;
    cloud.getDocs = getDocs;
    cloud.setDoc = setDoc;
    cloud.runTransaction = runTransaction;
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
    const remoteHadRevision = Boolean(Number(remoteState?.cloudRevision) || 0);
    if (remoteState) {
      cloud.lastFetchedAt = new Date().toISOString();
      cloud.applyingRemote = true;
      try {
        const localChangedDuringStartup = cloud.pendingSave
          || (state.updatedAt || "") !== startupUpdatedAt
          || (Number(state.cloudRevision) || 0) > startupRevision;
        const mergeResult = localChangedDuringStartup
          ? safeMergeCloudState(state, remoteState)
          : { state: normalizeRemoteState(remoteState), changed: false, summary: "" };
        state = mergeResult.state;
        cloud.remoteRevision = Number(state.cloudRevision) || 0;
        state.lastCloudSyncAt = cloud.lastFetchedAt;
        if (mergeResult.changed) {
          cloud.mergeLastAt = cloud.lastFetchedAt;
          cloud.mergeLastSummary = `Oppstart: ${mergeResult.summary}`;
          cloud.pendingSave = true;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setCloudDocRef();
      } finally {
        cloud.applyingRemote = false;
      }
    }
    cloud.initialFetchComplete = true;
    if ((remoteState && !remoteHadRevision) || (!remoteState && !pendingFamilyCode() && state.setupCompleted)) await writeCloudState();

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

function userFamilyLinkRef(uid = cloud.authUser?.uid) {
  if (!cloud.doc || !uid) return null;
  return cloud.doc(cloud.db, "users", uid, "familyLinks", "default");
}

async function resolvePendingFamilyCode() {
  const code = normalizeFamilyCode(pendingFamilyCode());
  if (!code || !cloud.getDoc || !cloud.doc) return null;
  const familyId = await familyIdForCode(code);
  if (!familyId) return null;
  state.cloudFamilyId = familyId;
  state.familyId = familyId;
  state.familyCode = code;
  cloud.familyCodeLookupStatus = `fant ${familyId}`;
  cloud.familyCodeLookupError = "";
  setCloudDocRef(familyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return familyId;
}

async function familyIdForCode(code) {
  const normalizedCode = normalizeFamilyCode(code);
  if (!normalizedCode || !cloud.getDoc || !cloud.doc) return null;
  try {
    cloud.familyCodeLookupStatus = `Søker etter ${normalizedCode}`;
    cloud.familyCodeLookupError = "";
    const docRef = familyCodeDocRef(normalizedCode);
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
    cloud.familyCodeLookupStatus = `fant ${familyId}`;
    cloud.familyCodeLookupError = "";
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
  candidates.sort((a, b) => (Number(b.state?.cloudRevision) || 0) - (Number(a.state?.cloudRevision) || 0) || remoteStateTime(b.state) - remoteStateTime(a.state));
  return candidates[0].state;
}

async function loadFamilyFromCloud(familyId, options = {}) {
  if (!familyId || !cloud.getDoc || !cloud.doc) return false;
  const docRef = cloudDocRefForFamily(familyId);
  const snapshot = await cloud.getDoc(docRef);
  const remoteState = snapshot.exists() ? snapshot.data()?.state : null;
  if (!remoteState) {
    cloud.familyCodeLookupError = "Fant familie-id, men ingen familiedata i skyen.";
    return false;
  }
  cloud.applyingRemote = true;
  const now = new Date().toISOString();
  state = normalizeRemoteState({
    ...remoteState,
    familyCode: options.familyCode || remoteState.familyCode,
    familyId,
    cloudFamilyId: familyId,
    setupCompleted: true,
    lastCloudSyncAt: now
  });
  cloud.remoteRevision = Number(state.cloudRevision) || 0;
  cloud.lastFetchedAt = now;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setCloudDocRef(familyId);
  cloud.applyingRemote = false;
  subscribeCloudState();
  clearPendingFamilyCode();
  view.setupMode = "new";
  view.setupStep = 0;
  view.setupDraft = null;
  view.mode = "home";
  view.childId = null;
  view.childTab = "tasks";
  return true;
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

function cloudBackupDocRefForFamily(familyId, backupId) {
  const config = APP_CONFIG.cloudSync;
  return cloud.doc(
    cloud.db,
    config.stateCollection,
    familyId,
    "backups",
    backupId
  );
}

function cloudBackupCollectionRefForFamily(familyId = cloudFamilyId()) {
  if (!cloud.collection || !cloud.db) return null;
  const config = APP_CONFIG.cloudSync;
  return cloud.collection(
    cloud.db,
    config.stateCollection,
    familyId,
    "backups"
  );
}

function cloudBackupId(reason, revision, createdAt) {
  const safeReason = slugify(reason || "backup") || "backup";
  if (revision > 0) return `rev-${revision}-${safeReason}`;
  return `legacy-${createdAt.replace(/\D/g, "").slice(0, 14)}-${safeReason}`;
}

function cloudBackupPayload(reason, snapshotState, revision, createdAt) {
  return {
    reason,
    familyId: snapshotState?.familyId || state.familyId || "local-family",
    cloudFamilyId: snapshotState?.cloudFamilyId || cloudFamilyId(),
    familyName: snapshotState?.familyName || state.familyName || "",
    cloudRevision: Number(revision) || Number(snapshotState?.cloudRevision) || 0,
    appVersion: APP_VERSION,
    createdAt,
    state: snapshotState
  };
}

async function writeCloudBackup(reason, snapshotState, revision = Number(snapshotState?.cloudRevision) || 0, familyId = cloudFamilyId()) {
  if (!cloud.setDoc || !cloud.doc || !cloud.db || !snapshotState) return null;
  const createdAt = new Date().toISOString();
  const backupId = cloudBackupId(reason, Number(revision) || 0, createdAt);
  const backupRef = cloudBackupDocRefForFamily(familyId, backupId);
  await cloud.setDoc(backupRef, cloudBackupPayload(reason, snapshotState, revision, createdAt), { merge: false });
  cloud.backupLastAt = createdAt;
  cloud.backupLastRevision = Number(revision) || Number(snapshotState?.cloudRevision) || 0;
  cloud.backupStatus = `Lagret ${backupId}`;
  cloud.backupError = "";
  return backupId;
}

async function listCloudBackups() {
  if (!cloud.ready || !cloud.getDocs || !cloud.collection) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  try {
    cloud.backupListStatus = "Henter backuper ...";
    cloud.backupRestoreError = "";
    render();
    const collectionRef = cloudBackupCollectionRefForFamily();
    const snapshot = collectionRef ? await cloud.getDocs(collectionRef) : null;
    const backups = (snapshot?.docs || [])
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .filter((item) => item.state)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10);
    cloud.backupList = backups;
    cloud.backupListStatus = backups.length ? `Fant ${backups.length} backup(er).` : "Ingen backuper funnet.";
    showToast(backups.length ? "Backuper er hentet." : "Ingen backuper funnet.");
    render();
  } catch (error) {
    cloud.backupListStatus = "Kunne ikke hente backuper.";
    cloud.backupRestoreError = error?.message || "Backup-listen kunne ikke hentes.";
    showToast("Kunne ikke hente backuper.");
    render();
  }
}

async function loadAdminFamilies() {
  if (!isDeveloperAdmin()) {
    showToast("Bare utvikleradmin kan hente driftsstatus.");
    return;
  }
  if (!cloud.ready || !cloud.getDocs || !cloud.collection) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  try {
    cloud.adminStatus = "Henter familier ...";
    cloud.adminError = "";
    render();
    const collectionName = adminHealthCollectionName();
    const collectionRef = cloud.collection(cloud.db, collectionName);
    const snapshot = await cloud.getDocs(collectionRef);
    const families = (snapshot.docs || [])
      .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
      .sort((a, b) => comparableDateValue(b.lastCloudSyncAt || b.updatedAt) - comparableDateValue(a.lastCloudSyncAt || a.updatedAt));
    cloud.adminFamilies = families;
    cloud.adminSource = collectionName;
    cloud.adminStatus = families.length ? `Fant ${families.length} familie(r) i ${collectionName}.` : `Ingen familier funnet i ${collectionName}.`;
    showToast(families.length ? "Driftsstatus hentet." : "Ingen familier funnet.");
    render();
  } catch (error) {
    cloud.adminStatus = "Kunne ikke hente adminoversikt.";
    const message = error?.message || `Lesing fra ${adminHealthCollectionName()} feilet.`;
    cloud.adminError = message.includes("permission") || message.includes("permissions")
      ? `Firestore-reglene tillater ikke listing av ${adminHealthCollectionName()} for utvikleradmin.`
      : message;
    showToast("Kunne ikke hente driftsstatus.");
    render();
  }
}

function loadCurrentAdminFamily() {
  cloud.adminFamilies = [currentFamilyAdminSnapshot()];
  cloud.adminStatus = "Viser bare denne familien lokalt.";
  cloud.adminError = "";
  showToast("Denne familien vises i adminoversikten.");
  render();
}

function currentFamilyAdminSnapshot() {
  return adminHealthPayload({
    id: state.familyCode || cloudFamilyId(),
    code: state.familyCode || "",
    source: "local"
  });
}

function adminHealthPayload(extra = {}) {
  const payload = {
    familyId: state.familyId || cloudFamilyId(),
    cloudFamilyId: cloudFamilyId(),
    familyName: state.familyName || "",
    hasGoogleOwner: familyHasGoogleOwner(),
    adultUsersCount: activeAdultUsers().length,
    appVersion: APP_VERSION,
    minSupportedAppVersion: requiredAppVersion(),
    schemaVersion: state.schemaVersion || SCHEMA_VERSION,
    cloudRevision: Number(state.cloudRevision) || 0,
    childrenCount: state.children?.length || 0,
    tasksCount: state.tasks?.length || 0,
    completionsCount: state.completions?.length || 0,
    rewardsCount: state.rewards?.length || 0,
    badgesCount: state.badges?.length || 0,
    lastCloudSyncAt: state.lastCloudSyncAt || cloud.lastFetchedAt || cloud.lastSavedAt || null,
    lastBackupAt: cloud.backupLastAt || null,
    lastBackupRevision: Number(cloud.backupLastRevision) || 0,
    pendingSave: Boolean(cloud.pendingSave),
    versionBlocked: Boolean(cloud.versionBlocked),
    staleWriteBlockedAt: cloud.staleWriteBlockedAt || null,
    lastError: cloud.error || cloud.backupError || cloud.manualFetchError || "",
    updatedAt: state.updatedAt || null
  };
  return { ...payload, ...extra };
}

async function writeAdminHealthStatus(extra = {}) {
  if (!cloud.setDoc || !cloud.doc || !state.setupCompleted) return;
  const familyId = cloudFamilyId();
  if (!familyId) return;
  const docRef = cloud.doc(cloud.db, adminHealthCollectionName(), familyId);
  await cloud.setDoc(docRef, {
    ...adminHealthPayload(extra),
    id: familyId,
    lastSeenAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
}

function comparableDateValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

async function copyAdminSummary() {
  const text = adminSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Adminoversikt kopiert.");
  } catch {
    prompt("Kopier adminoversikt:", text);
  }
}

function adminSummaryText() {
  return [
    `Adminoversikt: ${APP_CONFIG.appName}`,
    `Hentet: ${new Date().toISOString()}`,
    `Antall familier: ${cloud.adminFamilies.length}`,
    ...cloud.adminFamilies.map((family) => [
      "",
      `Familie: ${family.familyName || "-"}`,
      `Familie-id: ${family.cloudFamilyId || family.familyId || "-"}`,
      `Appversjon: ${family.appVersion || "-"}`,
      `Minimum støttet: ${family.minSupportedAppVersion || MIN_SUPPORTED_APP_VERSION}`,
      `Siste synk: ${formatMaybeDate(family.lastCloudSyncAt || family.lastSeenAt || family.updatedAt)}`,
      `Skyrevisjon: ${Number(family.cloudRevision) || 0}`,
      `Barn/oppgaver/fullføringer: ${Number(family.childrenCount) || 0}/${Number(family.tasksCount) || 0}/${Number(family.completionsCount) || 0}`,
      `Backup: ${family.lastBackupAt ? formatMaybeDate(family.lastBackupAt) : "-"} rev. ${Number(family.lastBackupRevision) || 0}`,
      `Status: ${adminFamilyStatusLabel(family)}`
    ].join("\n"))
  ].join("\n");
}

async function copyMigrationReport() {
  const text = migrationReportText();
  try {
    await navigator.clipboard.writeText(text);
    showToast("Migreringsrapport kopiert.");
  } catch {
    prompt("Kopier migreringsrapport:", text);
  }
}

function migrationReportText() {
  return [
    `Migreringsrapport: ${APP_CONFIG.appName}`,
    `Versjon: ${APP_VERSION}`,
    `Familie-id: ${cloudFamilyId()}`,
    `Datamodell: ${state.schemaVersion || SCHEMA_VERSION}`,
    `Skyrevisjon: ${Number(state.cloudRevision) || 0}`,
    `Sist synk: ${state.lastCloudSyncAt ? formatDate(state.lastCloudSyncAt) : "-"}`,
    "",
    "Validering:",
    ...migrationReadinessChecks().map((item) => `${item.ok ? "OK" : "SJEKK"} - ${item.title}: ${item.description}`),
    "",
    "Plan:",
    ...migrationPlanItems().map((item, index) => `${index + 1}. ${item.title}: ${item.description}`)
  ].join("\n");
}

async function restoreCloudBackupFromForm(form) {
  if (!isCurrentOwner()) {
    showToast("Bare Google-eier kan gjenopprette backup.");
    return;
  }
  const data = new FormData(form);
  const pinHash = await hashPin(data.get("pin"));
  if (pinHash !== state.parentPinHash) {
    showToast("Feil PIN.");
    return;
  }
  if (String(data.get("confirmText") || "").trim().toUpperCase() !== "GJENOPPRETT") {
    showToast("Skriv GJENOPPRETT for å bekrefte.");
    return;
  }
  await restoreCloudBackup(data.get("backupId"), data.get("restoreScope") || "full");
}

async function restoreCloudBackup(backupId, scope = "full") {
  if (!backupId || !cloud.ready || !cloud.getDoc || !cloud.setDoc) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  const backupMeta = cloud.backupList.find((item) => item.id === backupId);
  if (!isCurrentOwner()) {
    showToast("Bare Google-eier kan gjenopprette backup.");
    return;
  }
  const ok = confirm(`Siste sjekk: Vil du gjenopprette ${restoreScopeLabel(scope)} fra backupen ${backupMeta?.createdAt ? formatDate(backupMeta.createdAt) : backupId}? Nåværende skydata blir sikkerhetskopiert først.`);
  if (!ok) return;
  try {
    cloud.backupRestoreStatus = "Gjenoppretter backup ...";
    cloud.backupRestoreError = "";
    render();
    const backupRef = cloudBackupDocRefForFamily(cloudFamilyId(), backupId);
    const backupSnapshot = await cloud.getDoc(backupRef);
    const backup = backupSnapshot.exists() ? backupSnapshot.data() : null;
    if (!backup?.state) {
      cloud.backupRestoreStatus = "Backupen mangler state-data.";
      showToast("Backupen kan ikke gjenopprettes.");
      render();
      return;
    }
    const currentSnapshot = await cloud.getDoc(cloud.docRef);
    const currentRemoteState = currentSnapshot.exists() ? currentSnapshot.data()?.state : null;
    if (currentRemoteState) {
      await writeCloudBackup("before-restore", currentRemoteState, Number(currentRemoteState.cloudRevision) || 0);
    }
    const now = new Date().toISOString();
    const nextRevision = Math.max(Number(state.cloudRevision) || 0, Number(cloud.remoteRevision) || 0, Number(currentRemoteState?.cloudRevision) || 0) + 1;
    const restoredState = normalizeLocalState({
      ...stateWithBackupScope(state, backup.state, scope),
      cloudRevision: nextRevision,
      lastCloudSyncAt: now,
      updatedAt: now
    }, true);
    await cloud.setDoc(cloud.docRef, {
      familyId: restoredState.familyId || cloudFamilyId(),
      familyName: restoredState.familyName || "",
      state: restoredState,
      cloudRevision: nextRevision,
      restoredFromBackup: backupId,
      restoredScope: scope,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    cloud.applyingRemote = true;
    state = restoredState;
    cloud.remoteRevision = nextRevision;
    cloud.lastSavedAt = now;
    cloud.lastFetchedAt = now;
    cloud.backupRestoreStatus = `Gjenopprettet ${restoreScopeLabel(scope)} fra ${backupId} som rev. ${nextRevision}.`;
    view.restoreBackupId = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    cloud.applyingRemote = false;
    await writeFamilyCodeIndex().catch((error) => console.warn("Family code index write failed after restore:", error));
    showToast("Backup er gjenopprettet.");
    render();
  } catch (error) {
    cloud.applyingRemote = false;
    cloud.backupRestoreStatus = "Gjenoppretting feilet.";
    cloud.backupRestoreError = error?.message || "Kunne ikke gjenopprette backup.";
    showToast("Kunne ikke gjenopprette backup.");
    render();
  }
}

function stateWithBackupScope(currentState, backupState, scope) {
  const normalizedBackup = normalizeLocalState(backupState || {}, true);
  const base = normalizeLocalState(currentState || {}, true);
  if (scope === "tasks") {
    return { ...base, tasks: normalizedBackup.tasks };
  }
  if (scope === "rewards") {
    return { ...base, rewards: normalizedBackup.rewards };
  }
  if (scope === "children") {
    return { ...base, children: normalizedBackup.children };
  }
  if (scope === "activity") {
    return {
      ...base,
      children: normalizedBackup.children,
      completions: normalizedBackup.completions,
      transactions: normalizedBackup.transactions,
      history: normalizedBackup.history,
      badges: normalizedBackup.badges,
      redemptions: normalizedBackup.redemptions
    };
  }
  return normalizedBackup;
}

function restoreScopeLabel(scope) {
  return {
    tasks: "oppgaver",
    rewards: "belønninger",
    children: "barn/profiler",
    activity: "fullføringer, stjerner og historikk",
    full: "hele familien"
  }[scope] || "hele familien";
}

function exportCloudBackup(backupId) {
  const backup = cloud.backupList.find((item) => item.id === backupId);
  if (!backup) {
    showToast("Fant ikke backupen i listen.");
    return;
  }
  downloadJson({
    exportedAt: new Date().toISOString(),
    appName: APP_CONFIG.appName,
    appVersion: APP_VERSION,
    environment: APP_CONFIG.environment,
    firebaseProjectId: APP_CONFIG.cloudSync.firebase?.projectId || null,
    backup
  }, `familieoppdrag-skybackup-${backupId}-${dateKey()}.json`);
  showToast("Skybackup lastet ned.");
}

function remoteStateTime(remoteState) {
  const time = new Date(remoteState?.updatedAt || remoteState?.createdAt || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

async function fetchLatestCloudState() {
  if (!cloud.enabled || !cloud.ready || !cloud.initialFetchComplete || !cloud.getDoc || !cloud.docRef) {
    showToast("Skyen er ikke klar ennå.");
    return;
  }
  if (cloud.pendingSave) {
    showToast("Vent til lokale endringer er lagret først.");
    return;
  }
  try {
    cloud.manualFetchStatus = "Henter nyeste skydata ...";
    cloud.manualFetchError = "";
    render();
    const remoteState = await loadBestCloudState();
    if (!remoteState) {
      cloud.manualFetchLastAt = new Date().toISOString();
      cloud.manualFetchStatus = "Fant ingen skydata for denne familien.";
      showToast("Fant ingen skydata.");
      render();
      return;
    }
    const remoteRevision = Number(remoteState.cloudRevision) || 0;
    const localRevision = Number(state.cloudRevision) || 0;
    const shouldApply = remoteRevision > localRevision ||
      (remoteRevision === localRevision && remoteState.updatedAt && remoteState.updatedAt !== state.updatedAt && remoteStateTime(remoteState) >= remoteStateTime(state));
    cloud.manualFetchLastAt = new Date().toISOString();
    cloud.remoteRevision = Math.max(Number(cloud.remoteRevision) || 0, remoteRevision);
    if (!shouldApply) {
      cloud.manualFetchStatus = remoteRevision < localRevision ? "Lokal data er nyere enn skyen." : "Denne enheten har allerede nyeste skydata.";
      showToast("Du har allerede nyeste data.");
      render();
      return;
    }
    applyNewerCloudState(remoteState, remoteRevision, "manual-cloud-fetch");
    cloud.manualFetchStatus = `Hentet sky-revisjon ${remoteRevision || "uten revisjon"}.`;
    showToast("Nyeste skydata er hentet.");
    render();
  } catch (error) {
    cloud.manualFetchError = error?.message || "Kunne ikke hente nyeste skydata.";
    cloud.manualFetchStatus = "Henting feilet.";
    showToast("Kunne ikke hente nyeste data.");
    render();
  }
}

function backupCloudState(reason, snapshotState) {
  try {
    const backups = JSON.parse(localStorage.getItem(CLOUD_BACKUP_KEY) || "[]");
    backups.unshift({
      reason,
      createdAt: new Date().toISOString(),
      familyId: snapshotState?.familyId || state.familyId || "",
      cloudFamilyId: snapshotState?.cloudFamilyId || state.cloudFamilyId || "",
      cloudRevision: Number(snapshotState?.cloudRevision) || 0,
      state: snapshotState
    });
    localStorage.setItem(CLOUD_BACKUP_KEY, JSON.stringify(backups.slice(0, 5)));
  } catch (error) {
    console.warn("Could not write local cloud backup:", error);
  }
}

function applyNewerCloudState(remoteState, remoteRevision, reason) {
  const now = new Date().toISOString();
  const localBeforeMerge = state;
  backupCloudState(reason, state);
  cloud.applyingRemote = true;
  const mergeResult = reason === "stale-write-blocked"
    ? safeMergeCloudState(localBeforeMerge, remoteState)
    : { state: normalizeRemoteState(remoteState), changed: false, summary: "" };
  const nextState = mergeResult.state;
  nextState.lastCloudSyncAt = now;
  state = nextState;
  cloud.remoteRevision = Math.max(Number(cloud.remoteRevision) || 0, Number(remoteRevision) || Number(state.cloudRevision) || 0);
  cloud.lastFetchedAt = now;
  cloud.staleWriteBlockedAt = reason === "stale-write-blocked" ? now : cloud.staleWriteBlockedAt;
  cloud.staleWriteMessage = reason === "stale-write-blocked"
    ? mergeResult.changed
      ? "Denne enheten hadde eldre data. Nyeste skydata ble hentet, og nye lokale offline-endringer ble flettet inn."
      : "Denne enheten hadde eldre data. Nyeste familiedata er hentet fra skyen i stedet for å overskrive."
    : cloud.staleWriteMessage;
  if (mergeResult.changed) {
    cloud.mergeLastAt = now;
    cloud.mergeLastSummary = mergeResult.summary;
    cloud.pendingSave = true;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloud.applyingRemote = false;
  setCloudDocRef();
  if (mergeResult.changed) queueCloudSave();
  if (reason === "stale-write-blocked") {
    showToast(mergeResult.changed ? "Eldre data ble stoppet. Nye lokale endringer ble flettet inn." : "Eldre lokal data ble stoppet. Nyeste skydata er hentet.");
  }
}

function safeMergeCloudState(localState, remoteState) {
  const normalizedRemote = normalizeRemoteState(remoteState);
  const since = localState?.lastCloudSyncAt || localState?.updatedAt || localState?.createdAt || "";
  const summary = [];
  let changed = false;

  const mergeNamed = (key, options = {}) => {
    const result = mergeItemsById(normalizedRemote[key], localState?.[key], since, options);
    normalizedRemote[key] = result.items;
    if (result.added || result.updated) {
      changed = true;
      summary.push(`${result.added + result.updated} ${options.label || key}`);
    }
    return result;
  };

  const taskResult = mergeNamed("tasks", { label: "oppgaver", sortBy: "sortOrder" });
  const rewardResult = mergeNamed("rewards", { label: "belønninger" });
  mergeNamed("children", { label: "barn" });
  mergeNamed("completions", { label: "fullføringer" });
  mergeNamed("redemptions", { label: "belønninger i flyt" });
  const transactionResult = mergeNamed("transactions", { label: "transaksjoner" });
  mergeNamed("history", { label: "historikk" });
  mergeNamed("badges", { label: "merker" });

  if (transactionResult.addedItems.length) {
    applyMergedTransactionsToChildren(normalizedRemote, transactionResult.addedItems);
  }
  if (taskResult.added || rewardResult.added) {
    normalizedRemote.updatedAt = new Date().toISOString();
  }

  return {
    state: normalizeLocalState(normalizedRemote, true),
    changed,
    summary: summary.length ? summary.join(", ") : ""
  };
}

function mergeItemsById(remoteItems = [], localItems = [], since = "", options = {}) {
  const remoteList = Array.isArray(remoteItems) ? remoteItems : [];
  const localList = Array.isArray(localItems) ? localItems : [];
  const merged = remoteList.map((item) => ({ ...item }));
  const indexById = new Map(merged.map((item, index) => [item.id, index]));
  const addedItems = [];
  let added = 0;
  let updated = 0;

  localList.forEach((localItem) => {
    if (!localItem?.id || !itemChangedAfter(localItem, since)) return;
    const index = indexById.get(localItem.id);
    if (index === undefined) {
      const copy = { ...localItem };
      merged.push(copy);
      indexById.set(copy.id, merged.length - 1);
      addedItems.push(copy);
      added += 1;
      return;
    }
    if (itemTime(localItem) > itemTime(merged[index])) {
      merged[index] = { ...merged[index], ...localItem };
      updated += 1;
    }
  });

  if (options.sortBy) {
    merged.sort((a, b) => (Number(a[options.sortBy]) || 0) - (Number(b[options.sortBy]) || 0));
  }

  return { items: merged, added, updated, addedItems };
}

function itemChangedAfter(item, since) {
  if (!since) return true;
  const changed = itemTime(item);
  const cutoff = new Date(since).getTime();
  return Number.isFinite(changed) && Number.isFinite(cutoff) && changed > cutoff;
}

function itemTime(item) {
  const candidates = [
    item?.updatedAt,
    item?.completedAt,
    item?.approvedAt,
    item?.rejectedAt,
    item?.reversedAt,
    item?.requestedAt,
    item?.fulfilledAt,
    item?.refundedAt,
    item?.awardedAt,
    item?.createdAt
  ];
  const times = candidates
    .map((value) => new Date(value || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);
  return times.length ? Math.max(...times) : 0;
}

function applyMergedTransactionsToChildren(targetState, transactions) {
  transactions.forEach((transaction) => {
    const child = targetState.children?.find((item) => item.id === transaction.childId);
    const points = Number(transaction.pointsChange) || 0;
    if (!child || !points) return;
    child.pointsBalance = Math.max(0, (Number(child.pointsBalance) || 0) + points);
    if (points > 0 || transaction.type === "undo") {
      child.lifetimePoints = Math.max(0, (Number(child.lifetimePoints) || 0) + points);
    }
  });
}

function subscribeCloudState() {
  if (!cloud.onSnapshot || !cloud.docRef) return;
  if (cloud.unsubscribe) cloud.unsubscribe();
  cloud.unsubscribe = cloud.onSnapshot(cloud.docRef, (remote) => {
    if (!remote.exists() || !remote.data().state || cloud.applyingRemote) return;
    cloud.lastFetchedAt = new Date().toISOString();
    const remoteState = normalizeRemoteState(remote.data().state);
    const remoteRevision = Number(remoteState.cloudRevision) || 0;
    cloud.remoteRevision = Math.max(Number(cloud.remoteRevision) || 0, remoteRevision);
    const localRevision = Number(state.cloudRevision) || 0;
    if (remoteRevision > localRevision || (!remoteRevision && !localRevision && remoteState.updatedAt && remoteState.updatedAt !== state.updatedAt)) {
      cloud.applyingRemote = true;
      backupCloudState("snapshot-before-remote-apply", state);
      remoteState.lastCloudSyncAt = cloud.lastFetchedAt;
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
  const minSupportedAppVersion = Math.max(Number(remoteState.minSupportedAppVersion) || 0, MIN_SUPPORTED_APP_VERSION);
  cloud.minSupportedAppVersion = Math.max(Number(cloud.minSupportedAppVersion) || 0, minSupportedAppVersion);
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
    levels: remoteState.levels || DEFAULT_LEVELS,
    appVersion: remoteState.appVersion || APP_VERSION,
    minSupportedAppVersion,
    cloudRevision: Number(remoteState.cloudRevision) || 0,
    lastCloudSyncAt: remoteState.lastCloudSyncAt || null
  };
}

function queueCloudSave() {
  if (!cloud.enabled || cloud.applyingRemote) return;
  if (!isAppVersionSupported()) {
    cloud.versionBlocked = true;
    cloud.versionBlockedMessage = versionBlockedMessage();
    cloud.pendingSave = false;
    if (!view.booting) render();
    return;
  }
  cloud.pendingSave = true;
  if (!cloud.ready || !cloud.initialFetchComplete || !cloud.docRef || !cloud.setDoc) return;
  window.clearTimeout(cloud.saveTimer);
  cloud.saveTimer = window.setTimeout(() => {
    flushCloudSave();
  }, 350);
}

async function flushCloudSave() {
  if (!cloud.enabled || cloud.applyingRemote || !cloud.ready || !cloud.initialFetchComplete || !cloud.docRef || !cloud.setDoc) return;
  if (!isAppVersionSupported()) {
    cloud.versionBlocked = true;
    cloud.versionBlockedMessage = versionBlockedMessage();
    cloud.pendingSave = false;
    render();
    return;
  }
  try {
    const result = await writeCloudState();
    if (result?.blocked === "version") {
      cloud.pendingSave = false;
      render();
      return;
    }
    cloud.pendingSave = Boolean(result?.stale && cloud.mergeLastAt);
    if (result?.saved) cloud.lastSavedAt = new Date().toISOString();
    cloud.error = "";
    cloud.versionBlocked = false;
    cloud.versionBlockedMessage = "";
    render();
  } catch (error) {
    cloud.pendingSave = true;
    cloud.error = error?.message || "Kunne ikke lagre i Firestore";
    console.warn("Firestore save failed:", error);
    render();
  }
}

async function writeCloudState() {
  if (!cloud.docRef || !cloud.setDoc) return { saved: false };
  if (!cloud.initialFetchComplete) {
    cloud.pendingSave = true;
    return { saved: false, blocked: "initial-fetch" };
  }
  if (!isAppVersionSupported()) {
    cloud.versionBlocked = true;
    cloud.versionBlockedMessage = versionBlockedMessage();
    cloud.pendingSave = false;
    return { saved: false, blocked: "version" };
  }
  const now = new Date().toISOString();
  const localRevision = Number(state.cloudRevision) || 0;
  const minSupportedAppVersion = requiredAppVersion();
  backupCloudState("before-cloud-write", state);
  if (cloud.runTransaction && cloud.db) {
    const result = await cloud.runTransaction(cloud.db, async (transaction) => {
      const snapshot = await transaction.get(cloud.docRef);
      const remoteState = snapshot.exists() ? snapshot.data()?.state : null;
      const remoteRevision = Number(remoteState?.cloudRevision) || 0;
      if (remoteState && remoteRevision > localRevision) {
        return { saved: false, stale: true, remoteState, remoteRevision };
      }
      const nextRevision = Math.max(localRevision, remoteRevision) + 1;
      let backupId = null;
      if (remoteState) {
        backupId = cloudBackupId("before-cloud-write", remoteRevision, now);
        transaction.set(
          cloudBackupDocRefForFamily(cloudFamilyId(), backupId),
          cloudBackupPayload("before-cloud-write", remoteState, remoteRevision, now),
          { merge: false }
        );
      }
      const nextState = {
        ...state,
        appVersion: APP_VERSION,
        minSupportedAppVersion,
        cloudRevision: nextRevision,
        lastCloudSyncAt: now,
        updatedAt: state.updatedAt || now
      };
      transaction.set(cloud.docRef, {
        familyId: nextState.familyId || "local-family",
        familyName: nextState.familyName || "",
        state: nextState,
        appVersion: APP_VERSION,
        minSupportedAppVersion,
        cloudRevision: nextRevision,
        updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
      }, { merge: true });
      return { saved: true, nextState, nextRevision, backupId, backupRevision: remoteRevision };
    });
    if (result.stale) {
      applyNewerCloudState(result.remoteState, result.remoteRevision, "stale-write-blocked");
      return { saved: false, stale: true };
    }
    if (result.saved) {
      state = normalizeLocalState(result.nextState, true);
      cloud.remoteRevision = result.nextRevision;
      if (result.backupId) {
        cloud.backupLastAt = now;
        cloud.backupLastRevision = result.backupRevision;
        cloud.backupStatus = `Lagret ${result.backupId}`;
        cloud.backupError = "";
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } else {
    const snapshot = cloud.getDoc ? await cloud.getDoc(cloud.docRef) : null;
    const remoteState = snapshot?.exists() ? snapshot.data()?.state : null;
    const remoteRevision = Number(remoteState?.cloudRevision) || 0;
    if (remoteState && remoteRevision > localRevision) {
      applyNewerCloudState(remoteState, remoteRevision, "stale-write-blocked");
      return { saved: false, stale: true };
    }
    const nextRevision = Math.max(localRevision, remoteRevision) + 1;
    if (remoteState) {
      await writeCloudBackup("before-cloud-write", remoteState, remoteRevision);
    }
    state = normalizeLocalState({
      ...state,
      appVersion: APP_VERSION,
      minSupportedAppVersion,
      cloudRevision: nextRevision,
      lastCloudSyncAt: now
    }, true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    await cloud.setDoc(cloud.docRef, {
      familyId: state.familyId || "local-family",
      familyName: state.familyName || "",
      state,
      appVersion: APP_VERSION,
      minSupportedAppVersion,
      cloudRevision: nextRevision,
      updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : now
    }, { merge: true });
    cloud.remoteRevision = nextRevision;
  }
  await writeFamilyCodeIndex().catch((error) => {
    cloud.familyCodeLookupStatus = "register kunne ikke lagres";
    cloud.familyCodeLookupError = error?.message || "Kunne ikke lagre familiekode-register.";
    console.warn("Family code index write failed:", error);
  });
  await writeAdminHealthStatus({
    pendingSave: false,
    lastCloudSyncAt: now,
    lastError: ""
  }).catch((error) => {
    console.warn("Admin health write failed:", error);
  });
  await writeUserFamilyLink().catch((error) => {
    console.warn("User family link write failed:", error);
  });
  return { saved: true };
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
    appVersion: APP_VERSION,
    minSupportedAppVersion: requiredAppVersion(),
    schemaVersion: state.schemaVersion || SCHEMA_VERSION,
    cloudRevision: Number(state.cloudRevision) || 0,
    childrenCount: state.children?.length || 0,
    tasksCount: state.tasks?.length || 0,
    completionsCount: state.completions?.length || 0,
    rewardsCount: state.rewards?.length || 0,
    badgesCount: state.badges?.length || 0,
    lastCloudSyncAt: state.lastCloudSyncAt || null,
    lastBackupAt: cloud.backupLastAt || null,
    lastBackupRevision: Number(cloud.backupLastRevision) || 0,
    updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
}

async function writeUserFamilyLink() {
  const uid = cloud.authUser?.uid;
  if (!cloud.setDoc || !uid || cloud.authUser?.isAnonymous || !state.setupCompleted) return;
  const linkRef = userFamilyLinkRef(uid);
  if (!linkRef) return;
  const role = state.ownerUid === uid ? "owner" : activeAdultUsers().find((user) => user.uid === uid)?.role || "adult";
  await cloud.setDoc(linkRef, {
    familyId: state.familyId || cloudFamilyId(),
    cloudFamilyId: cloudFamilyId(),
    familyName: state.familyName || "",
    familyCode: state.familyCode || "",
    role,
    appVersion: APP_VERSION,
    minSupportedAppVersion: requiredAppVersion(),
    updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
}

async function registerServiceWorkerAndUpdate() {
  if (!("serviceWorker" in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    if (view.appUpdateReloading) {
      window.location.reload();
    } else {
      view.appUpdateAvailable = true;
      if (!view.booting) render();
    }
  });
  try {
    if (view.booting) {
      view.bootMessage = "Sjekker appversjon";
      render();
    }
    const registration = await navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`);
    view.serviceWorkerRegistration = registration;
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      view.appUpdateInstalling = true;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          markAppUpdateAvailable(registration);
        }
      });
    });
    await registration.update();
    if (registration.waiting) {
      markAppUpdateAvailable(registration);
    }
  } catch (error) {
    console.warn("Service worker update unavailable:", error);
  }
}

function startBackgroundServices() {
  registerServiceWorkerAndUpdate().finally(() => {
    if (!view.booting) render();
  });
  if (!isSetupPreview()) {
    initFirebaseSync().finally(() => {
      if (!view.booting) render();
    });
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
  validateStartupProfile();
  view.booting = false;
  queueScrollTop();
  render();
  startBackgroundServices();
}

startApp();
