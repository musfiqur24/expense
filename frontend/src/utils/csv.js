import { formatDate } from "./format";
import { transactionAmount, transactionCategory, transactionDate, transactionType } from "./data";

function escapeCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadTransactionsCsv(transactions, month) {
  const rows = [
    ["Type", "Title", "Amount", "Category", "Date", "Note"],
    ...transactions.map((transaction) => [
      transactionType(transaction),
      transaction.title || transaction.name || "",
      transactionAmount(transaction),
      transactionCategory(transaction).name,
      formatDate(transactionDate(transaction)),
      transaction.note || transaction.description || ""
    ])
  ];
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `transactions-${month || "history"}.csv`);
}
