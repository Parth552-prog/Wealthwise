const router = require('express').Router();
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').post(createBudget).get(getBudgets);
router.route('/:id').put(updateBudget).delete(deleteBudget);

module.exports = router;