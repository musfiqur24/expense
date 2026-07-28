import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "../ui/CategoryIcon";
import { EmptyState } from "../ui/EmptyState";
import { formatCurrency, formatDate } from "../../utils/format";
import { categoryColor, transactionAmount, transactionCategory, transactionDate, transactionType } from "../../utils/data";

export function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return <EmptyState title="No transactions yet" message="Add income or an expense to start building your history." />;
  }

  return (
    <div className="transaction-list" role="table" aria-label="Transactions">
      <div className="transaction-list__head" role="row">
        <span aria-hidden="true" />
        <span>Transaction</span>
        <span>Category</span>
        <span>Date</span>
        <span>Amount</span>
        <span aria-label="Actions" />
      </div>
      {transactions.map((transaction) => {
        const type = transactionType(transaction);
        const category = transactionCategory(transaction);
        const color = categoryColor(category, type);
        const amount = transactionAmount(transaction);
        const id = transaction._id || transaction.id;
        return (
          <article className="transaction-row" key={id || `${transaction.title}-${transactionDate(transaction)}`} role="row">
            <div className="transaction-row__icon-cell" role="cell">
              <span
                className={`transaction-icon transaction-icon--${type}`}
                style={{ backgroundColor: `${color}1F`, color }}
              >
                <CategoryIcon category={category} type={type} />
              </span>
            </div>
            <div className="transaction-row__title" role="cell">
              <div>
                <strong>{transaction.title || transaction.name || "Untitled transaction"}</strong>
                {transaction.note || transaction.description ? <small>{transaction.note || transaction.description}</small> : null}
              </div>
            </div>
            <div role="cell"><span className="category-badge" style={{ backgroundColor: `${color}20`, borderColor: `${color}38`, color }}>{category.name}</span></div>
            <time role="cell" dateTime={transactionDate(transaction)}>{formatDate(transactionDate(transaction))}</time>
            <strong className={`transaction-row__amount transaction-row__amount--${type}`} role="cell">
              {type === "income" ? "+" : "−"}{formatCurrency(amount)}
            </strong>
            <div className="row-actions" role="cell">
              <button type="button" onClick={() => onEdit(transaction)} aria-label={`Edit ${transaction.title || "transaction"}`}><Pencil size={16} /></button>
              <button type="button" className="row-actions__delete" onClick={() => onDelete(transaction)} aria-label={`Delete ${transaction.title || "transaction"}`}><Trash2 size={16} /></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
