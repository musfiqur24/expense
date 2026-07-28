import React from "react";
import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { categoryApi, transactionApi } from "../api";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionList } from "../components/transactions/TransactionList";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { Notice } from "../components/ui/Notice";
import { useNotice } from "../hooks/useNotice";
import { downloadBlob, downloadTransactionsCsv } from "../utils/csv";
import { getId } from "../utils/data";
import { formatMonth } from "../utils/format";

function combineCategories(results) {
  const seen = new Set();
  return results.flat().filter((category) => {
    const id = getId(category) || `${category.type}-${category.name}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function TransactionsPage({ month, composerSignal, onDataChanged }) {
  const [filters, setFilters] = React.useState({ month, type: "all", category: "", search: "" });
  const [transactions, setTransactions] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const { notice, showNotice, clearNotice } = useNotice();

  React.useEffect(() => {
    setFilters((current) => ({ ...current, month }));
  }, [month]);

  React.useEffect(() => {
    if (composerSignal) setEditing({});
  }, [composerSignal]);

  const loadTransactions = React.useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await transactionApi.list(filters);
      if (!signal?.aborted) setTransactions(data);
    } catch (error) {
      if (!signal?.aborted) showNotice(error.message || "We could not load transactions.", "error");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filters, showNotice]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadTransactions(controller.signal);
    return () => controller.abort();
  }, [loadTransactions]);

  React.useEffect(() => {
    let active = true;
    Promise.all([categoryApi.list("expense"), categoryApi.list("income")])
      .then((result) => active && setCategories(combineCategories(result)))
      .catch(() => active && showNotice("Categories could not be loaded yet.", "error"));
    return () => { active = false; };
  }, [showNotice]);

  async function saveTransaction(values) {
    setSaving(true);
    try {
      const id = getId(editing);
      const response = id
        ? await transactionApi.update(id, values)
        : await transactionApi.create(values);
      const budgetAlert = response?.data?.budgetAlert || response?.budgetAlert;
      setEditing(null);
      await loadTransactions();
      onDataChanged();
      if (budgetAlert?.message) {
        showNotice(`${id ? "Transaction updated." : "Transaction added."} ${budgetAlert.message}`, "error");
      } else {
        showNotice(id ? "Transaction updated." : "Transaction added.");
      }
    } catch (error) {
      showNotice(error.message || "We could not save that transaction.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(transaction) {
    const id = getId(transaction);
    if (!id || !window.confirm("Delete this transaction? This cannot be undone.")) return;
    try {
      await transactionApi.remove(id);
      await loadTransactions();
      onDataChanged();
      showNotice("Transaction deleted.");
    } catch (error) {
      showNotice(error.message || "We could not delete that transaction.", "error");
    }
  }

  async function exportCsv() {
    const exportMonth = filters.month || month;
    try {
      const blob = await transactionApi.exportMonth(exportMonth);
      downloadBlob(blob, `transactions-${exportMonth}.csv`);
      showNotice("Your monthly CSV is downloading.");
    } catch {
      downloadTransactionsCsv(transactions, exportMonth);
      showNotice("The server export was unavailable, so we made a CSV from the visible transactions.", "info");
    }
  }

  return (
    <div className="transactions-page">
      <header className="page-heading page-heading--inline">
        <div>
          <p className="page-eyebrow">{formatMonth(filters.month)}</p>
          <h1>Transactions</h1>
          <p>Search, review, and export your financial history.</p>
        </div>
        <div className="page-heading__actions">
          <Button variant="secondary" onClick={exportCsv}><Download size={17} />Export CSV</Button>
          <Button onClick={() => setEditing({})}><Plus size={18} />Add transaction</Button>
        </div>
      </header>

      <section className="surface-card transaction-workspace">
        <div className="filter-bar">
          <label className="search-field"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search transactions" /></label>
          <label className="filter-control"><Filter size={16} /><span className="visually-hidden">Transaction type</span><select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}><option value="all">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select></label>
          <label className="filter-control"><SlidersHorizontal size={16} /><span className="visually-hidden">Category</span><select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}><option value="">All categories</option>{categories.map((category) => <option key={getId(category)} value={getId(category)}>{category.name}</option>)}</select></label>
          <label className="filter-control filter-control--month"><span className="visually-hidden">Month</span><input type="month" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))} /></label>
        </div>
        {loading ? <LoadingState compact label="Loading transactions…" /> : <TransactionList transactions={transactions} onEdit={setEditing} onDelete={deleteTransaction} />}
      </section>

      {editing && <TransactionForm transaction={editing} categories={categories} saving={saving} onClose={() => setEditing(null)} onSave={saveTransaction} />}
      <Notice notice={notice} onDismiss={clearNotice} />
    </div>
  );
}
