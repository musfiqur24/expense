import React from "react";
import { useCallback, useEffect, useState } from "react";
import { authApi } from "../api";
import { AppShell } from "../components/layout/AppShell";
import { AppBootSkeleton } from "../components/ui/LoadingSkeletons";
import { Notice } from "../components/ui/Notice";
import { useHashRoute } from "../hooks/useHashRoute";
import { useNotice } from "../hooks/useNotice";
import { BudgetsPage } from "../pages/BudgetsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { TransactionsPage } from "../pages/TransactionsPage";
import { currentMonth } from "../utils/format";
import { withMinimumLoadingTime } from "../utils/loading";

function isSignedIn(user) {
  return Boolean(
    user
    && user.authenticated !== false
    && user.isAuthenticated !== false
    && user.success !== false
    && (user._id || user.id || user.email || user.name || user.displayName)
  );
}

export function App() {
  const [auth, setAuth] = useState({ status: "loading", user: null });
  const [month, setMonth] = useState(currentMonth);
  const [refreshKey, setRefreshKey] = useState(0);
  const [shouldOpenTransactionComposer, setShouldOpenTransactionComposer] = useState(false);
  const { route, navigate } = useHashRoute();
  const { notice, showNotice, clearNotice } = useNotice();

  useEffect(() => {
    let active = true;
    withMinimumLoadingTime(() => authApi.me())
      .then((user) => {
        if (!active) return;
        setAuth(isSignedIn(user) ? { status: "authenticated", user } : { status: "anonymous", user: null });
      })
      .catch(() => active && setAuth({ status: "anonymous", user: null }));
    return () => { active = false; };
  }, []);

  const markDataChanged = useCallback(() => setRefreshKey((key) => key + 1), []);
  const startTransaction = useCallback(() => {
    setShouldOpenTransactionComposer(true);
    navigate("transactions");
  }, [navigate]);
  const markTransactionComposerHandled = useCallback(() => setShouldOpenTransactionComposer(false), []);

  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      showNotice(error.message || "We could not end your session on the server.", "error");
    } finally {
      setAuth({ status: "anonymous", user: null });
      window.location.hash = "";
    }
  }

  if (auth.status === "loading") {
    return <AppBootSkeleton />;
  }

  if (auth.status !== "authenticated") return <LoginPage />;

  let page;
  if (route === "transactions") {
    page = (
      <TransactionsPage
        month={month}
        openComposer={shouldOpenTransactionComposer}
        onComposerHandled={markTransactionComposerHandled}
        onDataChanged={markDataChanged}
      />
    );
  }
  else if (route === "budgets") page = <BudgetsPage month={month} onDataChanged={markDataChanged} />;
  else if (route === "categories") page = <CategoriesPage />;
  else page = <DashboardPage month={month} refreshKey={refreshKey} onNavigate={navigate} />;

  return (
    <AppShell
      route={route}
      navigate={navigate}
      user={auth.user}
      month={month}
      onMonthChange={setMonth}
      onLogout={logout}
      onAddTransaction={startTransaction}
    >
      {page}
      <Notice notice={notice} onDismiss={clearNotice} />
    </AppShell>
  );
}
