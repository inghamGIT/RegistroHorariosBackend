const { Router } = require('express');
const router = Router();
const controller = require('../controller/registro');
const authNeeded = require('../utils/functions');

router.get('/', authNeeded.verifyToken, controller.getAll);
router.get('/date/:id', authNeeded.verifyToken, controller.getByDate);
router.get('/user/:userId', authNeeded.verifyToken, controller.getByUserId);
router.get('/week/:id', authNeeded.verifyToken, controller.getThisWeek);
router.post('/', authNeeded.verifyToken, controller.insert);
router.put('/:id', authNeeded.verifyToken, controller.update);
router.delete('/:id', authNeeded.verifyToken, controller.remove);

module.exports = router;