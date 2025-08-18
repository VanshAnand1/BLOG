import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Not signed in:", err);
      });
  }, []);

  return (
    <div className="flex items-center justify-between px-8 py-2">
      <Link to="/home">
        <h1 className="text-zomp large-text text-glow">
          Hi {user ? user.username : "Guest"}
        </h1>
      </Link>
    </div>
  );
};
