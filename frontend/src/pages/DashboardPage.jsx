import React from "react";
import { AlertTriangle, ArrowRight, ArrowUpRight, CircleDollarSign, PiggyBank, Target, Wallet } from "lucide-react";
import { dashboardApi } from "../api";
import { BudgetCard } from "../components/budgets/BudgetCard";
import { DonutChart } from "../components/charts/DonutChart";
import { TrendChart } from "../components/charts/TrendChart";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { budgetCategory, budgetLimit, budgetSpent, isBudgetExceeded, transactionAmount, transactionCategory, transactionDate, transactionType } from "../utils/data";
import { formatCurrency, formatDate, formatMonth, toNumber } from "../utils/format";

function dashboardShape(data = {}) {
  const summary = data.summary || data.totals || {};
  const income = toNumber(summary.income ?? summary.totalIncome ?? data.income);
  const expense = toNumber(summary.expense ?? summary.expenses ?? summary.totalExpense ?? data.expense);
  return {
    summary: {
      income,
      expense,
      balance: toNumber(summary.balance ?? data.balance, income - expense)
    },
    trend: Array.isArray(data.trend) ? data.trend : Array.isArray(data.history) ? data.history : [],
    categoryBreakdown: Array.isArray(data.categoryBreakdown) ? data.categoryBreakdown : Array.isArray(data.breakdown) ? data.breakdown : [],
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : Array.isArray(data.recent) ? data.recent : []
  };
}

function StatCard({ icon: Icon, label, value, detail, tone = "neutral" }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon"><Icon size={20} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </article>
  );
}

function RecentTransactions({ transactions, onNavigate }) {
  if (!transactions.length) {
    return <EmptyState title="Your activity will appear here" message="Add a transaction to see your newest money movements." action={<Button variant="secondary" onClick={() => onNavigate("transactions")}>Add a transaction</Button>} />;
  }

  return (
    <div className="recent-list">
      {transactions.slice(0, 5).map((transaction) => {
        const type = transactionType(transaction);
        const category = transactionCategory(transaction);
        return (
          <article className="recent-row" key={transaction._id || transaction.id || `${transaction.title}-${transactionDate(transaction)}`}>
            <span className={`recent-row__icon recent-row__icon--${type}`}>{type === "income" ? "↓" : "↑"}</span>
            <div>
              <strong>{transaction.title || transaction.name || "Untitled transaction"}</strong>
              <span>{category.name} · {formatDate(transactionDate(transaction))}</span>
            </div>
            <strong className={`recent-row__amount recent-row__amount--${type}`}>{type === "income" ? "+" : "−"}{formatCurrency(transactionAmount(transaction))}</strong>
          </article>
        );
      })}
    </div>
  );
}

export function DashboardPage({ month, refreshKey, onNavigate }) {
  const [state, setState] = React.useState({ loading: true, error: "", data: null });

  const load = React.useCallback(async (signal) => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await dashboardApi.get(month);
      if (!signal?.aborted) setState({ loading: false, error: "", data: dashboardShape(response) });
    } catch (error) {
      if (!signal?.aborted) setState({ loading: false, error: error.message || "We could not load your dashboard.", data: null });
    }
  }, [month]);

  React.useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, refreshKey]);

  if (state.loading && !state.data) return <LoadingState label="Loading your overview…" />;
  if (state.error && !state.data) return <div className="page-error"><p>{state.error}</p><Button onClick={() => load()}>Try again</Button></div>;

  const data = state.data || dashboardShape();
  const { income, expense, balance } = data.summary;
  const budgeted = data.budgets.reduce((sum, budget) => sum + budgetLimit(budget), 0);
  const spentAgainstBudgets = data.budgets.reduce((sum, budget) => sum + budgetSpent(budget), 0);
  const exceededBudgets = data.budgets.filter(isBudgetExceeded);

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">{formatMonth(month)}</p>
          <h1>Financial overview</h1>
          <p>Here’s the shape of your money this month.</p>
        </div>
        <Button variant="secondary" onClick={() => onNavigate("transactions")}>View all activity <ArrowRight size={17} /></Button>
      </header>

      {state.error && <div className="inline-warning"><AlertTriangle size={18} /> {state.error}</div>}
      {exceededBudgets.length > 0 && (
        <button className="budget-warning" type="button" onClick={() => onNavigate("budgets")}>
          <AlertTriangle size={19} />
          <span><strong>{exceededBudgets.length} budget{exceededBudgets.length > 1 ? "s" : ""} needs attention.</strong> You have spent more than planned.</span>
          <ArrowRight size={18} />
        </button>
      )}

      <section className="stat-grid" aria-label="Monthly summary">
        <StatCard icon={Wallet} label="Current balance" value={formatCurrency(balance)} detail="Income minus expenses" tone="balance" />
        <StatCard icon={ArrowUpRight} label="Income" value={formatCurrency(income)} detail="This month" tone="income" />
        <StatCard icon={CircleDollarSign} label="Expenses" value={formatCurrency(expense)} detail="This month" tone="expense" />
        <StatCard icon={PiggyBank} label="Budget remaining" value={formatCurrency(Math.max(budgeted - spentAgainstBudgets, 0))} detail={budgeted ? `${Math.round((spentAgainstBudgets / budgeted) * 100)}% of planned spending used` : "Set a budget to stay on track"} tone="budget" />
      </section>

      <section className="analytics-grid">
        <article className="surface-card surface-card--trend">
          <div className="card-heading"><div><h2>Income & spending</h2><p>Your recent cash-flow history</p></div></div>
          <TrendChart trend={data.trend} />
        </article>
        <article className="surface-card surface-card--breakdown">
          <div className="card-heading"><div><h2>Where it went</h2><p>Expenses by category</p></div></div>
          <DonutChart breakdown={data.categoryBreakdown} />
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="surface-card">
          <div className="card-heading card-heading--with-action"><div><h2>Recent activity</h2><p>Your latest income and expenses</p></div><button className="text-button" type="button" onClick={() => onNavigate("transactions")}>See all</button></div>
          <RecentTransactions transactions={data.recentTransactions} onNavigate={onNavigate} />
        </article>
        <article className="surface-card">
          <div className="card-heading card-heading--with-action"><div><h2>Budgets</h2><p>Monthly spending limits</p></div><button className="text-button" type="button" onClick={() => onNavigate("budgets")}>Manage</button></div>
          <div className="dashboard-budget-list">
            {data.budgets.length ? data.budgets.slice(0, 3).map((budget) => <BudgetCard compact budget={budget} key={budget._id || budget.id || budgetCategory(budget).name} />) : <EmptyState icon={Target} title="No budgets yet" message="Create a category budget to get gentle alerts before you overspend." action={<Button variant="secondary" onClick={() => onNavigate("budgets")}>Set a budget</Button>} />}
          </div>
        </article>
      </section>
    </div>
  );
}
