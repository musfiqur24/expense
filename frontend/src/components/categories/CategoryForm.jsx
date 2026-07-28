import React from "react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";

const TYPE_OPTIONS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" }
];

function valuesFor(category, type) {
  return {
    name: category?.name || category?.title || "",
    type: String(category?.type || type || "expense").toLowerCase()
  };
}

export function CategoryForm({ category, type, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => valuesFor(category, type));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(valuesFor(category, type));
    setError("");
  }, [category, type]);

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Give this category a name.");
      return;
    }
    setError("");
    await onSave({ name: form.name.trim(), type: form.type });
  }

  const editing = Boolean(category?._id || category?.id);
  return (
    <Modal title={editing ? "Edit category" : "New category"} description="Keep names short so they are easy to scan." onClose={onClose}>
      <form className="entry-form" onSubmit={submit}>
        <label>Category name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Dining out" autoFocus maxLength="40" /></label>
        <div className="field-group">
          <span className="field-group__label">Type</span>
          <SearchableSelect ariaLabel="Category type" value={form.type} options={TYPE_OPTIONS} onChange={(value) => setForm((current) => ({ ...current, type: value }))} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}><Save size={17} />{saving ? "Saving…" : editing ? "Save category" : "Create category"}</Button>
        </div>
      </form>
    </Modal>
  );
}
