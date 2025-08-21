import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../http";

export const NavigationBar = () => {
  const [me, setMe] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const back = encodeURIComponent(pathname + search);

  useEffect(() => {
    api
      .get("/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : `/search`);
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {});
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zomp text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto h-14 px-4 grid grid-cols-[auto,1fr,auto] items-center gap-4">
        <Link
          to="/home"
          className="text-2xl font-bold tracking-tight text-teagreen"
        >
          BLOG
        </Link>

        <form onSubmit={handleSearch} className="w-full">
          <div className="flex w-full">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="h-5 w-5 text-white/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 rounded-l-xl bg-lightgray text-white placeholder-white/50 pl-10 pr-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teagreen focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-r-xl bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              Search
            </button>
          </div>
        </form>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/addpost"
            className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
          >
            <span className="text-lg mr-1">+</span>
            <span className="hidden sm:inline">New</span>
          </Link>
          <Link
            to="/profiles/search"
            className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
          >
            User Search
          </Link>
          {me === undefined ? (
            <span className="inline-flex items-center h-10 px-3 rounded-lg border border-white/10 text-aliceblue/60">
              Profile…
            </span>
          ) : me ? (
            <Link
              to={`/u/${encodeURIComponent(me.username)}`}
              className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              Profile: {me.username.toUpperCase()}
            </Link>
          ) : (
            <Link
              to={`/signin?from=${back}`}
              className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center h-10 px-3 rounded-lg bg-periwinkle/60 text-[#0b1321] font-medium hover:bg-periwinkle transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};
