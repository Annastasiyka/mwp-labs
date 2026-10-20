const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Маршрути для обробки запитів користувачів
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/user', authenticateToken, userController.updateUser);
router.put('/user/password', authenticateToken, userController.changePassword);
router.delete('/user', authenticateToken, userController.deleteUser);
router.post('/send-message', userController.sendMessage);

module.exports = router;