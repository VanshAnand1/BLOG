import axios from "axios";

// Point to your API (leave "" if using CRA proxy)
axios.defaults.baseURL = "";
axios.defaults.withCredentials = true;

// Redirect to /signin when the server says the session is gone
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      const current = window.location.pathname + window.location.search;
      if (!current.startsWith("/signin")) {
        window.location.replace(`/signin?from=${encodeURIComponent(current)}`);
      }
    }
    return Promise.reject(err);
  }
);

export default axios;
