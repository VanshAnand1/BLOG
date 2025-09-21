import axiosLib from "axios";

const baseURL =
  process.env.NODE_ENV === "development" ? "http://localhost:8000" : "/api";

const axios = axiosLib.create({
  baseURL,
  withCredentials: true,
});

// Helper to normalize URL path
function getPathname(configUrl) {
  if (!configUrl) return "/";
  try {
    return configUrl.startsWith("http")
      ? new URL(configUrl).pathname
      : configUrl; // relative path already
  } catch {
    return configUrl;
  }
}

// Only redirect to /signin if the action *requires* auth.
// Allow guests to browse (GETs) without being bounced.
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status !== 401) return Promise.reject(err);

    const method = String(err?.config?.method || "get").toUpperCase();
    const path = getPathname(String(err?.config?.url || "/"));
    const isGuest = localStorage.getItem("authMode") === "guest";

    // Writes always require auth
    const isWrite = method !== "GET";

    // Some GET endpoints are inherently private (e.g., /me, /notifications)
    const isStrictPrivateRead =
      /^\/(me|notifications|settings|admin)(\/|$)/.test(path);

    // If it's a write OR a strictly private read (and you're not guest-browsing),
    // kick to signin. Otherwise, swallow the redirect and let UI handle the 401.
    if (isWrite || (!isGuest && isStrictPrivateRead)) {
      const current = window.location.pathname + window.location.search;
      if (!current.startsWith("/signin")) {
        window.location.replace(`/signin?from=${encodeURIComponent(current)}`);
      }
    }

    return Promise.reject(err);
  }
);

export default axios;
