const STORAGE_KEY = "familieoppdrag.v1";
const DEVICE_PROFILE_KEY = "familieoppdrag.deviceProfile";
const PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
const APP_VERSION = "30";
const FIREBASE_ENABLED = true;
const FAMILY_ID = "familieoppdrag";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAMPfQ9gX9rbuvcPsVjYVtq5IT_orjDBPs",
  authDomain: "home-tasks-app-18de3.firebaseapp.com",
  projectId: "home-tasks-app-18de3",
  storageBucket: "home-tasks-app-18de3.firebasestorage.app",
  messagingSenderId: "253720858709",
  appId: "1:253720858709:web:62bd1844be04ee76c384dc"
};

const cloud = {
  enabled: FIREBASE_ENABLED,
  ready: false,
  status: "Kobler til Firestore ...",
  error: "",
  docRef: null,
  setDoc: null,
  serverTimestamp: null,
  unsubscribe: null,
  saveTimer: null,
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
  { id: "bonus-star", icon: "✨", name: "Bonusstjerne", description: "Fullfør et bonusoppdrag.", isEarned: (childId) => completedBonusCount(childId) >= 1 },
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
  creatingTask: false,
  taskFilters: { search: "", category: "all", child: "all", status: "all" },
  avatarPickerChildId: null,
  gate: null
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
    familyName: "",
    familyCode: createFamilyCode(),
    setupCompleted: false,
    parentPinHash: PIN_HASH,
    children: [],
    tasks: [],
    completions: [],
    rewards: [],
    redemptions: [],
    transactions: [],
    history: [],
    levels: DEFAULT_LEVELS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, false);
}

function normalizeLocalState(savedState = {}, existingInstall = true) {
  const hasConfiguredData = Boolean(savedState.setupCompleted || savedState.children?.length || savedState.tasks?.length || savedState.rewards?.length);
  return {
    familyId: savedState.familyId || "local-family",
    familyName: savedState.familyName || "Familien",
    familyCode: savedState.familyCode || familyCodeFromSeed(`${savedState.familyId || "local-family"}-${savedState.createdAt || "start"}`),
    setupCompleted: savedState.setupCompleted ?? (existingInstall && hasConfiguredData),
    parentPinHash: savedState.parentPinHash || PIN_HASH,
    children: normalizeChildren(savedState.children || childrenSeed),
    tasks: normalizeTasks(savedState.tasks || taskSeeds),
    completions: savedState.completions || [],
    rewards: normalizeRewards(savedState.rewards || rewardSeeds),
    redemptions: savedState.redemptions || [],
    transactions: savedState.transactions || [],
    history: savedState.history || [],
    badges: savedState.badges || [],
    levels: savedState.levels || DEFAULT_LEVELS,
    createdAt: savedState.createdAt || new Date().toISOString(),
    updatedAt: savedState.updatedAt || new Date().toISOString()
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
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueCloudSave();
}

function render() {
  if (pendingFamilyCode() && state.setupCompleted) {
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
}

function renderDeviceConnect() {
  const code = pendingFamilyCode();
  const matchesFamily = normalizeFamilyCode(code) === normalizeFamilyCode(state.familyCode);
  app.innerHTML = `
    <header class="topbar setup-topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Koble til enhet</h1>
        </div>
      </div>
    </header>
    <section class="setup-shell">
      <div class="setup-intro">
        <h2>${matchesFamily ? "Velg startside" : "Fant ikke familien"}</h2>
        <p>${matchesFamily ? `${escapeText(state.familyName)} er klar på denne enheten. Velg hva appen skal åpne med.` : "Denne versjonen kan bare koble til en familie som allerede er lastet inn på enheten. Når flerfamilie-synk er på plass, kan denne lenken hente riktig familie automatisk."}</p>
      </div>
      <div class="panel setup-form">
        ${matchesFamily ? `
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
            <p class="muted">Foreløpig må familien finnes på enheten før koden kan brukes. Dette er forberedelsen til ekte invitasjonslenker med sentral hosting.</p>
          </div>
        `}
        <div class="actions">
          <button class="btn secondary" data-action="cancel-connect">Til appen</button>
        </div>
      </div>
    </section>
  `;
}

function renderSetup() {
  const packageOptions = STARTER_PACKAGES.map((pack) => `
    <label class="setup-option">
      <input type="checkbox" name="starterPackage" value="${pack.id}" checked>
      <span>
        <strong>${pack.title}</strong>
        <small>${pack.description}</small>
      </span>
    </label>
  `).join("");

  app.innerHTML = `
    <header class="topbar setup-topbar">
      <div class="brand">
        <div class="brand-mark">⭐</div>
        <div>
          <p class="eyebrow">Familieoppdrag</p>
          <h1>Sett opp familien</h1>
        </div>
      </div>
    </header>
    <section class="setup-shell">
      <div class="setup-intro">
        <h2>Klar på noen minutter</h2>
        <p>Legg inn familien, barna og en voksen-PIN. Etterpå kan alt justeres fra voksenpanelet.</p>
      </div>
      <form data-form="first-setup" class="panel setup-form">
        <div class="form-grid">
          ${field("familyName", "Familienavn", state.familyName === "Familien" ? "" : state.familyName, "text")}
          <div class="field">
            <label>Ny voksen-PIN</label>
            <input name="pin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" required>
          </div>
          <div class="field">
            <label>Gjenta PIN</label>
            <input name="repeatPin" type="password" inputmode="numeric" autocomplete="new-password" minlength="4" required>
          </div>
        </div>
        <div class="setup-block">
          <h3>Barn</h3>
          <div class="form-grid">
            ${[0, 1, 2, 3, 4].map((index) => `
              <div class="field">
                <label>Barn ${index + 1}${index === 0 ? "" : " (valgfritt)"}</label>
                <input name="childName" type="text" value="" ${index === 0 ? "required" : ""}>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="setup-block">
          <h3>Startpakker</h3>
          <div class="setup-options">${packageOptions}</div>
        </div>
        <div class="actions">
          <button class="btn" type="submit">Start familien</button>
        </div>
      </form>
    </section>
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
  const daily = childPeriodTasks(child.id, "daily");
  const weekly = childPeriodTasks(child.id, "weekly");
  const bonus = childPeriodTasks(child.id, "once");
  return `
    ${groupedTaskSection("Dagens oppdrag", daily, child.id)}
    ${taskSection("Ukens oppdrag", weekly, child.id)}
    ${taskSection("Bonusoppdrag", bonus, child.id)}
  `;
}

function groupedTaskSection(title, items, childId) {
  const categories = ["Morgen", "Etter skole", "Kveld", "Helg", "Bonus"];
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
        <button class="btn secondary" data-action="set-device-adult">📌 Standard</button>
        <button class="btn secondary" data-action="home">🏠</button>
        <button class="btn danger" data-action="lock-adult">Lås</button>
      </div>
    </header>
    <nav class="tabs" aria-label="Voksenmeny">
      ${["overview:Oversikt", "approvals:Godkjenninger", "tasks:Oppgaver", "rewards:Belønninger", "children:Barn", "history:Historikk", "settings:Innstillinger"].map((entry) => {
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
        <select name="days">
          ${[["all", "Alle dager"], ["weekdays", "Hverdager"], ["weekend", "Helg"], ["monday", "Mandag"], ["tuesday", "Tirsdag"], ["wednesday", "Onsdag"], ["thursday", "Torsdag"], ["friday", "Fredag"], ["saturday", "Lørdag"], ["sunday", "Søndag"]].map(([value, label]) => `<option value="${value}" ${task?.days?.includes(value) ? "selected" : ""}>${label}</option>`).join("")}
        </select>
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
  return `
    <section class="panel">
      <h2>${reward ? "Endre belønning" : "Ny belønning"}</h2>
      ${rewardForm(reward)}
    </section>
    <section>
      <div class="section-title"><h2>Belønninger</h2><span class="small">${state.rewards.length} totalt</span></div>
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
  return `
    <section class="panel">
      <div class="section-title compact-title">
        <div>
          <h2>${editingChild ? "Endre barn" : "Legg til barn"}</h2>
          <p class="muted">${editingChild ? "Oppdater navn, ikon, farge og om profilen skal være synlig." : "Nye barn legges automatisk til på aktive oppgaver og belønninger."}</p>
        </div>
        ${editingChild ? `<button class="btn secondary" type="button" data-action="cancel-edit-child">Avbryt</button>` : ""}
      </div>
      ${childForm(editingChild)}
    </section>
    <section class="dashboard-grid">
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
  return `
    <section class="panel">
      <h2>Familie</h2>
      <p class="muted">Dette gjør appen enklere å dele og flytte til flerfamilie-oppsett senere.</p>
      <form data-form="family-settings" class="form-grid" style="margin-top:18px">
        ${field("familyName", "Familienavn", state.familyName || "", "text")}
        <div class="field">
          <label>Intern familie-id</label>
          <input name="familyId" type="text" value="${escapeAttr(state.familyId || "local-family")}" required>
        </div>
        <div class="field">
          <label>Familiekode</label>
          <input name="familyCode" type="text" value="${escapeAttr(state.familyCode || "")}" readonly>
        </div>
        <div class="actions" style="align-self:end">
          <button class="btn" type="submit">Lagre familie</button>
        </div>
      </form>
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="copy-family-link">Kopier koblingslenke</button>
        <button class="btn secondary" data-action="new-family-code">Lag ny kode</button>
      </div>
      <p class="small">Koblingslenken brukes for å velge standardprofil på en ny eller felles enhet. Senere kan samme flyt kobles til ekte invitasjon via Firebase.</p>
    </section>
    <section class="panel">
      <h2>Innstillinger</h2>
      <p class="muted">Appen lagrer lokalt i nettleseren og synker med Firestore når tilkoblingen er aktiv.</p>
      <div class="pill-row">
        <span class="pill">Standard: ${deviceProfileLabel()}</span>
        <span class="pill ${cloud.ready ? "done" : cloud.error ? "rejected" : "pending"}">${cloudStatusLabel()}</span>
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
      <div class="actions" style="margin-top:14px">
        <button class="btn secondary" data-action="export-data">Eksporter data</button>
        <button class="btn secondary" data-action="refresh-app">Oppdater app</button>
      </div>
    </section>
    <section class="panel">
      <h2>Startpakker</h2>
      <p class="muted">Legg inn standard oppgaver og belønninger for en ny familie. Appen hopper over elementer som allerede finnes.</p>
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
    <section class="panel">
      <h2>Nivåer</h2>
      <p class="muted">Endre navn og hvor mange livstidspoeng som kreves for hvert nivå.</p>
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
    <section class="panel danger-zone">
      <h2>Sikkerhet</h2>
      <p class="muted">Nullstilling sletter appdata og legger inn startoppsettet på nytt. Brukes bare hvis dere vil begynne helt på nytt.</p>
      <button class="btn warning" data-action="seed-demo">Nullstill til startdata</button>
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
    days: [data.get("days")],
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
  saveState();
  showToast("Belønningen er lagret.");
  render();
}

async function completeFirstSetup(form) {
  const data = new FormData(form);
  const familyName = String(data.get("familyName") || "").trim();
  const pin = String(data.get("pin") || "");
  const repeatPin = String(data.get("repeatPin") || "");
  const childNames = data.getAll("childName").map((name) => String(name).trim()).filter(Boolean);

  if (!familyName) return showToast("Familien må ha et navn.");
  if (pin.length < 4) return showToast("PIN må ha minst 4 tegn.");
  if (pin !== repeatPin) return showToast("PIN-kodene er ikke like.");
  if (!childNames.length) return showToast("Legg inn minst ett barn.");

  const now = new Date().toISOString();
  state = normalizeLocalState({
    familyId: uniqueFamilyId(familyName),
    familyName,
    familyCode: createFamilyCode(),
    setupCompleted: true,
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

  data.getAll("starterPackage").forEach((packageId) => {
    addStarterPackage(packageId, activeChildIds());
  });

  view.mode = "home";
  view.childId = null;
  view.childTab = "tasks";
  view.adultTab = "overview";
  view.adultUnlocked = false;
  localStorage.setItem(DEVICE_PROFILE_KEY, "home");
  saveState();
  showToast("Familien er satt opp.");
  render();
}

function saveFamilySettings(form) {
  const data = new FormData(form);
  const familyName = String(data.get("familyName") || "").trim();
  const familyId = slugify(data.get("familyId") || "") || "local-family";
  if (!familyName) return showToast("Familien må ha et navn.");
  state.familyName = familyName;
  state.familyId = familyId;
  state.familyCode = state.familyCode || createFamilyCode();
  state.setupCompleted = true;
  saveState();
  showToast("Familieinnstillinger er lagret.");
  render();
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
  if (cloud.ready) return "Synker med Firestore";
  if (cloud.error) return "Lokal fallback";
  return cloud.status;
}

function setDeviceProfile(profile) {
  localStorage.setItem(DEVICE_PROFILE_KEY, profile);
  showToast("Standardprofil er lagret for denne enheten.");
}

function pendingFamilyCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("familiekode") || params.get("join") || "";
}

function clearPendingFamilyCode() {
  const url = new URL(window.location.href);
  url.searchParams.delete("familiekode");
  url.searchParams.delete("join");
  window.history.replaceState({}, "", url);
}

function familyLink() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("familiekode", state.familyCode || "");
  return url.toString();
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

  if (action === "home") {
    goHome();
  }
  if (action === "cancel-connect") {
    clearPendingFamilyCode();
    render();
  }
  if (action === "connect-device") {
    connectDevice(button.dataset.profile);
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
  if (action === "edit-reward") {
    view.editingRewardId = id;
    render();
  }
  if (action === "cancel-edit-reward") {
    view.editingRewardId = null;
    render();
  }
  if (action === "edit-child") {
    view.editingChildId = child;
    render();
  }
  if (action === "cancel-edit-child") {
    view.editingChildId = null;
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
  if (action === "copy-family-link") {
    copyFamilyLink();
  }
  if (action === "new-family-code" && confirm("Vil du lage en ny familiekode? Gamle koblingslenker vil slutte å passe.")) {
    state.familyCode = createFamilyCode();
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
  if (action === "seed-demo") {
    const typed = prompt('Skriv "Nullstill" for å låse opp nullstilling.');
    if (typed !== "Nullstill") {
      showToast("Nullstilling ble avbrutt.");
      return;
    }
    if (confirm("Er du helt sikker på at du vil nullstille appen og starte førstegangsoppsettet på nytt? Dette kan ikke angres.")) {
      localStorage.removeItem(STORAGE_KEY);
      state = loadState();
      saveState();
      showToast("Appen er nullstilt.");
      render();
    }
  }
  if (action === "export-data") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `familieoppdrag-${dateKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
});

app.addEventListener("change", (event) => {
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
    const [{ initializeApp }, { getAuth, signInAnonymously, onAuthStateChanged }, { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js")
    ]);

    const firebaseApp = initializeApp(FIREBASE_CONFIG);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    cloud.docRef = doc(db, "families", FAMILY_ID, "appState", "current");
    cloud.setDoc = setDoc;
    cloud.serverTimestamp = serverTimestamp;

    await new Promise((resolve, reject) => {
      const stop = onAuthStateChanged(auth, (user) => {
        if (user) {
          stop();
          resolve(user);
        }
      }, reject);
      signInAnonymously(auth).catch(reject);
    });

    const snapshot = await getDoc(cloud.docRef);
    if (snapshot.exists() && snapshot.data().state) {
      cloud.applyingRemote = true;
      state = normalizeRemoteState(snapshot.data().state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloud.applyingRemote = false;
    } else {
      await writeCloudState();
    }

    cloud.unsubscribe = onSnapshot(cloud.docRef, (remote) => {
      if (!remote.exists() || !remote.data().state || cloud.applyingRemote) return;
      const remoteState = normalizeRemoteState(remote.data().state);
      if (remoteState.updatedAt && remoteState.updatedAt !== state.updatedAt) {
        cloud.applyingRemote = true;
        state = remoteState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        cloud.applyingRemote = false;
        render();
      }
    });

    cloud.ready = true;
    cloud.status = "Synker med Firestore";
    cloud.error = "";
    render();
  } catch (error) {
    cloud.ready = false;
    cloud.error = error?.message || "Kunne ikke koble til Firestore";
    console.warn("Firestore sync unavailable:", error);
    render();
  }
}

function normalizeRemoteState(remoteState) {
  return {
    ...loadState(),
    ...remoteState,
    familyCode: remoteState.familyCode || familyCodeFromSeed(`${remoteState.familyId || "local-family"}-${remoteState.createdAt || "remote"}`),
    setupCompleted: remoteState.setupCompleted ?? true,
    children: normalizeChildren(remoteState.children || []),
    tasks: normalizeTasks(remoteState.tasks || []),
    completions: remoteState.completions || [],
    rewards: normalizeRewards(remoteState.rewards || []),
    redemptions: remoteState.redemptions || [],
    transactions: remoteState.transactions || [],
    history: remoteState.history || [],
    badges: remoteState.badges || [],
    levels: remoteState.levels || DEFAULT_LEVELS
  };
}

function queueCloudSave() {
  if (!cloud.enabled || !cloud.ready || cloud.applyingRemote || !cloud.docRef) return;
  window.clearTimeout(cloud.saveTimer);
  cloud.saveTimer = window.setTimeout(() => {
    writeCloudState().catch((error) => {
      cloud.error = error?.message || "Kunne ikke lagre i Firestore";
      console.warn("Firestore save failed:", error);
      render();
    });
  }, 350);
}

async function writeCloudState() {
  if (!cloud.docRef || !cloud.setDoc) return;
  await cloud.setDoc(cloud.docRef, {
    familyId: FAMILY_ID,
    state,
    updatedAt: cloud.serverTimestamp ? cloud.serverTimestamp() : new Date().toISOString()
  }, { merge: true });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`./service-worker.js?v=${APP_VERSION}`).catch(() => {});
  });
}

if (view.mode?.startsWith("child:")) {
  const childId = view.mode.replace("child:", "");
  if (getChild(childId)?.active === false) {
    view.mode = "home";
    view.childId = null;
    localStorage.setItem(DEVICE_PROFILE_KEY, "home");
  } else {
    view.childId = childId;
    view.mode = "child";
  }
}
if (view.mode === "adult") {
  view.mode = "adult";
}

render();
initFirebaseSync();
