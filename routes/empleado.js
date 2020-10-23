const { Router } = require('express');
const router = Router();
const controller = require('../controller/empleado');
const authNeeded = require('../utils/functions');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/username/:username', authNeeded.verifyToken, controller.getByUsername);
router.put('/pass/:id', authNeeded.verifyToken, controller.updatePass);
router.put('/empleado/:id', authNeeded.verifyToken, controller.updateUser);

module.exports = router;