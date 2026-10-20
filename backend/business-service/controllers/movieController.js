// Контролер для управління фільмами
const Movie = require('../models/Movie');
const History = require('../models/History');
const { sendMessageToUser } = require('../services/rabbitmq');

// 1. Створення нового фільму (з повідомленням та збереженням усіх полів)
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      originalTitle,
      director,
      directors,
      genre,
      year,
      duration,
      rating,
      description,
      cast,
      actors,
      country
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Назва фільму (title) є обов\'язковою' });
    }

    // Формуємо об'єкт фільму з урахуванням різних можливих назв полів
    const movieData = {
      title,
      originalTitle: originalTitle || title,
      director: director || (directors && directors[0]) || '',
      directors: directors || (director ? [director] : []),
      genre: Array.isArray(genre) ? genre : (genre ? [genre] : []),
      year: year || null,
      duration: duration || null,
      rating: rating || 0,
      description: description || '',
      cast: cast || actors || [],
      actors: actors || cast || [],
      country: country || ''
    };

    const movie = new Movie(movieData);
    await movie.save();

    res.status(201).json({
      message: 'Фільм успішно додано до каталогу',
      movie
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 2. Пошук фільмів за фільтрами або отримання всього каталогу
exports.searchMovies = async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) filters.title = new RegExp(req.query.title, 'i');
    if (req.query.genre) filters.genre = req.query.genre;
    if (req.query.country) filters.country = req.query.country;
    if (req.query.actor) {
      filters.$or = [
        { actors: new RegExp(req.query.actor, 'i') },
        { cast: new RegExp(req.query.actor, 'i') }
      ];
    }
    if (req.query.director) {
      filters.$or = [
        { director: new RegExp(req.query.director, 'i') },
        { directors: new RegExp(req.query.director, 'i') }
      ];
    }

    const movies = await Movie.find(filters);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Додавання фільму в історію переглядів
exports.watchMovie = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ error: 'Вкажіть ID фільму (movieId)' });
    }

    // Перевіряємо, чи існує такий фільм у базі
    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ error: 'Фільм із таким ID не знайдено' });
    }

    const historyRecord = new History({
      userId: req.user.userId,
      movieId: movieId
    });

    await historyRecord.save();

    res.status(201).json({
      message: 'Фільм успішно додано до історії переглядів',
      record: historyRecord
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Отримання історії переглядів (ігнорує записи із isDeleted: true)
exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({
      userId: req.user.userId,
      isDeleted: false
    }).populate('movieId');

    res.json({
      userId: req.user.userId,
      totalWatched: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Відправлення сповіщення до Користувацького сервісу
exports.notifyUser = async (req, res) => {
  try {
    const messageData = {
      action: 'MOVIE_NOTIFICATION',
      userId: req.user.userId,
      info: 'Користувач переглядав каталог або додавав фільм'
    };

    sendMessageToUser(messageData);

    res.json({ message: 'Повідомлення успішно відправлено до Користувацького сервісу через RabbitMQ' });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
};