

// Маршрути для управління фільмами
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authenticateToken = require('../middleware/auth');

// Отримання списку та додавання фільмів
router.post('/movies', authenticateToken, movieController.createMovie);
router.get('/movies', authenticateToken, movieController.searchMovies); // 👈 Для GET http://localhost:8081/movies
router.get('/movies/search', authenticateToken, movieController.searchMovies); // 👈 Для пошуку з фільтрами

// Історія переглядів та RabbitMQ
router.post('/movies/watch', authenticateToken, movieController.watchMovie);
router.get('/movies/history', authenticateToken, movieController.getHistory);
router.post('/movies/notify', authenticateToken, movieController.notifyUser);

module.exports = router;