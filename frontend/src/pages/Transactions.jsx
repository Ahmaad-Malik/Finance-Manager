import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/transactionsApi';
import TransactionForm from '../components/TransactionForm';
import TransactionFilters from '../components/TransactionFilters';
import Spinner from '../components/Spinner';
import { formatCurrency, formatDate } from '../utils/format';
import { getUploadUrl } from '../utils/url';

const emptyFilters = { search: '', type: '', category: '', startDate: '', endDate: '' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState(emptyFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await getTransactions(params);
      setTransactions(data.transactions);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions.');
      toast.error(err.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [page, filters.type, filters.category, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 whenever a server-side filter changes (not the client-side search box).
  const handleFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  // The backend doesn't support free-text search, so we filter the current
  // page of results client-side on description/category as a lightweight aid.
  const visibleTransactions = filters.search
    ? transactions.filter((tx) => {
        const q = filters.search.toLowerCase();
        return (
          tx.category.toLowerCase().includes(q) ||
          (tx.description || '').toLowerCase().includes(q)
        );
      })
    : transactions;

  const openAddForm = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const openEditForm = (tx) => {
    setEditingTransaction(tx);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, payload);
        toast.success('Transaction updated.');
      } else {
        await createTransaction(payload);
        toast.success('Transaction added.');
      }
      closeForm();
      await fetchTransactions();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tx) => {
    if (!window.confirm(`Delete this ${tx.type} of ${formatCurrency(tx.amount)}?`)) return;
    try {
      await deleteTransaction(tx._id);
      toast.success('Transaction deleted.');
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction.');
      toast.error(err.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  return (
    <div className="page">
      <div className="section-header">
        <h1>Transactions</h1>
        <button type="button" onClick={openAddForm}>
          + Add transaction
        </button>
      </div>

      {showForm && (
        <div className="section">
          <TransactionForm
            initialTransaction={editingTransaction}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
            submitting={submitting}
          />
        </div>
      )}

      <div className="section">
        <TransactionFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="section">
        {loading ? (
          <Spinner label="Loading transactions..." />
        ) : visibleTransactions.length === 0 ? (
          <p className="empty-state">No transactions match your filters.</p>
        ) : (
          <>
            <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Receipt</th>
                  <th className="text-right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>
                      <span className={`badge badge--${tx.type}`}>{tx.type}</span>
                    </td>
                    <td>{tx.category}</td>
                    <td className="text-muted">{tx.description || '—'}</td>
                    <td>
                      {tx.receiptImageUrl ? (
                        <a href={getUploadUrl(tx.receiptImageUrl)} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={`text-right transaction-amount--${tx.type}`}>
                      {tx.type === 'expense' ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="row-actions">
                      <button type="button" className="btn-link" onClick={() => openEditForm(tx)}>
                        Edit
                      </button>
                      <button type="button" className="btn-link btn-link--danger" onClick={() => handleDelete(tx)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="pagination">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
