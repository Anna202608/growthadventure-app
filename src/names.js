import { childLabel, getOnlyChild, getUsers } from "./db.js";

export const DEFAULT_PARENT_NICK = "家长";
export const DEFAULT_CHILD_NICK = "小勇士";

function clean(value) {
  return String(value || "").trim();
}

export function childDisplayName(user, child) {
  if (user?.role === "child") {
    return clean(user.nickname) || clean(user.name) || DEFAULT_CHILD_NICK;
  }
  return childLabel(child || getOnlyChild());
}

export function parentDisplayName(user) {
  if (user?.role === "parent" && clean(user.name)) return clean(user.name);
  const parent = getUsers().find((item) => item.role === "parent");
  return clean(parent?.name) || DEFAULT_PARENT_NICK;
}
