const { Router } = require('express');
const router = Router();
const controller = require('../controller/registro');
const authNeeded = require('../utils/functions');

router.get('/', controller.getAll);
router.get('/date/:id', controller.getByDate);
router.get('/user/:userId', controller.getByUserId);
router.get('/week/:id', controller.getThisWeek);
router.post('/', controller.insert);
router.put('/:id', controller.update);
router.delete('/:id', authNeeded.verifyToken, controller.remove); //TODO

module.exports = router;