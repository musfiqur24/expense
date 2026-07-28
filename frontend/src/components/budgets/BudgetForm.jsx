import React from "react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { budgetCategory, budgetLimit } from "../../utils/data";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

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
  return (
    <Modal title={editing ? "Edit budget" : "Set a budget"} description="Budgets reset for each calendar month." onClose={onClose}>
      <form className="entry-form" onSubmit={submit}>
        <label>Expense category
          <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}>
            <option value="">Choose a category</option>
            {categories.map((category) => <option key={category._id || category.id} value={category._id || category.id}>{category.name}</option>)}
          </select>
        </label>
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
