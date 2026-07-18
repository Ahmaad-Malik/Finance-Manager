import { useState } from 'react';
import ProgressBar from './ProgressBar';
import { formatCurrency, formatDate } from '../utils/format';

export default function GoalCard({ goal, onContribute, onEdit, onDelete }) {
  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isComplete = goal.progressPercent >= 100;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleContribute = async (e) => {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!value || value === 0) {
      setError('Enter a non-zero amount.');
      return;
    }
    setSubmitting(true);
    try {
      await onContribute(goal, value);
      setAmount('');
      setShowContribute(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`goal-card ${isComplete ? 'goal-card--complete' : ''}`}>
      <div className="goal-card-header">
        <span className="goal-card-title">{goal.title}</span>
        <div className="row-actions">
          <button type="button" className="btn-link" onClick={() => onEdit(goal)}>
            Edit
          </button>
          <button type="button" className="btn-link btn-link--danger" onClick={() => onDelete(goal)}>
            Delete
          </button>
        </div>
      </div>

      <ProgressBar percent={goal.progressPercent} positive />

      <div className="budget-card-figures">
        <span>
          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
        </span>
        <span>{goal.progressPercent}%</span>
      </div>

      <div className="goal-card-deadline">
        {isComplete
          ? 'Goal reached 🎉'
          : daysLeft >= 0
          ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left · due ${formatDate(goal.deadline)}`
          : `Overdue · was due ${formatDate(goal.deadline)}`}
      </div>

      {showContribute ? (
        <form className="contribute-form" onSubmit={handleContribute}>
          {error && <div className="form-error">{error}</div>}
          <div className="contribute-form-row">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowContribute(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-secondary goal-card-contribute-btn" onClick={() => setShowContribute(true)}>
          + Add contribution
        </button>
      )}
    </div>
  );
}
