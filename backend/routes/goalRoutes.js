const router = require('express').Router();
const { createGoal, getGoals, updateGoal, deleteGoal, contributeToGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').post(createGoal).get(getGoals);
router.post('/:id/contribute', contributeToGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);

module.exports = router;