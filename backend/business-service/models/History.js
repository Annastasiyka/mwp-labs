


// Модель для представлення історії переглядів
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  viewDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false } // Маркер для Soft Delete
});

module.exports = mongoose.model('History', historySchema);