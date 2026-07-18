const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  updateGoal,
  contributeToGoal,
  deleteGoal,
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.patch('/:id/contribute', contributeToGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
