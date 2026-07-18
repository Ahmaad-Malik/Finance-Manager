import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import '../utils/chartSetup';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getMonthlyReport, getSummaryReport } from '../api/reportsApi';
import MonthYearSelector from '../components/MonthYearSelector';
import Spinner from '../components/Spinner';
import { formatCurrency, MONTH_NAMES } from '../utils/format';
import { getChartColor } from '../utils/chartColors';

const now = new Date();

export default function Reports() {
  const [monthlyPeriod, setMonthlyPeriod] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [trendYear, setTrendYear] = useState(now.getFullYear());

  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [trend, setTrend] = useState([]);

  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingMonthly(true);
      try {
        const { data } = await getMonthlyReport(monthlyPeriod);
        setExpenseByCategory(data.report.filter((r) => r.type === 'expense'));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load monthly report.');
      } finally {
        setLoadingMonthly(false);
      }
    };
    load();
  }, [monthlyPeriod]);

  useEffect(() => {
    const load = async () => {
      setLoadingTrend(true);
      try {
        const { data } = await getSummaryReport({ year: trendYear });
        setTrend(data.summary);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load yearly trend.');
      } finally {
        setLoadingTrend(false);
      }
    };
    load();
  }, [trendYear]);

  const totalExpense = expenseByCategory.reduce((sum, r) => sum + r.total, 0);

  const doughnutData = {
    labels: expenseByCategory.map((r) => r.category),
    datasets: [
      {
        data: expenseByCategory.map((r) => r.total),
        backgroundColor: expenseByCategory.map((_, i) => getChartColor(i)),
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: trend.map((m) => MONTH_NAMES[m.month - 1].slice(0, 3)),
    datasets: [
      {
        label: 'Income',
        data: trend.map((m) => m.income),
        backgroundColor: '#16a34a',
      },
      {
        label: 'Expense',
        data: trend.map((m) => m.expense),
        backgroundColor: '#dc2626',
      },
    ],
  };

  const handleExportCategoryPDF = async () => {
    try {
      const { exportCategoryReportPDF } = await import('../utils/reportExport');
      exportCategoryReportPDF(expenseByCategory, monthlyPeriod);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('Failed to generate PDF.');
    }
  };

  const handleExportCategoryExcel = async () => {
    try {
      const { exportCategoryReportExcel } = await import('../utils/reportExport');
      exportCategoryReportExcel(expenseByCategory, monthlyPeriod);
      toast.success('Excel file downloaded.');
    } catch {
      toast.error('Failed to generate Excel file.');
    }
  };

  const handleExportTrendPDF = async () => {
    try {
      const { exportTrendReportPDF } = await import('../utils/reportExport');
      exportTrendReportPDF(trend, trendYear);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('Failed to generate PDF.');
    }
  };

  const handleExportTrendExcel = async () => {
    try {
      const { exportTrendReportExcel } = await import('../utils/reportExport');
      exportTrendReportExcel(trend, trendYear);
      toast.success('Excel file downloaded.');
    } catch {
      toast.error('Failed to generate Excel file.');
    }
  };

  return (
    <div className="page">
      <h1>Reports</h1>

      <div className="section">
        <div className="section-header">
          <h2>Expense by category</h2>
          <MonthYearSelector
            month={monthlyPeriod.month}
            year={monthlyPeriod.year}
            onChange={setMonthlyPeriod}
          />
        </div>

        {loadingMonthly ? (
          <Spinner label="Loading category report..." />
        ) : expenseByCategory.length === 0 ? (
          <p className="empty-state">No expenses recorded for this month.</p>
        ) : (
          <>
            <div className="chart-row">
              <div className="chart-container chart-container--doughnut">
                <Doughnut
                  data={doughnutData}
                  options={{
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <ul className="chart-legend">
                {expenseByCategory.map((r, i) => (
                  <li key={r.category}>
                    <span className="legend-dot" style={{ background: getChartColor(i) }} />
                    <span className="legend-label">{r.category}</span>
                    <span className="legend-value">
                      {formatCurrency(r.total)} ({Math.round((r.total / totalExpense) * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="export-actions">
              <button type="button" className="btn-secondary" onClick={handleExportCategoryPDF}>
                Export PDF
              </button>
              <button type="button" className="btn-secondary" onClick={handleExportCategoryExcel}>
                Export Excel
              </button>
            </div>
          </>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Income vs expense trend</h2>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="trend-year">Year</label>
            <select
              id="trend-year"
              value={trendYear}
              onChange={(e) => setTrendYear(Number(e.target.value))}
            >
              {Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingTrend ? (
          <Spinner label="Loading yearly trend..." />
        ) : (
          <>
            <div className="chart-container chart-container--bar">
              <Bar
                data={trendData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: { callback: (value) => formatCurrency(value) },
                    },
                  },
                }}
              />
            </div>

            <div className="export-actions">
              <button type="button" className="btn-secondary" onClick={handleExportTrendPDF}>
                Export PDF
              </button>
              <button type="button" className="btn-secondary" onClick={handleExportTrendExcel}>
                Export Excel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
