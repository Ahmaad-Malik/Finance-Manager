const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createBudget);
router.get('/', getBudgets);
router.delete('/:id', deleteBudget);

module.exports = router;
