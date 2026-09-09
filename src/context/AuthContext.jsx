import { createContext, useContext, useMemo, useState } from "react";

const SESSION_KEY = "gda.session";
const USERS_KEY = "gda.authUsers";

const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function writeSession(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function readUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // use seed
  }
  const seeded = [{ id: "u-demo-01", username: "parent", password: "1234", name: "家长" }];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 初始化默认孩子
function initDefaultChild(parentId, nativeLang = "zh") {
  const childKey = `gda.child.${parentId}`;
  const existing = localStorage.getItem(childKey);
  if (existing) return JSON.parse(existing);
  const child = {
    id: `child-${Date.now()}`,
    name: "小勇士",
    avatar: "🧒",
    parentId: parentId,
    points: 0,
    nativeLang: nativeLang === "zh" ? "zh" : "en",
  };
  localStorage.setItem(childKey, JSON.stringify(child));
  return child;
}

function getDefaultChild(parentId) {
  const childKey = `gda.child.${parentId}`;
  const data = localStorage.getItem(childKey);
  if (data) return JSON.parse(data);
  return initDefaultChild(parentId);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  const value = useMemo(() => {
    function login(username, password) {
      const users = readUsers();
      const account = users.find((item) => item.username === username.trim() && item.password === password);
      if (!account) {
        return { ok: false, error: "账号或密码不正确，请再试一次" };
      }
      // 确保孩子存在
      getDefaultChild(account.id);
      const sessionUser = {
        userId: account.id,
        name: account.name,
        username: account.username,
        role: "parent",
        childNativeLang: account.childNativeLang === "en" ? "en" : "zh",
      };
      writeSession(sessionUser);
      setUser(sessionUser);
      return { ok: true, user: sessionUser };
    }

    function register({ username, password, childNativeLang = "zh" }) {
      const users = readUsers();
      const trimmed = username.trim();
      if (!trimmed || trimmed.length < 2) {
        return { ok: false, error: "账号至少2个字符" };
      }
      if (!password || password.length < 6) {
        return { ok: false, error: "密码至少6位字符" };
      }
      if (users.some((item) => item.username === trimmed)) {
        return { ok: false, error: "这个账号已经有人用了，换一个吧" };
      }
      const nativeLang = childNativeLang === "zh" ? "zh" : "en";
      const account = {
        id: `u-${Date.now()}`,
        username: trimmed,
        password,
        name: trimmed,
        childNativeLang: nativeLang,
      };
      writeUsers([account, ...users]);
      initDefaultChild(account.id, nativeLang);
      const sessionUser = {
        userId: account.id,
        name: account.name,
        username: account.username,
        role: "parent",
        childNativeLang: nativeLang,
      };
      writeSession(sessionUser);
      setUser(sessionUser);
      return { ok: true, user: sessionUser };
    }

    function setRole(role) {
      const current = readSession();
      if (!current) return;
      const next = { ...current, role: role === "child" ? "child" : "parent" };
      writeSession(next);
      setUser(next);
    }

    function logout() {
      writeSession(null);
      setUser(null);
    }

    return {
      user,
      login,
      register,
      logout,
      setRole,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 里使用");
  }
  return ctx;
}