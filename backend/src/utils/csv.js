function csvCell(value) {
  let normalized = value === null || value === undefined ? "" : String(value);
  // Prevent spreadsheet applications from interpreting user-provided text as a formula.
  if (/^[=+\-@]/.test(normalized)) normalized = `'${normalized}`;
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
