import { useState } from "react";
import api from "../http";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "../ui/ToastProvider";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // optional redirect back to where user came from
  const params = new URLSearchParams(location.search);
  const rawFrom = params.get("from") || "/home";
  const from = rawFrom.startsWith("/") ? rawFrom : "/home";

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post("/signup", { username, password });
      await api.post("/signin", { username, password });
      setUsername("");
      setPassword("");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(
        "signup/signin error:",
        err?.response?.status,
        err?.response?.data
      );
      toast.error(err?.response?.data?.error || "Could not complete sign up");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Card */}
      <form
        onSubmit={submitHandler}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-lg p-5 sm:p-6 lg:p-8"
      >
        <h1 className="text-center text-2xl lg:text-3xl font-semibold text-teagreen mb-5 lg:mb-7">
          Sign Up
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 rounded-lg bg-lightgray/80 text-white placeholder-white/50 px-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent mb-5 lg:mb-6"
          placeholder="Create a strong password"
          required
        />

        {/* Only Cancel + Submit in the card */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center ">
          <button
            type="button"
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

      {/* Below the card */}
      <div className="w-full max-w-md mt-4 text-center">
        <Link
          to={`/signin?from=${encodeURIComponent(from)}`}
          className="inline-block w-full sm:w-auto px-4 py-2 rounded-lg bg-periwinkle/70 text-[#0b1321] font-medium hover:bg-periwinkle transition"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
};
