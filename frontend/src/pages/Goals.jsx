import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getGoals, createGoal, updateGoal, contributeToGoal, deleteGoal } from '../api/goalsApi';
import GoalForm from '../components/GoalForm';
import GoalCard from '../components/GoalCard';
import Spinner from '../components/Spinner';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getGoals();
      setGoals(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load savings goals.');
      toast.error(err.response?.data?.message || 'Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openAddForm = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const openEditForm = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, payload);
        toast.success('Goal updated.');
      } else {
        await createGoal(payload);
        toast.success('Goal created.');
      }
      closeForm();
      await fetchGoals();
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (goal, amount) => {
    await contributeToGoal(goal._id, amount);
    toast.success(amount > 0 ? 'Contribution added.' : 'Withdrawal recorded.');
    await fetchGoals();
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete the "${goal.title}" goal? This can't be undone.`)) return;
    try {
      await deleteGoal(goal._id);
      toast.success('Goal deleted.');
      await fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal.');
      toast.error(err.response?.data?.message || 'Failed to delete goal.');
    }
  };

  return (
    <div className="page">
      <div className="section-header">
        <h1>Savings goals</h1>
        <button type="button" onClick={openAddForm}>
          + New goal
        </button>
      </div>

      {showForm && (
        <div className="section">
          <GoalForm
            initialGoal={editingGoal}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
            submitting={submitting}
          />
        </div>
      )}

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <Spinner label="Loading goals..." />
      ) : goals.length === 0 ? (
        <p className="empty-state">No savings goals yet. Create one to start tracking progress.</p>
      ) : (
        <div className="goal-grid">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onContribute={handleContribute}
              onEdit={openEditForm}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
