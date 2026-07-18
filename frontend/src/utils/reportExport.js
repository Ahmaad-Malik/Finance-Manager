import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, MONTH_NAMES } from './format';

// NOTE: the backend does not expose PDF/Excel export endpoints (only JSON
// report data). These helpers build the files entirely in the browser from
// data already fetched for the charts, so nothing extra is requested.

const downloadWorkbook = (rows, sheetName, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export function exportCategoryReportPDF(report, { month, year }) {
  const doc = new jsPDF();
  const title = `Expense by Category — ${MONTH_NAMES[month - 1]} ${year}`;
  doc.setFontSize(14);
  doc.text(title, 14, 16);

  const total = report.reduce((sum, r) => sum + r.total, 0);

  autoTable(doc, {
    startY: 22,
    head: [['Category', 'Transactions', 'Total', '% of total']],
    body: report.map((r) => [
      r.category,
      String(r.count),
      formatCurrency(r.total),
      total > 0 ? `${Math.round((r.total / total) * 100)}%` : '0%',
    ]),
    foot: [['Total', '', formatCurrency(total), '100%']],
  });

  doc.save(`expenses-${year}-${String(month).padStart(2, '0')}.pdf`);
}

export function exportCategoryReportExcel(report, { month, year }) {
  const total = report.reduce((sum, r) => sum + r.total, 0);
  const rows = report.map((r) => ({
    Category: r.category,
    Transactions: r.count,
    Total: r.total,
    'Percent of total': total > 0 ? Math.round((r.total / total) * 100) : 0,
  }));
  downloadWorkbook(rows, 'Expenses by category', `expenses-${year}-${String(month).padStart(2, '0')}.xlsx`);
}

export function exportTrendReportPDF(summary, year) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Income vs Expense — ${year}`, 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [['Month', 'Income', 'Expense', 'Net savings']],
    body: summary.map((m) => [
      MONTH_NAMES[m.month - 1],
      formatCurrency(m.income),
      formatCurrency(m.expense),
      formatCurrency(m.savings),
    ]),
  });

  doc.save(`income-vs-expense-${year}.pdf`);
}

export function exportTrendReportExcel(summary, year) {
  const rows = summary.map((m) => ({
    Month: MONTH_NAMES[m.month - 1],
    Income: m.income,
    Expense: m.expense,
    'Net savings': m.savings,
  }));
  downloadWorkbook(rows, 'Income vs expense', `income-vs-expense-${year}.xlsx`);
}
