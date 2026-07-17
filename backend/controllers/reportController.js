const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// @route   GET /api/reports/monthly?month=7&year=2026
// @access  Private
// Returns totals grouped by category for the given month (income & expense separately)
const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'month and year query params are required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const report = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ month: Number(month), year: Number(year), report });
  } catch (error) {
    res.status(500).json({ message: 'Error generating monthly report', error: error.message });
  }
};

// @route   GET /api/reports/summary?year=2026
// @access  Private
// Returns income vs expense vs savings totals per month for the given year
const getSummaryReport = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'year query param is required' });
    }

    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59);

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Reshape into { month: 1, income: X, expense: Y, savings: X-Y }
    const monthly = {};
    for (let m = 1; m <= 12; m++) {
      monthly[m] = { month: m, income: 0, expense: 0, savings: 0 };
    }

    summary.forEach((item) => {
      const { month, type } = item._id;
      monthly[month][type] = item.total;
    });

    Object.values(monthly).forEach((entry) => {
      entry.savings = entry.income - entry.expense;
    });

    res.status(200).json({ year: Number(year), summary: Object.values(monthly) });
  } catch (error) {
    res.status(500).json({ message: 'Error generating summary report', error: error.message });
  }
};

module.exports = { getMonthlyReport, getSummaryReport };
