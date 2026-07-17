const Transaction = require('../models/Transaction');

// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required' });
    }

    // If a file was uploaded via multer, build its accessible URL
    const receiptImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount,
      category,
      date: date || Date.now(),
      description,
      receiptImageUrl,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// @route   GET /api/transactions
// @access  Private
// Supports query filters: ?type=expense&category=Food&startDate=...&endDate=...
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { type, amount, category, date, description } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (date) transaction.date = date;
    if (description !== undefined) transaction.description = description;
    if (req.file) transaction.receiptImageUrl = `/uploads/${req.file.filename}`;

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
