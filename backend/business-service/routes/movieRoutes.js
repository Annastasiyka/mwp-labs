

// Маршрути для управління фільмами
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authenticateToken = require('../middleware/auth');

router.post('/movies', movieController.createMovie);
router.get('/movies/search', authenticateToken, movieController.searchMovies);
router.post('/movies/watch', authenticateToken, movieController.watchMovie);
router.get('/movies/history', authenticateToken, movieController.getHistory);
router.post('/movies/notify', authenticateToken, movieController.notifyUser);

module.exports = router;