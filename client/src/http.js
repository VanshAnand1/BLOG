import axiosLib from "axios";

const baseURL =
  process.env.NODE_ENV === "development" ? "http://localhost:8000" : "/api";

const axios = axiosLib.create({
  baseURL,
  withCredentials: true,
});

// // 401 → kick to /signin
// axios.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const s = err?.response?.status;
//     if (s === 401) {
//       const current = window.location.pathname + window.location.search;
//       if (!current.startsWith("/signin")) {
//         window.location.replace(`/signin?from=${encodeURIComponent(current)}`);
//       }
//     }
//     return Promise.reject(err);
//   }
// );

export default axios;
