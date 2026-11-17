const router = require('express').Router();
const { getSummary, getCategoryBreakdown, getMonthlyTrend, getTopSpendingDays } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trend', getMonthlyTrend);
router.get('/top-days', getTopSpendingDays);

module.exports = router;