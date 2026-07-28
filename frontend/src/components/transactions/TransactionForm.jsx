import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { getCategory, transactionDate, transactionType } from "../../utils/data";
import { toDateInput } from "../../utils/format";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";

function initialValues(transaction) {
  const category = getCategory(transaction?.category || transaction?.categoryId);
  return {
    title: transaction?.title || transaction?.name || "",
    amount: transaction?.amount ?? "",
    type: transactionType(transaction),
    categoryId: category.id,
    date: toDateInput(transactionDate(transaction)),
    note: transaction?.note || transaction?.description || ""
  };
}

export function TransactionForm({ transaction, categories, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => initialValues(transaction));
  const [error, setError] = useState("");
  const availableCategories = useMemo(
    () => categories.filter((category) => !category.type || String(category.type).toLowerCase() === form.type),
    [categories, form.type]
  );
  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Choose a category" },
      ...availableCategories.map((category) => ({ value: category._id || category.id, label: category.name }))
    ],
    [availableCategories]
  );

  useEffect(() => {
    setForm(initialValues(transaction));
    setError("");
  }, [transaction]);

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type" ? { categoryId: "" } : {})
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0 || !form.categoryId) {
      setError("Add a title, a positive amount, and a category before saving.");
      return;
    }
    setError("");
    await onSave({
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category: form.categoryId,
      date: form.date,
      note: form.note.trim()
    });
  }

  const editing = Boolean(transaction?._id || transaction?.id);
  return (
    <Modal title={editing ? "Edit transaction" : "Add transaction"} description="Keep your records up to date." onClose={onClose}>
      <form className="entry-form" onSubmit={submit}>
        <div className="type-toggle" aria-label="Transaction type">
          {["expense", "income"].map((type) => (
            <button
              className={form.type === type ? `type-toggle__option type-toggle__option--${type} is-active` : `type-toggle__option type-toggle__option--${type}`}
              key={type}
              type="button"
              onClick={() => update("type", type)}
            >
              {type === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
        <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder={form.type === "income" ? "e.g. Salary" : "e.g. Grocery shop"} autoFocus /></label>
        <div className="entry-form__grid">
          <label>Amount<input inputMode="decimal" min="0" step="0.01" type="number" value={form.amount} onChange={(event) => update("amount", event.target.value)} placeholder="0.00" /></label>
          <label>Date<input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
        </div>
        <div className="field-group">
          <span className="field-group__label">Category</span>
          <SearchableSelect ariaLabel="Transaction category" value={form.categoryId} options={categoryOptions} onChange={(value) => update("categoryId", value)} />
          {!availableCategories.length && <small className="field-hint">Create a {form.type} category first.</small>}
        </div>
        <label>Note<textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Optional — add a little context" rows="3" /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}><Save size={17} />{saving ? "Saving…" : editing ? "Save changes" : "Add transaction"}</Button>
        </div>
      </form>
    </Modal>
  );
}
