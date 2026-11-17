const router = require('express').Router();
const { getRecommendations } = require('../controllers/advisoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getRecommendations);

module.exports = router;