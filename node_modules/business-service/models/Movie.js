
// Модель для представлення фільмів у базі даних
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalTitle: { type: String },
  director: { type: String },
  directors: [{ type: String }],
  genre: [{ type: String }],
  year: { type: Number },
  duration: { type: Number },
  rating: { type: Number },
  description: { type: String },
  cast: [{ type: String }],
  actors: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);