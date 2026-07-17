const express = require('express');
const router = express.Router();
const { getMonthlyReport, getSummaryReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/summary', getSummaryReport);

module.exports = router;
