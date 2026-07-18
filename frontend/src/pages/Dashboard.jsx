import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSummaryReport } from '../api/reportsApi';
import { getTransactions } from '../api/transactionsApi';
import { getGoals } from '../api/goalsApi';
import SummaryCard from '../components/SummaryCard';
import Spinner from '../components/Spinner';
import { formatCurrency, formatDate } from '../utils/format';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [monthStats, setMonthStats] = useState({ income: 0, expense: 0, savings: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [goalsProgress, setGoalsProgress] = useState({ saved: 0, target: 0, percent: 0 });

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, transactionsRes, goalsRes] = await Promise.all([
          getSummaryReport({ year: currentYear }),
          getTransactions({ limit: 5, page: 1 }),
          getGoals(),
        ]);

        const thisMonth = summaryRes.data.summary.find((m) => m.month === currentMonth) || {
          income: 0,
          expense: 0,
          savings: 0,
        };
        setMonthStats(thisMonth);

        setRecentTransactions(transactionsRes.data.transactions);

        const goals = goalsRes.data;
        const saved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        setGoalsProgress({
          saved,
          target,
          percent: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        toast.error(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <Spinner label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      {error && <div className="form-error">{error}</div>}

      <div className="summary-grid">
        <SummaryCard
          label="Income this month"
          value={formatCurrency(monthStats.income)}
          tone="positive"
        />
        <SummaryCard
          label="Expenses this month"
          value={formatCurrency(monthStats.expense)}
          tone="negative"
        />
        <SummaryCard
          label="Balance this month"
          value={formatCurrency(monthStats.savings)}
          tone={monthStats.savings >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          label="Savings goal progress"
          value={`${goalsProgress.percent}%`}
          sub={`${formatCurrency(goalsProgress.saved)} of ${formatCurrency(goalsProgress.target)}`}
          tone="neutral"
        />
      </div>

      <section className="section">
        <div className="section-header">
          <h2>Recent transactions</h2>
          <Link to="/transactions">View all</Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="empty-state">No transactions yet. Add your first one on the Transactions page.</p>
        ) : (
          <ul className="transaction-list">
            {recentTransactions.map((tx) => (
              <li key={tx._id} className="transaction-list-item">
                <div>
                  <div className="transaction-category">{tx.category}</div>
                  <div className="transaction-date">{formatDate(tx.date)}</div>
                </div>
                <div className={`transaction-amount transaction-amount--${tx.type}`}>
                  {tx.type === 'expense' ? '-' : '+'}
                  {formatCurrency(tx.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
