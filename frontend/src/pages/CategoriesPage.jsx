import React from "react";
import { CirclePlus, Pencil, Tags, Trash2 } from "lucide-react";
import { categoryApi } from "../api";
import { CategoryForm } from "../components/categories/CategoryForm";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { CategoriesSkeleton } from "../components/ui/LoadingSkeletons";
import { Notice } from "../components/ui/Notice";
import { useNotice } from "../hooks/useNotice";
import { getId } from "../utils/data";
import { withMinimumLoadingTime } from "../utils/loading";

const TYPE_COPY = {
  expense: { label: "Expense categories", helper: "Group the places your money goes." },
  income: { label: "Income categories", helper: "Keep track of where your money comes from." }
};

export function CategoriesPage() {
  const [type, setType] = React.useState("expense");
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const { notice, showNotice, clearNotice } = useNotice();

  const loadCategories = React.useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await withMinimumLoadingTime(() => categoryApi.list(type));
      if (!signal?.aborted) setCategories(data);
    } catch (error) {
      if (!signal?.aborted) showNotice(error.message || "We could not load categories.", "error");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [type, showNotice]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  async function saveCategory(values) {
    setSaving(true);
    try {
      const id = getId(editing);
      if (id) await categoryApi.update(id, values);
      else await categoryApi.create(values);
      setEditing(null);
      if (values.type !== type) setType(values.type);
      else await loadCategories();
      showNotice(id ? "Category updated." : "Category created.");
    } catch (error) {
      showNotice(error.message || "We could not save that category.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category) {
    const id = getId(category);
    if (!id || !window.confirm(`Delete ${category.name || "this category"}? Existing records may keep their label.`)) return;
    try {
      await categoryApi.remove(id);
      await loadCategories();
      showNotice("Category deleted.");
    } catch (error) {
      showNotice(error.message || "This category could not be deleted. It may still be in use.", "error");
    }
  }

  const copy = TYPE_COPY[type];
  return (
    <div className="categories-page">
      <PageHeader>
      <header className="page-heading page-heading--inline">
        <div>
          <p className="page-eyebrow">Your organisation</p>
          <h1>Categories</h1>
          <p>Create the labels that make your financial picture feel natural.</p>
        </div>
        <Button onClick={() => setEditing({ type })}><CirclePlus size={18} />New category</Button>
      </header>
      </PageHeader>
      <section className="surface-card categories-panel">
        <div className="segmented-control" role="tablist" aria-label="Category type">
          <button className={type === "expense" ? "is-active" : ""} type="button" role="tab" aria-selected={type === "expense"} onClick={() => setType("expense")}>Expenses</button>
          <button className={type === "income" ? "is-active" : ""} type="button" role="tab" aria-selected={type === "income"} onClick={() => setType("income")}>Income</button>
        </div>
        <div className="categories-panel__heading">
          <div><h2>{copy.label}</h2><p>{copy.helper}</p></div>
          {loading ? <span className="category-total-skeleton" aria-hidden="true" /> : <span>{categories.length} total</span>}
        </div>
        {loading ? <CategoriesSkeleton /> : categories.length ? <div className="category-grid">
          {categories.map((category, index) => <article className="category-card" key={getId(category) || category.name}>
            <span className="category-card__swatch" style={category.color ? { backgroundColor: category.color } : { "--category-index": index }}><Tags size={18} /></span>
            <strong>{category.name || category.title}</strong>
            <span className="category-card__type">{type}</span>
            <div className="category-card__actions">
              <button type="button" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`}><Pencil size={16} /></button>
              <button type="button" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.name}`}><Trash2 size={16} /></button>
            </div>
          </article>)}
        </div> : <EmptyState icon={Tags} title={`No ${type} categories`} message="Add the first one to make your entries faster and more meaningful." action={<Button onClick={() => setEditing({ type })}>Create category</Button>} />}
      </section>
      {editing && <CategoryForm category={editing} type={type} saving={saving} onClose={() => setEditing(null)} onSave={saveCategory} />}
      <Notice notice={notice} onDismiss={clearNotice} />
    </div>
  );
}
