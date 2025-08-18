import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export const NavigationBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (event) => {
    event?.preventDefault();
    alert("Searching: " + searchQuery);
  };

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-between px-8 py-2">
      <Link to="/home" className="animate-rgb large-text text-glow">
        BLOG
      </Link>
      <div className="flex-grow px-8">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 flex-grow px-8"
        >
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-4 rounded-lg bg-lightgray text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button type="submit" className="text-large text-glow text-teagreen">
            Search
          </button>
        </form>
      </div>
      <div className="flex items-center gap-9">
        <Link to="/home" className="large-text text-glow text-teagreen">
          +
        </Link>
        <Link to="/profile" className="large-text text-glow text-teagreen">
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="large-text text-glow text-teagreen"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
