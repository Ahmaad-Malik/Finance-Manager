import { useEffect, useState } from 'react';

const emptyForm = { title: '', targetAmount: '', deadline: '', currentAmount: '' };

export default function GoalForm({ initialGoal, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const isEditMode = !!initialGoal;

  useEffect(() => {
    if (initialGoal) {
      setForm({
        title: initialGoal.title,
        targetAmount: initialGoal.targetAmount,
        deadline: new Date(initialGoal.deadline).toISOString().slice(0, 10),
        currentAmount: initialGoal.currentAmount,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialGoal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Target amount must be a positive number.');
      return;
    }
    if (!form.deadline) {
      setError('Deadline is required.');
      return;
    }

    const payload = isEditMode
      ? { title: form.title, targetAmount: Number(form.targetAmount), deadline: form.deadline }
      : {
          title: form.title,
          targetAmount: Number(form.targetAmount),
          deadline: form.deadline,
          currentAmount: form.currentAmount ? Number(form.currentAmount) : 0,
        };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save goal.');
    }
  };

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <h2>{isEditMode ? 'Edit goal' : 'New savings goal'}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" value={form.title} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="targetAmount">Target amount</label>
          <input
            id="targetAmount"
            name="targetAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.targetAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="deadline">Deadline</label>
          <input id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} required />
        </div>
      </div>

      {!isEditMode && (
        <div className="form-field">
          <label htmlFor="currentAmount">Starting amount (optional)</label>
          <input
            id="currentAmount"
            name="currentAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.currentAmount}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Create goal'}
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
