const SESSION_KEY = "gda.session";
const SCOPE_MIGRATION = "gda.dataScope.v1";
const LEGACY_STORE_KEYS = [
  "seedVersion",
  "users",
  "tasks",
  "rewards",
  "transactions",
  "redemptions",
  "focusSessions",
  "currentChildId",
  "lastReset",
  "gamePlays",
  "gameResults",
  "completions",
  "explorerWords",
  "explorerReviews",
  "vocabProgress",
  "exchangeVideos",
  "exchangeLearned",
];

const FAMILIES_KEY = "gda.families";

function readSessionRecord() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function isDemoSession() {
  const session = readSessionRecord();
  return session?.username === "parent" || session?.username === "child";
}

function accountPrefix() {
  const session = readSessionRecord();
  if (!session) return "gda.guest";
  if (session.username === "parent" || session.username === "child") return "gda.demo";
  if (session.familyId) return `gda.fam.${session.familyId}`;
  if (session.userId) return `gda.acct.${session.userId}`;
  return "gda.guest";
}

function sk() {
  const prefix = accountPrefix();
  return {
    seedVersion: `${prefix}.seedVersion`,
    ready: `${prefix}.ready`,
    users: `${prefix}.users`,
    tasks: `${prefix}.tasks`,
    rewards: `${prefix}.rewards`,
    transactions: `${prefix}.transactions`,
    redemptions: `${prefix}.redemptions`,
    focusSessions: `${prefix}.focusSessions`,
    currentChildId: `${prefix}.currentChildId`,
    lastReset: `${prefix}.lastReset`,
    gamePlays: `${prefix}.gamePlays`,
    gameResults: `${prefix}.gameResults`,
    completions: `${prefix}.completions`,
    explorerWords: `${prefix}.explorerWords`,
    explorerReviews: `${prefix}.explorerReviews`,
    vocabProgress: `${prefix}.vocabProgress`,
    exchangeVideos: `${prefix}.exchangeVideos`,
    exchangeLearned: `${prefix}.exchangeLearned`,
    bookProgress: `${prefix}.bookProgress`,
  };
}

export const DATA_EVENT = "gda-data";
export const TASK_TYPES = [
  { id: "study", label: "学习" },
  { id: "life", label: "生活" },
  { id: "sport", label: "运动" },
  { id: "custom", label: "自定义" },
];

const SEED_VERSION = "core-loop-1";
export const ONLY_CHILD_ID = "u-child-01";
export const DAILY_GAME_LIMIT = 3;
export const GAME_PLAY_COST = 5;
export const EXPLORE_POINTS = 5;
export const BOTTLE_POINTS = 5;
export const VOCAB_UNLOCK_HITS = 8;
export const VOCAB_BUNDLED_BANDS = 3;
export const VOCAB_MAX_BAND = 25;
export const EXPLORE_DAILY_POINT_CAP = 20;
export const EXCHANGE_POINTS = 5;
export const BOOK_PAGE_POINTS = 5;
export const EXCHANGE_LANGS = [
  { id: "en", label: "英语", en: "English" },
  { id: "zh", label: "汉语", en: "Chinese" },
];

export function todayStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function notify() {
  window.dispatchEvent(new Event(DATA_EVENT));
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
  notify();
}

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return todayStr(date);
}

function buildSeed() {
  const today = todayStr();
  return {
    users: [
      {
        id: "u-parent-01",
        name: "家长",
        role: "parent",
        password: "1234",
        childIds: ["u-child-01"],
      },
      { id: "u-child-01", name: "小勇士", role: "child", password: "1234", avatar: "🦁", nativeLang: "zh" },
    ],
    tasks: [
      {
        id: "t-01",
        title: "写作业 30 分钟",
        type: "study",
        points: 10,
        status: "pending",
        childId: "u-child-01",
        repeat: "daily",
        createdAt: today,
        dueDate: today,
      },
      {
        id: "t-02",
        title: "整理书桌",
        type: "life",
        points: 5,
        status: "pending",
        childId: "u-child-01",
        repeat: "daily",
        createdAt: today,
        dueDate: today,
      },
      {
        id: "t-03",
        title: "朗读英语",
        type: "study",
        points: 8,
        status: "pending",
        childId: "u-child-01",
        repeat: "once",
        createdAt: today,
        dueDate: today,
      },
    ],
    rewards: [
      {
        id: "r-01",
        title: "小零食一份",
        cost: 25,
        image: "",
        childId: "u-child-01",
      },
      {
        id: "r-02",
        title: "周末看一集动画片",
        cost: 40,
        image: "",
        childId: "u-child-01",
      },
      {
        id: "r-03",
        title: "去公园玩一次",
        cost: 60,
        image: "",
        childId: "u-child-01",
      },
    ],
    transactions: [
      { id: "x-01", childId: "u-child-01", type: "earn", amount: 50, date: daysAgo(2), reason: "完成：阅读打卡" },
      { id: "x-02", childId: "u-child-01", type: "earn", amount: 60, date: daysAgo(1), reason: "完成：数学练习" },
      { id: "x-03", childId: "u-child-01", type: "earn", amount: 10, date: daysAgo(2), reason: "完成：整理房间" },
    ],
    redemptions: [],
    focusSessions: [
      { id: "f-01", childId: "u-child-01", taskId: null, minutes: 25, date: daysAgo(1), status: "success", extraPoints: 5 },
      { id: "f-02", childId: "u-child-01", taskId: null, minutes: 10, date: daysAgo(2), status: "failed", extraPoints: 0 },
    ],
    explorerWords: [],
    explorerReviews: {},
    exchangeVideos: [],
    exchangeLearned: [],
  };
}

function buildBlankFamily() {
  return {
    users: [
      {
        id: "u-parent-01",
        name: "家长",
        role: "parent",
        childIds: ["u-child-01"],
      },
      { id: "u-child-01", name: "小勇士", role: "child", avatar: "🦁", nativeLang: "zh" },
    ],
    tasks: [],
    rewards: [],
    transactions: [],
    redemptions: [],
    focusSessions: [],
    explorerWords: [],
    explorerReviews: {},
    exchangeVideos: [],
    exchangeLearned: [],
  };
}

function writeFamily(prefix, family, extras = {}) {
  localStorage.setItem(`${prefix}.users`, JSON.stringify(family.users));
  localStorage.setItem(`${prefix}.tasks`, JSON.stringify(family.tasks));
  localStorage.setItem(`${prefix}.rewards`, JSON.stringify(family.rewards));
  localStorage.setItem(`${prefix}.transactions`, JSON.stringify(family.transactions));
  localStorage.setItem(`${prefix}.redemptions`, JSON.stringify(family.redemptions));
  localStorage.setItem(`${prefix}.focusSessions`, JSON.stringify(family.focusSessions));
  if (family.explorerWords) {
    localStorage.setItem(`${prefix}.explorerWords`, JSON.stringify(family.explorerWords));
  } else if (localStorage.getItem(`${prefix}.explorerWords`) == null) {
    localStorage.setItem(`${prefix}.explorerWords`, "[]");
  }
  if (family.explorerReviews && typeof family.explorerReviews === "object") {
    localStorage.setItem(`${prefix}.explorerReviews`, JSON.stringify(family.explorerReviews));
  } else if (localStorage.getItem(`${prefix}.explorerReviews`) == null) {
    localStorage.setItem(`${prefix}.explorerReviews`, "{}");
  }
  if (family.exchangeVideos) {
    localStorage.setItem(`${prefix}.exchangeVideos`, JSON.stringify(family.exchangeVideos));
  } else if (localStorage.getItem(`${prefix}.exchangeVideos`) == null) {
    localStorage.setItem(`${prefix}.exchangeVideos`, "[]");
  }
  if (family.exchangeLearned) {
    localStorage.setItem(`${prefix}.exchangeLearned`, JSON.stringify(family.exchangeLearned));
  } else if (localStorage.getItem(`${prefix}.exchangeLearned`) == null) {
    localStorage.setItem(`${prefix}.exchangeLearned`, "[]");
  }
  localStorage.setItem(`${prefix}.completions`, JSON.stringify(extras.completions || []));
  localStorage.setItem(
    `${prefix}.currentChildId`,
    extras.currentChildId || localStorage.getItem(`${prefix}.currentChildId`) || ONLY_CHILD_ID,
  );
  localStorage.setItem(`${prefix}.lastReset`, extras.lastReset || todayStr());
  localStorage.setItem(`${prefix}.gamePlays`, extras.gamePlays || "{}");
  localStorage.setItem(`${prefix}.gameResults`, extras.gameResults || "{}");
  localStorage.setItem(`${prefix}.ready`, "1");
}

function readFamilies() {
  try {
    const list = JSON.parse(localStorage.getItem(FAMILIES_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeFamilies(list) {
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(list));
}

function generateFamilyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createFamilyForParent(parentUserId) {
  const families = readFamilies();
  let code = generateFamilyCode();
  while (families.some((item) => item.code === code)) code = generateFamilyCode();
  const family = {
    id: `fam-${parentUserId}`,
    code,
    parentUserId,
    childIds: [],
  };
  writeFamilies([family, ...families.filter((item) => item.parentUserId !== parentUserId)]);
  return family;
}

export function findFamilyByCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;
  return readFamilies().find((item) => item.code === normalized) || null;
}

export function getFamilyByUserId(userId) {
  if (!userId) return null;
  return (
    readFamilies().find((item) => item.parentUserId === userId || item.childIds.includes(userId)) || null
  );
}

export function resetFamilyCode(parentUserId) {
  const families = readFamilies();
  const current = families.find((item) => item.parentUserId === parentUserId);
  if (!current) return null;
  let code = generateFamilyCode();
  while (families.some((item) => item.code === code && item.id !== current.id)) code = generateFamilyCode();
  const next = families.map((item) => (item.id === current.id ? { ...item, code } : item));
  writeFamilies(next);
  notify();
  return { ...current, code };
}

export function getFamilyChildren() {
  ensureSeed();
  return getUsers().filter((item) => item.role === "child");
}

export function bindChildToFamily(family, childAccount) {
  const families = readFamilies();
  const nextFamilies = families.map((item) => {
    if (item.id !== family.id) return item;
    if (item.childIds.includes(childAccount.id)) return item;
    return { ...item, childIds: [...item.childIds, childAccount.id] };
  });
  writeFamilies(nextFamilies);

  const prefix = `gda.fam.${family.id}`;
  if (localStorage.getItem(`${prefix}.ready`) !== "1") {
    writeFamily(
      prefix,
      {
        users: [
          {
            id: family.parentUserId,
            name: "家长",
            role: "parent",
            childIds: [childAccount.id],
          },
        ],
        tasks: [],
        rewards: [],
        transactions: [],
        redemptions: [],
        focusSessions: [],
      },
      { lastReset: todayStr() },
    );
  }
  const users = readList(`${prefix}.users`);
  const parent = users.find((item) => item.role === "parent");
  if (parent && !parent.childIds?.includes(childAccount.id)) {
    parent.childIds = [...(parent.childIds || []), childAccount.id];
  }
  if (!users.some((item) => item.id === childAccount.id)) {
    users.push({
      id: childAccount.id,
      name: childAccount.name,
      role: "child",
      avatar: "🦁",
    });
  } else {
    users.forEach((item) => {
      if (item.id === childAccount.id) item.name = childAccount.name;
    });
  }
  localStorage.setItem(`${prefix}.users`, JSON.stringify(users));
  notify();
}

export function initParentFamilyWorkspace(parentUserId, nickname) {
  const family = createFamilyForParent(parentUserId);
  const prefix = `gda.fam.${family.id}`;
  writeFamily(
    prefix,
    {
      users: [
        {
          id: parentUserId,
          name: nickname || "家长",
          role: "parent",
          childIds: [],
        },
      ],
      tasks: [],
      rewards: [],
      transactions: [],
      redemptions: [],
      focusSessions: [],
    },
    { lastReset: todayStr() },
  );
  notify();
  return family;
}

function migrateLegacyOnce() {
  if (localStorage.getItem(SCOPE_MIGRATION) === "1") return;
  for (const name of LEGACY_STORE_KEYS) {
    const demoKey = `gda.demo.${name}`;
    const legacyKey = `gda.${name}`;
    if (localStorage.getItem(demoKey) == null) {
      const legacy = localStorage.getItem(legacyKey);
      if (legacy != null) localStorage.setItem(demoKey, legacy);
    }
  }
  if (!localStorage.getItem("gda.demo.seedVersion")) {
    localStorage.setItem("gda.demo.seedVersion", SEED_VERSION);
  }
  writeFamily("gda.live", buildBlankFamily(), { lastReset: todayStr() });
  localStorage.setItem(SCOPE_MIGRATION, "1");
  notify();
}

export function ensureSeed() {
  migrateLegacyOnce();
  const keys = sk();
  if (isDemoSession()) {
    if (localStorage.getItem(keys.seedVersion) !== SEED_VERSION) {
      const seed = buildSeed();
      writeFamily("gda.demo", seed, { lastReset: todayStr() });
      localStorage.setItem(keys.seedVersion, SEED_VERSION);
    }
    purgeOtherChildren();
  } else if (localStorage.getItem(keys.ready) !== "1") {
    const session = readSessionRecord();
    if (session?.familyId) {
      const family = getFamilyByUserId(session.userId);
      const childIds = family?.childIds || [];
      writeFamily(
        accountPrefix(),
        {
          users: [
            {
              id: family?.parentUserId || session.userId,
              name: session.role === "parent" ? session.name || "家长" : "家长",
              role: "parent",
              childIds,
            },
            ...childIds.map((id) => ({
              id,
              name: id === session.userId ? session.name || "孩子" : "孩子",
              role: "child",
              avatar: "🦁",
            })),
          ],
          tasks: [],
          rewards: [],
          transactions: [],
          redemptions: [],
          focusSessions: [],
        },
        { lastReset: todayStr() },
      );
    }
  }
  rollDailyTasks();
  ensureCompletions();
  if (localStorage.getItem(keys.explorerWords) == null) {
    localStorage.setItem(keys.explorerWords, "[]");
  }
  if (localStorage.getItem(keys.explorerReviews) == null) {
    localStorage.setItem(keys.explorerReviews, "{}");
  }
  if (localStorage.getItem(keys.vocabProgress) == null) {
    localStorage.setItem(keys.vocabProgress, "{}");
  }
  if (localStorage.getItem(keys.exchangeVideos) == null) {
    localStorage.setItem(keys.exchangeVideos, "[]");
  }
  if (localStorage.getItem(keys.exchangeLearned) == null) {
    localStorage.setItem(keys.exchangeLearned, "[]");
  }
  if (localStorage.getItem(keys.bookProgress) == null) {
    localStorage.setItem(keys.bookProgress, "{}");
  }
}

function keepOnlyXiaoyu(list) {
  return (list || []).filter((item) => !item.childId || item.childId === ONLY_CHILD_ID);
}

function purgeOtherChildren() {
  const users = readList(sk().users).filter(
    (user) => user.id === "u-parent-01" || user.id === ONLY_CHILD_ID,
  );
  const parent = users.find((user) => user.id === "u-parent-01");
  if (parent) parent.childIds = [ONLY_CHILD_ID];
  const onlyChild = users.find((user) => user.id === ONLY_CHILD_ID);
  if (onlyChild && !onlyChild.name) onlyChild.name = "小勇士";
  localStorage.setItem(sk().users, JSON.stringify(users));
  localStorage.setItem(sk().tasks, JSON.stringify(keepOnlyXiaoyu(readList(sk().tasks))));
  localStorage.setItem(sk().rewards, JSON.stringify(keepOnlyXiaoyu(readList(sk().rewards))));
  localStorage.setItem(sk().transactions, JSON.stringify(keepOnlyXiaoyu(readList(sk().transactions))));
  localStorage.setItem(sk().redemptions, JSON.stringify(keepOnlyXiaoyu(readList(sk().redemptions))));
  localStorage.setItem(sk().focusSessions, JSON.stringify(keepOnlyXiaoyu(readList(sk().focusSessions))));
  localStorage.setItem(sk().completions, JSON.stringify(keepOnlyXiaoyu(readList(sk().completions))));
  localStorage.setItem(sk().currentChildId, ONLY_CHILD_ID);
}

function rollDailyTasks() {
  const today = todayStr();
  if (localStorage.getItem(sk().lastReset) === today) return;
  const next = readList(sk().tasks).map((task) => {
    if (task.repeat === "daily") {
      if (task.status === "awaiting_confirm") return task;
      return {
        ...task,
        status: "pending",
        startedAt: undefined,
        completedAt: undefined,
        photo: undefined,
        dueDate: today,
      };
    }
    if (
      task.repeat === "once" &&
      (task.status === "pending" || task.status === "in_progress") &&
      task.dueDate &&
      task.dueDate < today
    ) {
      return { ...task, status: "overdue" };
    }
    if (task.repeat === "weekly" && task.completedAt) {
      const completed = new Date(task.completedAt);
      const now = new Date();
      const sameWeek = completed.getFullYear() === now.getFullYear() && weekNumber(completed) === weekNumber(now);
      if (!sameWeek) {
        return { ...task, status: "pending", startedAt: undefined, completedAt: undefined, dueDate: today };
      }
    }
    return task;
  });
  localStorage.setItem(sk().tasks, JSON.stringify(next));
  localStorage.setItem(sk().lastReset, today);
  expireExplorerReviewsForNewDay(today);
}

function weekNumber(date) {
  const first = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - first) / 86400000 + first.getDay() + 1) / 7);
}

export function getUsers() {
  ensureSeed();
  return readList(sk().users);
}

export function getChildById(childId) {
  const id = childId || getActiveChildId();
  return getUsers().find((user) => user.id === id && user.role === "child") || null;
}

export function childLabel(child) {
  const nick = String(child?.nickname || "").trim();
  if (nick) return nick;
  const name = String(child?.name || "").trim();
  if (name && name !== "还没有绑定孩子") return name;
  return "小勇士";
}

export function getOnlyChild() {
  if (isDemoSession()) {
    ensureSeed();
    return (
      getUsers().find((user) => user.role === "child") || {
        id: ONLY_CHILD_ID,
        name: "小勇士",
        role: "child",
        avatar: "🦁",
      }
    );
  }
  // 先尝试从 session 中获取孩子
  const session = readSessionRecord();
  if (session) {
    const childKey = `gda.child.${session.userId}`;
    const childData = localStorage.getItem(childKey);
    if (childData) {
      try {
        return JSON.parse(childData);
      } catch {}
    }
    // 如果没有孩子数据，创建一个默认孩子
    const defaultChild = {
      id: `child-${Date.now()}`,
      name: "小勇士",
      avatar: "🧒",
      parentId: session.userId,
      points: 0,
    };
    localStorage.setItem(childKey, JSON.stringify(defaultChild));
    return defaultChild;
  }
  // 回退到原有的逻辑
  return (
    getChildById(getActiveChildId()) || {
      id: getActiveChildId(),
      name: "还没有绑定孩子",
      role: "child",
      avatar: "🧒",
    }
  );
}

export function setProfileNickname(role, nickname) {
  ensureSeed();
  const nextName = String(nickname || "").trim();
  if (!nextName) return;
  const session = readSessionRecord();
  const users = readList(sk().users);
  const targetId =
    role === "child" ? session?.userId || getActiveChildId() : session?.userId || users.find((item) => item.role === "parent")?.id;
  const next = users.map((user) => (user.id === targetId ? { ...user, name: nextName } : user));
  writeList(sk().users, next);
}

function patchChildProfile(childId, patch, logName = "patchChildProfile") {
  const id = String(childId || "").trim();
  if (!id) {
    console.error(`[${logName}] missing childId`, { childId, patch });
    return { ok: false, error: "missing_child", status: 400 };
  }

  try {
    ensureSeed();
    const session = readSessionRecord();
    const users = readList(sk().users);
    const hasUser = users.some((user) => String(user.id) === id);
    let nextUsers = hasUser
      ? users.map((user) => (String(user.id) === id ? { ...user, ...patch } : user))
      : [
          ...users,
          {
            id,
            name: "小勇士",
            role: "child",
            avatar: "🧒",
            familyId: session?.familyId || undefined,
            ...patch,
          },
        ];

    nextUsers = nextUsers.map((user) => {
      if (user.role !== "parent") return user;
      const childIds = Array.isArray(user.childIds) ? user.childIds.map(String) : [];
      if (childIds.includes(id)) return user;
      return { ...user, childIds: [...childIds, id] };
    });

    writeList(sk().users, nextUsers);

    if (session?.userId) {
      const childKey = `gda.child.${session.userId}`;
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem(childKey) || "null");
      } catch {
        stored = null;
      }
      if (!stored) {
        localStorage.setItem(
          childKey,
          JSON.stringify({
            id,
            name: "小勇士",
            avatar: "🧒",
            parentId: session.userId,
            familyId: session.familyId || undefined,
            ...patch,
          }),
        );
      } else if (String(stored.id) === id) {
        localStorage.setItem(childKey, JSON.stringify({ ...stored, ...patch }));
      }
    }

    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("gda.child.")) continue;
      try {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored || String(stored.id) !== id) continue;
        localStorage.setItem(key, JSON.stringify({ ...stored, ...patch }));
      } catch (error) {
        console.warn(`[${logName}] skip broken child cache`, { key, error });
      }
    }

    notify();
    console.info(`[${logName}] saved`, { childId: id, patch, upserted: !hasUser });
    return { ok: true, status: 200, ...patch };
  } catch (error) {
    console.error(`[${logName}] failed`, {
      childId: id,
      patch,
      status: error?.name === "QuotaExceededError" ? 507 : 500,
      name: error?.name,
      message: error?.message,
      error,
    });
    return {
      ok: false,
      error: error?.name === "QuotaExceededError" ? "storage" : "save",
      status: error?.name === "QuotaExceededError" ? 507 : 500,
      detail: String(error?.message || error),
    };
  }
}

export function updateChildNickname(childId, newNickname) {
  const nickname = String(newNickname || "").trim();
  console.info("[updateChildNickname] start", { childId, nickname });
  if (nickname && nickname.length < 2) {
    return { ok: false, error: "too_short", status: 400 };
  }
  if (nickname.length > 12) {
    return { ok: false, error: "too_long", status: 400 };
  }
  return patchChildProfile(childId, { nickname }, "updateChildNickname");
}

export const DEFAULT_CHILD_AVATAR = "🧒";

export function updateChildAvatar(childId, avatar) {
  const next = String(avatar || "").trim() || DEFAULT_CHILD_AVATAR;
  console.info("[updateChildAvatar] start", { childId, avatarLength: next.length });
  return patchChildProfile(childId, { avatar: next }, "updateChildAvatar");
}

export function updateChildNativeLang(childId, nativeLang) {
  const next = String(nativeLang || "").toLowerCase() === "zh" ? "zh" : "en";
  return patchChildProfile(childId, { nativeLang: next }, "updateChildNativeLang");
}

export function getLearningProfile(childId) {
  ensureSeed();
  const liveChild = getOnlyChild();
  const familyChild = getChildById(childId || liveChild?.id);
  let nativeLang = String(liveChild?.nativeLang || familyChild?.nativeLang || "").toLowerCase();
  if (nativeLang !== "zh" && nativeLang !== "en") {
    try {
      const session = readSessionRecord();
      const accounts = JSON.parse(localStorage.getItem("gda.authUsers") || "[]");
      const account = Array.isArray(accounts) ? accounts.find((item) => item.id === session?.userId) : null;
      nativeLang = String(account?.childNativeLang || "").toLowerCase();
    } catch {
      nativeLang = "";
    }
  }
  if (nativeLang !== "zh" && nativeLang !== "en") {
    nativeLang = localStorage.getItem("app_language") === "en" ? "en" : "zh";
  }
  const isChineseNative = nativeLang === "zh";
  const targetLang = isChineseNative ? "en" : "zh";
  return {
    nativeLang: isChineseNative ? "zh" : "en",
    targetLang,
    targetLabel: targetLang === "en" ? "英语" : "汉语",
    targetLabelEn: targetLang === "en" ? "English" : "Chinese",
  };
}

export function getActiveChildId() {
  // 先尝试从 getOnlyChild 获取
  const onlyChild = getOnlyChild();
  if (onlyChild && onlyChild.id && onlyChild.name !== "还没有绑定孩子") {
    return onlyChild.id;
  }
  if (isDemoSession()) return ONLY_CHILD_ID;
  const session = readSessionRecord();
  if (session?.role === "child" && session.userId) return session.userId;
  ensureSeed();
  const saved = localStorage.getItem(sk().currentChildId);
  const kids = readList(sk().users).filter((item) => item.role === "child");
  if (saved && kids.some((item) => item.id === saved)) return saved;
  return kids[0]?.id || ONLY_CHILD_ID;
}

export function getCurrentChildId() {
  return getActiveChildId();
}

export function setCurrentChildId(childId) {
  const nextId = childId || getActiveChildId();
  localStorage.setItem(sk().currentChildId, nextId);
  notify();
}

export function getAllFamilyTasks() {
  ensureSeed();
  return readList(sk().tasks);
}

export function getTransactions(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().transactions)
    .filter((item) => item.childId === id)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function addTransaction(entry) {
  const childId = entry.childId || getActiveChildId();
  writeList(sk().transactions, [
    {
      id: `x-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: todayStr(),
      ...entry,
      childId,
    },
    ...readList(sk().transactions),
  ]);
}

function readGamePlays() {
  try {
    return JSON.parse(localStorage.getItem(sk().gamePlays) || "{}");
  } catch {
    return {};
  }
}

export function getDailyGamePlays(gameId = "bubbles") {
  ensureSeed();
  const rec = readGamePlays()[gameId];
  const today = todayStr();
  const count = !rec || rec.date !== today ? 0 : rec.count;
  return {
    count,
    remaining: Number.POSITIVE_INFINITY,
    atLimit: false,
  };
}

export function tryStartDailyGame(gameId = "bubbles") {
  const status = getDailyGamePlays(gameId);
  const all = readGamePlays();
  const nextCount = status.count + 1;
  all[gameId] = { date: todayStr(), count: nextCount };
  localStorage.setItem(sk().gamePlays, JSON.stringify(all));
  notify();
  return {
    ok: true,
    count: nextCount,
    remaining: Number.POSITIVE_INFINITY,
    atLimit: false,
  };
}

export function startPaidGameSession(gameId, reason) {
  if (getPoints() < GAME_PLAY_COST) return { ok: false, code: "points" };
  addTransaction({
    childId: getActiveChildId(),
    type: "spend",
    amount: GAME_PLAY_COST,
    reason,
  });
  return tryStartDailyGame(gameId);
}

export function awardBottleFind(word) {
  const label = word?.en || word?.zh || "";
  addTransaction({
    childId: getActiveChildId(),
    type: "earn",
    amount: BOTTLE_POINTS,
    reason: `语言漂流瓶：${label}`,
  });
  const progress = recordVocabSuccess(word?.kBand || 1);
  return { ok: true, awarded: BOTTLE_POINTS, progress };
}

function readBookProgressMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(sk().bookProgress) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeBookProgressMap(all) {
  localStorage.setItem(sk().bookProgress, JSON.stringify(all));
  notify();
}

function emptyBookRecord() {
  return { completedPageIds: [], words: [], finished: false, badgeAwarded: false, finishedAt: null };
}

export function getBookProgress(bookId, childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  const childState = readBookProgressMap()[id] || { books: {}, badges: [] };
  const record = childState.books?.[bookId] || emptyBookRecord();
  return {
    completedPageIds: Array.isArray(record.completedPageIds) ? record.completedPageIds : [],
    words: Array.isArray(record.words) ? record.words : [],
    finished: Boolean(record.finished),
    badgeAwarded: Boolean(record.badgeAwarded),
    finishedAt: record.finishedAt || null,
  };
}

export function getChildBadges(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  const childState = readBookProgressMap()[id] || { books: {}, badges: [] };
  return Array.isArray(childState.badges) ? childState.badges : [];
}

export function getStoryLearningSummary(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  const childState = readBookProgressMap()[id] || { books: {}, badges: [] };
  const books = childState.books && typeof childState.books === "object" ? childState.books : {};
  const words = Object.values(books).flatMap((item) => (Array.isArray(item.words) ? item.words : []));
  const unique = [];
  const seen = new Set();
  words.forEach((word) => {
    const key = `${word.zh}|${word.en}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(word);
  });
  return {
    books,
    badges: getChildBadges(id),
    words: unique,
  };
}

export function completeBookPage({ bookId, pageId, words = [], totalPages, badge, reason }) {
  ensureSeed();
  const childId = getActiveChildId();
  const all = readBookProgressMap();
  const childState = all[childId] || { books: {}, badges: [] };
  const current = childState.books[bookId] || emptyBookRecord();
  const already = current.completedPageIds.includes(pageId);
  if (already) {
    return { ok: true, awarded: 0, already: true, badgeAwardedNow: false, progress: current };
  }

  const nextWords = [...current.words];
  words.forEach((word) => {
    if (!word?.zh && !word?.en) return;
    if (nextWords.some((item) => item.zh === word.zh && item.en === word.en)) return;
    nextWords.push({
      zh: word.zh,
      en: word.en,
      emoji: word.emoji || "",
      pageId,
      learnedAt: Date.now(),
    });
  });

  const completedPageIds = [...current.completedPageIds, pageId];
  const finished = Number(totalPages) > 0 && completedPageIds.length >= Number(totalPages);
  const badgeAwardedNow = Boolean(finished && badge?.id && !current.badgeAwarded);
  const nextRecord = {
    ...current,
    completedPageIds,
    words: nextWords,
    finished,
    finishedAt: finished ? Date.now() : current.finishedAt,
    badgeAwarded: current.badgeAwarded || badgeAwardedNow,
  };
  childState.books[bookId] = nextRecord;
  if (badgeAwardedNow) {
    childState.badges = [
      {
        id: badge.id,
        bookId,
        emoji: badge.emoji || "📖",
        nameZh: badge.name?.zh || "小小阅读家",
        nameEn: badge.name?.en || "Little Reader",
        awardedAt: Date.now(),
      },
      ...(Array.isArray(childState.badges) ? childState.badges : []),
    ];
  }
  all[childId] = childState;
  writeBookProgressMap(all);
  addTransaction({
    childId,
    type: "earn",
    amount: BOOK_PAGE_POINTS,
    reason: reason || `绘本学习：${pageId}`,
  });
  return { ok: true, awarded: BOOK_PAGE_POINTS, already: false, badgeAwardedNow, progress: nextRecord };
}

function emptyVocabProgress() {
  return { unlockedMaxK: 1, correct: 0, correctByBand: {}, justUnlocked: 0 };
}

export function getVocabProgress(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(sk().vocabProgress) || "{}");
  } catch {
    all = {};
  }
  const rec = all[id];
  if (!rec) return emptyVocabProgress();
  return {
    unlockedMaxK: Math.min(VOCAB_MAX_BAND, Math.max(1, Number(rec.unlockedMaxK) || 1)),
    correct: Number(rec.correct) || 0,
    correctByBand: rec.correctByBand && typeof rec.correctByBand === "object" ? rec.correctByBand : {},
    justUnlocked: 0,
  };
}

export function recordVocabSuccess(kBand = 1, childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(sk().vocabProgress) || "{}");
  } catch {
    all = {};
  }
  const prev = all[id] || emptyVocabProgress();
  const band = Math.max(1, Number(kBand) || 1);
  const correctByBand = { ...(prev.correctByBand || {}) };
  correctByBand[band] = (Number(correctByBand[band]) || 0) + 1;
  let unlockedMaxK = Math.max(1, Number(prev.unlockedMaxK) || 1);
  let justUnlocked = 0;
  const hitsAtCap = Number(correctByBand[unlockedMaxK]) || 0;
  if (band === unlockedMaxK && hitsAtCap >= VOCAB_UNLOCK_HITS && unlockedMaxK < VOCAB_BUNDLED_BANDS) {
    unlockedMaxK += 1;
    justUnlocked = unlockedMaxK;
  }
  const next = {
    unlockedMaxK,
    correct: (Number(prev.correct) || 0) + 1,
    correctByBand,
  };
  all[id] = next;
  localStorage.setItem(sk().vocabProgress, JSON.stringify(all));
  notify();
  return { ...next, justUnlocked };
}

export function recordGameResult(gameId, score) {
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(sk().gameResults) || "{}");
  } catch {
    all = {};
  }
  const list = Array.isArray(all[gameId]) ? all[gameId] : [];
  all[gameId] = [
    { score: Number(score) || 0, date: todayStr(), at: Date.now() },
    ...list,
  ].slice(0, 40);
  localStorage.setItem(sk().gameResults, JSON.stringify(all));
  notify();
}

export function getGameResults(gameId) {
  ensureSeed();
  try {
    const all = JSON.parse(localStorage.getItem(sk().gameResults) || "{}");
    return Array.isArray(all[gameId]) ? all[gameId] : [];
  } catch {
    return [];
  }
}

export function getPoints(childId) {
  return getTransactions(childId || getActiveChildId()).reduce((sum, item) => {
    return item.type === "earn" ? sum + item.amount : sum - item.amount;
  }, 0);
}

export function getTasks(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().tasks).filter((task) => task.childId === id);
}

export function getTaskById(taskId) {
  ensureSeed();
  return readList(sk().tasks).find((task) => task.id === taskId) || null;
}

export function addTask(payload) {
  const today = todayStr();
  // 优先使用 payload 中的 childId，否则从 getOnlyChild 获取
  let childId = payload.childId;
  if (!childId) {
    const onlyChild = getOnlyChild();
    childId = onlyChild?.id || getActiveChildId();
  }
  const task = {
    id: `t-${Date.now()}`,
    title: payload.title.trim(),
    type: payload.type || "custom",
    points: Number(payload.points),
    status: "pending",
    childId,
    repeat: payload.repeat || "once",
    createdAt: today,
    dueDate: today,
  };
  writeList(sk().tasks, [task, ...readList(sk().tasks)]);
  return task;
}

export function startTask(taskId) {
  writeList(
    sk().tasks,
    readList(sk().tasks).map((task) =>
      task.id === taskId && (task.status === "pending" || task.status === "overdue")
        ? { ...task, status: "in_progress", startedAt: Date.now() }
        : task,
    ),
  );
}

export function completeTask(taskId, extra = {}) {
  const tasks = readList(sk().tasks);
  const task = tasks.find((item) => item.id === taskId);
  if (!task || task.status === "completed" || task.status === "awaiting_confirm") {
    return { ok: false };
  }
  if (!extra.photo) {
    return { ok: false, code: "photo" };
  }

  writeList(
    sk().tasks,
    tasks.map((item) =>
      item.id === taskId
        ? {
            ...item,
            status: "awaiting_confirm",
            photo: extra.photo,
            submittedAt: todayStr(),
          }
        : item,
    ),
  );
  return { ok: true, awaiting: true, points: 0 };
}

function grantTaskPoints(task) {
  addTransaction({
    childId: task.childId || getActiveChildId(),
    type: "earn",
    amount: task.points,
    reason: `完成：${task.title}`,
  });
}

export function confirmTask(taskId, approved) {
  const tasks = readList(sk().tasks);
  const task = tasks.find((item) => item.id === taskId);
  if (!task || task.status !== "awaiting_confirm") return;
  if (approved) {
    grantTaskPoints(task);
    const doneAt = new Date();
    writeList(
      sk().tasks,
      readList(sk().tasks).map((item) =>
        item.id === taskId
          ? { ...item, status: "completed", completedAt: todayStr(doneAt), completedAtTime: doneAt.toISOString() }
          : item,
      ),
    );
    addTaskCompletion({
      taskId: task.id,
      childId: task.childId,
      title: task.title,
      points: task.points,
      date: todayStr(doneAt),
      completedAt: doneAt.toISOString(),
    });
  } else {
    writeList(
      sk().tasks,
      tasks.map((item) =>
        item.id === taskId ? { ...item, status: "pending", startedAt: undefined, photo: undefined } : item,
      ),
    );
  }
}

export function getAwaitingTasks(childId) {
  if (!childId) {
    return getAllFamilyTasks().filter((task) => task.status === "awaiting_confirm");
  }
  return getTasks(childId).filter((task) => task.status === "awaiting_confirm");
}

export function getRewards(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().rewards).filter((item) => item.childId === id);
}

export function addReward(payload) {
  const childId = payload.childId || getActiveChildId();
  const reward = {
    id: `r-${Date.now()}`,
    title: payload.title.trim(),
    cost: Number(payload.cost),
    image: payload.image || "",
    childId,
  };
  writeList(sk().rewards, [reward, ...readList(sk().rewards)]);
  return reward;
}

export function getRedemptions(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().redemptions).filter((item) => item.childId === id);
}

export function redeemReward(rewardId, childId) {
  const id = childId || getActiveChildId();
  const reward = getRewards(id).find((item) => item.id === rewardId) || getRewards().find((item) => item.id === rewardId);
  if (!reward) return { ok: false, message: "这个奖励找不到啦" };
  if (getPoints(id) < reward.cost) return { ok: false, message: "积分还不够，再完成几个任务吧" };

  addTransaction({ childId: id, type: "spend", amount: reward.cost, reason: `兑换：${reward.title}` });
  const redemption = {
    id: `rd-${Date.now()}`,
    rewardId,
    childId: id,
    title: reward.title,
    cost: reward.cost,
    image: reward.image || "",
    date: todayStr(),
    status: "pending",
  };
  writeList(sk().redemptions, [redemption, ...readList(sk().redemptions)]);
  return { ok: true, redemption };
}

export function fulfillRedemption(redemptionId) {
  const item = getRedemptions().find((row) => row.id === redemptionId);
  if (!item || item.status !== "pending") return;
  writeList(
    sk().redemptions,
    readList(sk().redemptions).map((row) =>
      row.id === redemptionId ? { ...row, status: "fulfilled" } : row,
    ),
  );
}

export function getPendingRedemptions(childId) {
  if (!childId) {
    ensureSeed();
    return readList(sk().redemptions).filter((item) => item.status === "pending");
  }
  return getRedemptions(childId).filter((item) => item.status === "pending");
}

export function getStreak(childId) {
  const id = childId || getActiveChildId();
  const earnDays = new Set(
    getTransactions(id)
      .filter((item) => item.type === "earn")
      .map((item) => item.date),
  );
  let streak = 0;
  const cursor = new Date();
  while (earnDays.has(todayStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getDayStats(childId, dateStr) {
  const id = childId || getActiveChildId();
  const tasks = getTaskCompletions(id).filter((item) => item.date === dateStr);
  const points = getTransactions(id)
    .filter((item) => item.date === dateStr && item.type === "earn")
    .reduce((sum, item) => sum + item.amount, 0);
  return { tasks: tasks.length, points };
}

function addTaskCompletion(entry) {
  writeList(sk().completions, [
    {
      id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      childId: entry.childId || getActiveChildId(),
      ...entry,
    },
    ...readList(sk().completions),
  ]);
}

function ensureCompletions() {
  if (readList(sk().completions).length > 0) return;
  if (!isDemoSession()) {
    localStorage.setItem(sk().completions, JSON.stringify([]));
    return;
  }
  const fromEarn = readList(sk().transactions)
    .filter((item) => item.type === "earn" && String(item.reason || "").startsWith("完成：") && (!item.childId || item.childId === ONLY_CHILD_ID))
    .map((item, index) => ({
      id: `c-seed-${item.id || index}`,
      childId: ONLY_CHILD_ID,
      taskId: null,
      title: String(item.reason).replace(/^完成：/, ""),
      points: item.amount,
      date: item.date,
      completedAt: `${item.date}T12:00:00`,
    }));
  const fromTasks = readList(sk().tasks)
    .filter((task) => task.status === "completed" && task.completedAt && (!task.childId || task.childId === ONLY_CHILD_ID))
    .map((task, index) => ({
      id: `c-task-${task.id}-${index}`,
      childId: ONLY_CHILD_ID,
      taskId: task.id,
      title: task.title,
      points: task.points,
      date: String(task.completedAt).slice(0, 10),
      completedAt: task.completedAtTime || `${String(task.completedAt).slice(0, 10)}T12:00:00`,
    }));
  const merged = [...fromEarn, ...fromTasks].sort((a, b) =>
    String(b.completedAt).localeCompare(String(a.completedAt)),
  );
  localStorage.setItem(sk().completions, JSON.stringify(merged));
}

export function getTaskCompletions(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().completions)
    .filter((item) => item.childId === id)
    .sort((a, b) => String(b.completedAt || b.date).localeCompare(String(a.completedAt || a.date)));
}

export function getChildProgress(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  const fromUsers = getChildById(id);
  const fallback = getOnlyChild();
  const child = fromUsers || (fallback?.id === id ? fallback : null) || {
    id,
    name: "小勇士",
    avatar: "🧒",
  };
  const session = readSessionRecord();
  const family = session?.familyId
    ? { id: session.familyId, code: session.familyCode || "" }
    : getFamilyByUserId(session?.userId);

  const tasks = getTasks(id);
  const completions = getTaskCompletions(id);
  const transactions = getTransactions(id);
  const points = getPoints(id);
  const streak = getStreak(id);

  const openTasks = tasks.filter((task) => task.status !== "completed");
  const awaiting = tasks.filter((task) => task.status === "awaiting_confirm");
  const inProgress = tasks.filter((task) => task.status === "in_progress");
  const pending = tasks.filter((task) => task.status === "pending" || task.status === "overdue");
  const earned = transactions.filter((item) => item.type === "earn").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const spent = transactions.filter((item) => item.type === "spend").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    familyId: family?.id || session?.familyId || null,
    child: {
      id,
      name: childLabel(child),
      nickname: child.nickname || "",
      avatar: child.avatar || "🧒",
    },
    points,
    streak,
    earned,
    spent,
    counts: {
      total: tasks.length,
      open: openTasks.length,
      pending: pending.length,
      inProgress: inProgress.length,
      awaiting: awaiting.length,
      completed: completions.length,
    },
    openTasks,
    awaiting,
    completions,
    recentTransactions: transactions.slice(0, 8),
  };
}

export function getTodayCompletions(childId) {
  const today = todayStr();
  return getTaskCompletions(childId).filter((item) => item.date === today);
}

export function getOpenTasks(childId) {
  return getTasks(childId || getActiveChildId()).filter((task) => task.status !== "completed");
}

function isExploreReason(reason) {
  return String(reason || "").startsWith("世界探索");
}

export function getExplorerWords(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().explorerWords)
    .filter((item) => item.childId === id)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

export function getExplorerTodayPoints(childId) {
  const today = todayStr();
  return getTransactions(childId)
    .filter((item) => item.type === "earn" && item.date === today && isExploreReason(item.reason))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function getExplorerStats(childId) {
  const id = childId || getActiveChildId();
  const words = getExplorerWords(id);
  const points = getTransactions(id)
    .filter((item) => item.type === "earn" && isExploreReason(item.reason))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const todayPoints = getExplorerTodayPoints(id);
  return {
    wordCount: words.length,
    points,
    todayPoints,
    remainingToday: Number.POSITIVE_INFINITY,
  };
}

function emptyReviewBucket(date = todayStr()) {
  return { date, todayReviewList: [], todayReviewedList: [] };
}

function readExplorerReviewsStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(sk().explorerReviews) || "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

function writeExplorerReviewsStore(all) {
  localStorage.setItem(sk().explorerReviews, JSON.stringify(all));
}

function expireExplorerReviewsForNewDay(today = todayStr()) {
  const all = readExplorerReviewsStore();
  let changed = false;
  Object.keys(all).forEach((childId) => {
    const bucket = all[childId];
    if (!bucket || bucket.date === today) return;
    all[childId] = emptyReviewBucket(today);
    changed = true;
  });
  if (changed) writeExplorerReviewsStore(all);
}

function getExplorerReviewBucket(childId) {
  ensureSeed();
  expireExplorerReviewsForNewDay();
  const all = readExplorerReviewsStore();
  const id = childId || getActiveChildId();
  const today = todayStr();
  const bucket = all[id] && all[id].date === today ? all[id] : emptyReviewBucket(today);
  if (!all[id] || all[id].date !== today) {
    all[id] = bucket;
    writeExplorerReviewsStore(all);
  }
  return { all, id, bucket };
}

export function getExplorerReviewState(childId) {
  const { bucket } = getExplorerReviewBucket(childId);
  const pending = Array.isArray(bucket.todayReviewList) ? bucket.todayReviewList : [];
  const reviewed = Array.isArray(bucket.todayReviewedList) ? bucket.todayReviewedList : [];
  const earnedPoints = reviewed.reduce((sum, item) => sum + Number(item.awarded || EXPLORE_POINTS), 0);
  return {
    date: bucket.date,
    pending,
    reviewed,
    pendingCount: pending.length,
    reviewedCount: reviewed.length,
    earnedPoints,
    hasAnyToday: pending.length + reviewed.length > 0,
  };
}

export function recordExplorerDiscovery(payload) {
  ensureSeed();
  const childId = payload.childId || getActiveChildId();
  const word = {
    id: `w-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    childId,
    en: payload.en,
    zh: payload.zh,
    enSentence: payload.enSentence,
    zhSentence: payload.zhSentence,
    emoji: payload.emoji || "🔍",
    photo: payload.photo || "",
    date: todayStr(),
    reviewed: false,
  };

  const { all, id, bucket } = getExplorerReviewBucket(childId);
  bucket.todayReviewList = [word, ...(bucket.todayReviewList || [])];
  all[id] = bucket;
  writeExplorerReviewsStore(all);
  notify();

  return { word, awarded: 0, pending: true };
}

export function completeExplorerReview(wordId, childId) {
  ensureSeed();
  const { all, id, bucket } = getExplorerReviewBucket(childId);
  const pending = Array.isArray(bucket.todayReviewList) ? bucket.todayReviewList : [];
  const reviewed = Array.isArray(bucket.todayReviewedList) ? bucket.todayReviewedList : [];
  const index = pending.findIndex((item) => item.id === wordId);
  if (index < 0) return { ok: false, awarded: 0 };

  const [item] = pending.splice(index, 1);
  const awarded = EXPLORE_POINTS;
  const done = {
    ...item,
    reviewed: true,
    reviewedAt: Date.now(),
    awarded,
  };
  bucket.todayReviewList = pending;
  bucket.todayReviewedList = [done, ...reviewed];
  all[id] = bucket;
  writeExplorerReviewsStore(all);

  const alreadyInBook = getExplorerWords(id).some(
    (word) => word.en === done.en && word.zh === done.zh && word.date === done.date,
  );
  if (!alreadyInBook) {
    writeList(sk().explorerWords, [
      {
        id: done.id,
        childId: id,
        en: done.en,
        zh: done.zh,
        enSentence: done.enSentence,
        zhSentence: done.zhSentence,
        emoji: done.emoji || "🔍",
        photo: done.photo || "",
        date: done.date,
      },
      ...readList(sk().explorerWords),
    ]);
  }

  addTransaction({
    childId: id,
    type: "earn",
    amount: awarded,
    reason: `世界探索：${done.en || done.zh}`,
  });

  return { ok: true, awarded, word: done };
}

export function getExchangeVideos(lang) {
  ensureSeed();
  const list = readList(sk().exchangeVideos).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  if (!lang || lang === "all") return list;
  return list.filter((item) => item.lang === lang);
}

export function addExchangeVideo(payload) {
  ensureSeed();
  const video = {
    id: payload.id || `v-${Date.now()}`,
    lang: payload.lang === "zh" ? "zh" : "en",
    tag: String(payload.tag || "").trim(),
    duration: Number(payload.duration) || 0,
    storage: payload.storage || "idb",
    url: payload.url || "",
    createdAt: todayStr(),
  };
  writeList(sk().exchangeVideos, [video, ...readList(sk().exchangeVideos)]);
  return video;
}

export function removeExchangeVideo(videoId) {
  writeList(
    sk().exchangeVideos,
    readList(sk().exchangeVideos).filter((item) => item.id !== videoId),
  );
}

export function getExchangeLearned(childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  return readList(sk().exchangeLearned).filter((item) => item.childId === id);
}

export function hasLearnedExchangeVideo(videoId, childId) {
  const id = childId || getActiveChildId();
  return getExchangeLearned(id).some((item) => item.videoId === videoId);
}

export function getTodayLearnedExchange(childId) {
  const today = todayStr();
  return getExchangeLearned(childId).filter((item) => item.date === today);
}

export function markExchangeLearned(videoId, childId) {
  ensureSeed();
  const id = childId || getActiveChildId();
  const video = getExchangeVideos().find((item) => item.id === videoId) || { id: videoId, tag: "语言交换" };
  if (hasLearnedExchangeVideo(videoId, id)) {
    return { ok: true, awarded: 0, already: true };
  }
  writeList(sk().exchangeLearned, [
    { id: `el-${Date.now()}`, childId: id, videoId, tag: video.tag, date: todayStr() },
    ...readList(sk().exchangeLearned),
  ]);
  addTransaction({
    childId: id,
    type: "earn",
    amount: EXCHANGE_POINTS,
    reason: `语言交换：${video.tag || "短视频"}`,
  });
  return { ok: true, awarded: EXCHANGE_POINTS, already: false };
}

export function typeLabel(type) {
  return TASK_TYPES.find((item) => item.id === type)?.label || "自定义";
}