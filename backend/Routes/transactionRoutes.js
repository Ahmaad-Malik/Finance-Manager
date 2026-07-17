const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All transaction routes require a valid JWT
router.use(protect);

// 'receipt' is the form field name the frontend must use for the file input
router.post('/', upload.single('receipt'), createTransaction);
router.get('/', getTransactions);
router.put('/:id', upload.single('receipt'), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
