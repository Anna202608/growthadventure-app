const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESERVED = new Set(["parent", "child"]);

export function validateNickname(name, role) {
  const nickname = String(name || "").trim();
  if (!nickname) return role === "parent" ? "请填写家长昵称" : "请填写孩子昵称";
  if (nickname.length < 2) return "昵称至少 2 个字";
  return "";
}

export function validateUsername(username) {
  const value = String(username || "").trim();
  if (!value) return "请输入邮箱或手机号";
  if (RESERVED.has(value.toLowerCase())) return "这个账号不可用，请换一个";
  if (/^(.)\1{3,}$/.test(value)) return "账号太简单了，请使用手机号或邮箱";
  if (PHONE_RE.test(value) || EMAIL_RE.test(value)) return "";
  return "请输入正确的手机号或邮箱";
}

export function validatePassword(password, confirmPassword) {
  if (!password) return "请输入密码";
  if (password.length < 6) return "密码至少 6 位";
  if (confirmPassword !== undefined && password !== confirmPassword) return "两次输入的密码不一致";
  return "";
}

export function validateRegisterInput({ name, username, password, confirmPassword, role, familyCode }) {
  const base =
    validateNickname(name, role) ||
    validateUsername(username) ||
    validatePassword(password, confirmPassword);
  if (base) return base;
  if (role === "child" && !String(familyCode || "").trim()) {
    return "家庭码错误，请向家长索取";
  }
  return "";
}
