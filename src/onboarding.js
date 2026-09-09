export function isDemoUser(user) {
  return user?.username === "parent" || user?.username === "child";
}

function welcomeKey(userId) {
  return `gda.welcomeSeen.${userId}`;
}

export function needsWelcome(user) {
  if (!user?.userId || isDemoUser(user)) return false;
  return localStorage.getItem(welcomeKey(user.userId)) !== "1";
}

export function markWelcomeSeen(userId) {
  if (!userId) return;
  localStorage.setItem(welcomeKey(userId), "1");
}
