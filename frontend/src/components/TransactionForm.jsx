import { useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { getUploadUrl } from '../utils/url';

const emptyForm = {
  type: 'expense',
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

// Used for both "add" and "edit". Pass `initialTransaction` to prefill for edit mode.
export default function TransactionForm({ initialTransaction, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [receiptFile, setReceiptFile] = useState(null);
  const [error, setError] = useState('');

  const isEditMode = !!initialTransaction;

  useEffect(() => {
    if (initialTransaction) {
      setForm({
        type: initialTransaction.type,
        amount: initialTransaction.amount,
        category: initialTransaction.category,
        date: new Date(initialTransaction.date).toISOString().slice(0, 10),
        description: initialTransaction.description || '',
      });
    } else {
      setForm(emptyForm);
    }
    setReceiptFile(null);
  }, [initialTransaction]);

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    if (!form.category.trim()) {
      setError('Category is required.');
      return;
    }

    let payload;
    if (receiptFile) {
      payload = new FormData();
      payload.append('type', form.type);
      payload.append('amount', form.amount);
      payload.append('category', form.category);
      payload.append('date', form.date);
      payload.append('description', form.description);
      payload.append('receipt', receiptFile);
    } else {
      payload = { ...form };
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction.');
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h2>{isEditMode ? 'Edit transaction' : 'Add transaction'}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            list="category-options"
            value={form.category}
            onChange={handleChange}
            required
          />
          <datalist id="category-options">
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional note"
        />
      </div>

      <div className="form-field">
        <label htmlFor="receipt">Receipt image {isEditMode && '(replace)'}</label>
        <input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
        />
        {isEditMode && initialTransaction.receiptImageUrl && !receiptFile && (
          <a
            href={getUploadUrl(initialTransaction.receiptImageUrl)}
            target="_blank"
            rel="noreferrer"
            className="receipt-link"
          >
            View current receipt
          </a>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Add transaction'}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
