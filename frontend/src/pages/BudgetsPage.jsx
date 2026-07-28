import React from "react";
import { AlertTriangle, Plus, Target } from "lucide-react";
import { budgetApi, categoryApi } from "../api";
import { BudgetCard } from "../components/budgets/BudgetCard";
import { BudgetForm } from "../components/budgets/BudgetForm";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { useNotice } from "../hooks/useNotice";
import { getId, isBudgetExceeded } from "../utils/data";
import { formatMonth } from "../utils/format";

export function BudgetsPage({ month, onDataChanged }) {
  const [budgets, setBudgets] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const { notice, showNotice, clearNotice } = useNotice();

  const loadBudgets = React.useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await budgetApi.list(month);
      if (!signal?.aborted) setBudgets(data);
    } catch (error) {
      if (!signal?.aborted) showNotice(error.message || "We could not load budgets.", "error");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [month, showNotice]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadBudgets(controller.signal);
    return () => controller.abort();
  }, [loadBudgets]);

  React.useEffect(() => {
    let active = true;
    categoryApi.list("expense").then((data) => active && setCategories(data)).catch(() => active && showNotice("Expense categories could not be loaded.", "error"));
    return () => { active = false; };
  }, [showNotice]);

  async function saveBudget(values) {
    setSaving(true);
    try {
      const id = getId(editing);
      if (id) await budgetApi.update(id, values);
      else await budgetApi.create(values);
      setEditing(null);
      await loadBudgets();
      onDataChanged();
      showNotice(id ? "Budget updated." : "Budget created.");
    } catch (error) {
      showNotice(error.message || "We could not save that budget.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudget(budget) {
    const id = getId(budget);
    if (!id || !window.confirm("Delete this budget?")) return;
    try {
      await budgetApi.remove(id);
      await loadBudgets();
      onDataChanged();
      showNotice("Budget deleted.");
    } catch (error) {
      showNotice(error.message || "We could not delete that budget.", "error");
    }
  }

  const exceeded = budgets.filter(isBudgetExceeded);
  return (
    <div className="budgets-page">
      <header className="page-heading page-heading--inline">
        <div>
          <p className="page-eyebrow">{formatMonth(month)}</p>
          <h1>Monthly budgets</h1>
          <p>Set an amount for each spending category, then stay ahead of the limit.</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus size={18} />Set a budget</Button>
      </header>
      {exceeded.length > 0 && <div className="inline-warning"><AlertTriangle size={18} /><span><strong>{exceeded.length} budget{exceeded.length > 1 ? "s are" : " is"} over limit.</strong> Review these categories before month-end.</span></div>}
      <section className="budget-grid">
        {loading ? <LoadingState label="Loading budgets…" /> : budgets.length ? budgets.map((budget) => <BudgetCard budget={budget} key={getId(budget)} onEdit={setEditing} onDelete={deleteBudget} />) : <div className="surface-card budget-empty"><EmptyState icon={Target} title="Build your first budget" message="Start with one category you want to be more intentional about." action={<Button onClick={() => setEditing({})}><Plus size={17} />Set a budget</Button>} /></div>}
      </section>
      {editing && <BudgetForm budget={editing} categories={categories} month={month} saving={saving} onClose={() => setEditing(null)} onSave={saveBudget} />}
      <Notice notice={notice} onDismiss={clearNotice} />
    </div>
  );
}
