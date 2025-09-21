import { useState } from "react";
import api from "../http";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "../ui/ToastProvider";

export const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const params = new URLSearchParams(location.search);
  const rawFrom = params.get("from") || "/home";
  const from = rawFrom.startsWith("/") ? rawFrom : "/home";

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post("/signin", { username, password });
      window.dispatchEvent(new Event("auth:changed"));
      setUsername("");
      setPassword("");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Sign in failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Card */}
      <form
        noValidate
        onSubmit={submitHandler}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-lg p-5 sm:p-6 lg:p-8"
      >
        <h1 className="text-center text-2xl lg:text-3xl font-semibold text-teagreen mb-5 lg:mb-7">
          Sign In
        </h1>

        <label
          htmlFor="username"
          className="block text-sm text-aliceblue mb-1.5"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full h-11 rounded-lg bg-lightgray/80 text-white placeholder-white/50 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent mb-4"
          placeholder="yourname"
          required
        />

        <label
          htmlFor="password"
          className="block text-sm text-aliceblue mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 rounded-lg bg-lightgray/80 text-white placeholder-white/50 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent mb-5 lg:mb-6"
          placeholder="••••••••"
          required
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setPassword("");
              setUsername("");
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-white/15 text-aliceblue hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="w-full max-w-md mt-4 text-center">
        <Link
          to={`/signup?from=${encodeURIComponent(from)}`}
          className="inline-block w-full sm:w-auto px-4 py-2 rounded-lg bg-periwinkle/85 text-[#0b1321] font-medium hover:bg-periwinkle transition"
        >
          Don’t have an account? Sign up
        </Link>
      </div>
      <div className="w-full max-w-md mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="inline-block w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-300 text-[#0b1321] font-medium hover:bg-gray-200 transition"
        >
          Continue as a Guest
        </button>

        <br></br>

        <p className="text-xs text-aliceblue/70 mt-2 px-2">
          In 'Guest Mode', you can act as a viewer on the site. To add or like
          posts, comments, or to follow users, please create an account.
        </p>
      </div>
    </div>
  );
};
