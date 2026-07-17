const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || monthlyLimit === undefined || !month || !year) {
      return res.status(400).json({ message: 'Category, monthlyLimit, month, and year are required' });
    }

    // Upsert: if a budget already exists for this category/month/year, update it instead of erroring
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month, year },
      { monthlyLimit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating budget', error: error.message });
  }
};

// @route   GET /api/budgets?month=7&year=2026
// @access  Private
// Fetches budgets and compares each against actual spending for that period
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'month and year query params are required' });
    }

    const budgets = await Budget.find({
      userId: req.user._id,
      month: Number(month),
      year: Number(year),
    });

    // Calculate date range for the requested month
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    // Aggregate actual expense totals per category for that month
    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = spending.reduce((acc, item) => {
      acc[item._id] = item.totalSpent;
      return acc;
    }, {});

    const budgetsWithProgress = budgets.map((budget) => {
      const spent = spendingMap[budget.category] || 0;
      return {
        _id: budget._id,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spent,
        remaining: budget.monthlyLimit - spent,
        percentUsed: budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0,
        exceeded: spent > budget.monthlyLimit,
      };
    });

    res.status(200).json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets', error: error.message });
  }
};

// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget', error: error.message });
  }
};

module.exports = { createBudget, getBudgets, deleteBudget };
