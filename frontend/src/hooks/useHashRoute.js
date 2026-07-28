import { useCallback, useEffect, useState } from "react";

const ROUTES = new Set(["dashboard", "transactions", "budgets", "categories"]);

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return ROUTES.has(route) ? route : "dashboard";
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((nextRoute) => {
    if (!ROUTES.has(nextRoute)) return;
    if (readRoute() === nextRoute) {
      setRoute(nextRoute);
      return;
    }
    window.location.hash = `/${nextRoute}`;
  }, []);

  return { route, navigate };
}
