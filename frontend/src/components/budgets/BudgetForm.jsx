import React from "react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { budgetCategory, budgetLimit } from "../../utils/data";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";

function valuesFor(budget) {
  return {
    categoryId: budgetCategory(budget).id,
    limit: budgetLimit(budget) || ""
  };
}

export function BudgetForm({ budget, categories, month, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => valuesFor(budget));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(valuesFor(budget));
    setError("");
  }, [budget]);

  async function submit(event) {
    event.preventDefault();
    if (!form.categoryId || !form.limit || Number(form.limit) <= 0) {
      setError("Choose a category and enter a positive monthly limit.");
      return;
    }
    setError("");
    await onSave({ category: form.categoryId, limit: Number(form.limit), month });
  }

  const editing = Boolean(budget?._id || budget?.id);
  const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...categories.map((category) => ({ value: category._id || category.id, label: category.name }))
  ];
  return (
    <Modal title={editing ? "Edit budget" : "Set a budget"} description="Budgets reset for each calendar month." onClose={onClose}>
      <form className="entry-form" onSubmit={submit}>
        <div className="field-group">
          <span className="field-group__label">Expense category</span>
          <SearchableSelect ariaLabel="Expense category" value={form.categoryId} options={categoryOptions} onChange={(value) => setForm((current) => ({ ...current, categoryId: value }))} />
        </div>
        <label>Monthly limit<input type="number" min="0" step="0.01" inputMode="decimal" value={form.limit} onChange={(event) => setForm((current) => ({ ...current, limit: event.target.value }))} placeholder="0.00" autoFocus /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}><Save size={17} />{saving ? "Saving…" : editing ? "Save budget" : "Create budget"}</Button>
        </div>
      </form>
    </Modal>
  );
}
