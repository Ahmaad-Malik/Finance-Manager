import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getBudgets, createBudget, deleteBudget } from '../api/budgetsApi';
import MonthYearSelector from '../components/MonthYearSelector';
import ProgressBar from '../components/ProgressBar';
import Spinner from '../components/Spinner';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/format';

const now = new Date();

export default function Budgets() {
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getBudgets(period);
      setBudgets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets.');
      toast.error(err.response?.data?.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category.trim() || !form.monthlyLimit || Number(form.monthlyLimit) <= 0) {
      setError('Category and a positive monthly limit are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createBudget({
        category: form.category,
        monthlyLimit: Number(form.monthlyLimit),
        month: period.month,
        year: period.year,
      });
      toast.success('Budget saved.');
      setForm({ category: '', monthlyLimit: '' });
      await fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
      toast.error(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budget) => {
    if (!window.confirm(`Delete the ${budget.category} budget for this month?`)) return;
    try {
      await deleteBudget(budget._id);
      toast.success('Budget deleted.');
      await fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete budget.');
      toast.error(err.response?.data?.message || 'Failed to delete budget.');
    }
  };

  return (
    <div className="page">
      <div className="section-header">
        <h1>Budgets</h1>
        <MonthYearSelector month={period.month} year={period.year} onChange={setPeriod} />
      </div>

      <div className="section">
        <h2>Set a budget</h2>
        <form className="budget-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                list="budget-category-options"
                value={form.category}
                onChange={handleFormChange}
                placeholder="e.g. Food"
                required
              />
              <datalist id="budget-category-options">
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="monthlyLimit">Monthly limit</label>
              <input
                id="monthlyLimit"
                name="monthlyLimit"
                type="number"
                min="0.01"
                step="0.01"
                value={form.monthlyLimit}
                onChange={handleFormChange}
                required
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save budget'}
            </button>
          </div>
          <p className="hint">
            Setting a budget for a category that already has one this month updates its limit.
          </p>
        </form>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="section">
        {loading ? (
          <Spinner label="Loading budgets..." />
        ) : budgets.length === 0 ? (
          <p className="empty-state">No budgets set for this month yet.</p>
        ) : (
          <div className="budget-grid">
            {budgets.map((b) => (
              <div key={b._id} className={`budget-card ${b.exceeded ? 'budget-card--exceeded' : ''}`}>
                <div className="budget-card-header">
                  <span className="budget-card-category">{b.category}</span>
                  <button type="button" className="btn-link btn-link--danger" onClick={() => handleDelete(b)}>
                    Delete
                  </button>
                </div>
                <ProgressBar percent={b.percentUsed} />
                <div className="budget-card-figures">
                  <span>
                    {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                  </span>
                  <span>{b.percentUsed}%</span>
                </div>
                {b.exceeded ? (
                  <div className="budget-card-note budget-card-note--danger">
                    Over budget by {formatCurrency(Math.abs(b.remaining))}
                  </div>
                ) : (
                  <div className="budget-card-note">{formatCurrency(b.remaining)} remaining</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
