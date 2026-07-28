import React from "react";
import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { categoryApi, transactionApi } from "../api";
import { PageHeader } from "../components/layout/PageHeader";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionList } from "../components/transactions/TransactionList";
import { Button } from "../components/ui/Button";
import { TransactionsSkeleton } from "../components/ui/LoadingSkeletons";
import { Notice } from "../components/ui/Notice";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { useNotice } from "../hooks/useNotice";
import { downloadBlob, downloadTransactionsCsv } from "../utils/csv";
import { getId } from "../utils/data";
import { formatMonth, todayValue } from "../utils/format";
import { withMinimumLoadingTime } from "../utils/loading";

function combineCategories(results) {
  const seen = new Set();
  return results.flat().filter((category) => {
    const id = getId(category) || `${category.type}-${category.name}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function TransactionsPage({ month, openComposer = false, onComposerHandled, onDataChanged }) {
  const [filters, setFilters] = React.useState(() => ({ month, date: todayValue(), type: "all", category: "", search: "" }));
  const [transactions, setTransactions] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const { notice, showNotice, clearNotice } = useNotice();

  React.useEffect(() => {
    setFilters((current) => ({ ...current, month, date: current.date?.startsWith(month) ? current.date : "" }));
  }, [month]);

  React.useEffect(() => {
    if (!openComposer) return;
    setEditing({});
    onComposerHandled?.();
  }, [openComposer, onComposerHandled]);

  const loadTransactions = React.useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await withMinimumLoadingTime(() => transactionApi.list(filters));
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
      <PageHeader>
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
      </PageHeader>

      <section className="surface-card transaction-workspace">
        <div className="filter-bar">
          <label className="search-field"><Search size={18} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search transactions" /></label>
          <SearchableSelect
            ariaLabel="Filter transaction type"
            className="filter-control filter-control--select"
            leadingIcon={Filter}
            onChange={(value) => setFilters((current) => ({ ...current, type: value }))}
            options={[{ value: "all", label: "All types" }, { value: "expense", label: "Expenses" }, { value: "income", label: "Income" }]}
            value={filters.type}
          />
          <SearchableSelect
            ariaLabel="Filter by category"
            className="filter-control filter-control--select"
            leadingIcon={SlidersHorizontal}
            onChange={(value) => setFilters((current) => ({ ...current, category: value }))}
            options={[{ value: "", label: "All categories" }, ...categories.map((category) => ({ value: getId(category), label: category.name }))]}
            value={filters.category}
          />
          <label className="filter-control filter-control--month"><span className="visually-hidden">Month</span><input type="month" value={filters.month} onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value, date: current.date?.startsWith(event.target.value) ? current.date : "" }))} /></label>
          <label className="filter-control filter-control--date"><span className="visually-hidden">Exact date</span><input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, month: event.target.value ? event.target.value.slice(0, 7) : current.month }))} /></label>
        </div>
        {loading ? <TransactionsSkeleton /> : <TransactionList transactions={transactions} onEdit={setEditing} onDelete={deleteTransaction} />}
      </section>

      {editing && <TransactionForm transaction={editing} categories={categories} saving={saving} onClose={() => setEditing(null)} onSave={saveTransaction} />}
      <Notice notice={notice} onDismiss={clearNotice} />
    </div>
  );
}
