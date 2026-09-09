const GA_ID = "G-VVXP7LHP4E";

export function trackPageView(path) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA_ID,
  });
}

export function trackSignUp(role) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "sign_up", {
    method: role || "app",
    user_role: role || "unknown",
  });
}
