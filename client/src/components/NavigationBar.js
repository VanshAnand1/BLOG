import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../http";

export const NavigationBar = () => {
  const [me, setMe] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const back = encodeURIComponent(pathname + search);

  useEffect(() => {
    api
      .get("/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  // Allow ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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
        {/* Logo stays */}
        <Link
          to="/home"
          className="text-2xl font-bold tracking-tight text-teagreen"
        >
          BLOG
        </Link>

        {/* Search stays */}
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
                  aria-hidden="true"
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
                aria-label="Search posts"
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

        {/* Right section */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* These hide below 950px (moved into drawer) */}
          <Link
            to="/addpost"
            className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition max-[950px]:hidden"
          >
            <span className="text-lg mr-1">+</span>
            <span className="hidden sm:inline">New</span>
          </Link>
          <Link
            to="/profiles/search"
            className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition max-[950px]:hidden"
          >
            User Search
          </Link>
          {me === undefined ? (
            <span className="inline-flex items-center h-10 px-3 rounded-lg border border-white/10 text-aliceblue/60 max-[950px]:hidden">
              Profile…
            </span>
          ) : me ? (
            <Link
              to={`/u/${encodeURIComponent(me.username)}`}
              className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition max-[950px]:hidden whitespace-nowrap"
            >
              Profile: {me.username.toUpperCase()}
            </Link>
          ) : (
            <Link
              to={`/signin?from=${back}`}
              className="inline-flex items-center h-10 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition max-[950px]:hidden"
            >
              Sign in
            </Link>
          )}

          {/* Logout stays at all sizes */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center h-10 px-3 rounded-lg bg-periwinkle/60 text-[#0b1321] font-medium hover:bg-periwinkle transition"
          >
            Logout
          </button>

          {/* Hamburger: ONLY below 950px, placed to the right of Logout */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-controls="mobile-drawer"
            aria-expanded={menuOpen}
            className="hidden max-[950px]:inline-flex items-center h-10 px-3 rounded-lg border border-white/10 hover:bg-white/10 transition"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Drawer (right side). Render only below 950px; no click-blocking when closed */}
      <div
        id="mobile-drawer"
        className="hidden max-[950px]:block fixed inset-0 z-[60] pointer-events-none"
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
        />
        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-zomp border-l border-white/10 shadow-xl transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
            <span className="text-teagreen font-semibold">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center h-9 px-2 rounded-md border border-white/10 hover:bg-white/10 transition"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-3 flex flex-col gap-2">
            <Link
              to="/addpost"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center h-11 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              <span className="text-lg mr-1">+</span> New
            </Link>

            <Link
              to="/profiles/search"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center h-11 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
            >
              User Search
            </Link>

            {me === undefined ? (
              <span className="inline-flex items-center h-11 px-3 rounded-lg border border-white/10 text-aliceblue/70">
                Profile…
              </span>
            ) : me ? (
              <Link
                to={`/u/${encodeURIComponent(me.username)}`}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center h-11 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
              >
                Profile: {me.username.toUpperCase()}
              </Link>
            ) : (
              <Link
                to={`/signin?from=${back}`}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center h-11 px-3 rounded-lg bg-teagreen/90 text-[#0b1321] font-medium hover:bg-teagreen transition"
              >
                Sign in
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
};
