const SavingsGoal = require('../models/SavingsGoal');

// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, currentAmount } = req.body;

    if (!title || targetAmount === undefined || !deadline) {
      return res.status(400).json({ message: 'Title, targetAmount, and deadline are required' });
    }

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating savings goal', error: error.message });
  }
};

// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching savings goals', error: error.message });
  }
};

// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    const { title, targetAmount, deadline } = req.body;

    if (title) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (deadline) goal.deadline = deadline;

    const updated = await goal.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating savings goal', error: error.message });
  }
};

// @route   PATCH /api/goals/:id/contribute
// @access  Private
// Body: { amount: 50 }  -> adds to currentAmount (use negative to withdraw)
const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || isNaN(amount)) {
      return res.status(400).json({ message: 'A valid numeric amount is required' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    goal.currentAmount = Math.max(0, goal.currentAmount + Number(amount));
    const updated = await goal.save();

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal progress', error: error.message });
  }
};

// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }

    res.status(200).json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting savings goal', error: error.message });
  }
};

module.exports = { createGoal, getGoals, updateGoal, contributeToGoal, deleteGoal };
