import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import api from "./http";

export default function RequireAuth() {
  const [ok, setOk] = useState(null); // null = checking, true = authed, false = not
  const loc = useLocation();

  useEffect(() => {
    let cancel = false;
    api
      .get("/me")
      .then(() => {
        if (!cancel) setOk(true);
      })
      .catch(() => {
        if (!cancel) setOk(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  if (ok === null)
    return <div className="p-4 text-aliceblue">Checking session…</div>;
  if (!ok) {
    const from = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/signin?from=${from}`} replace />;
  }
  return <Outlet />;
}
