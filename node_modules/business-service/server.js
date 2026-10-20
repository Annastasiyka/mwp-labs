
// Основний файл сервера бізнес-сервісу
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./services/rabbitmq');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Ініціалізація БД та підключення до черги
connectDB();
connectRabbitMQ();

// Підключення маршрутів
app.use('/', movieRoutes);

const PORT = process.env.API_PORT || 8801;
app.listen(PORT, () => {
  console.log(`🚀 Бізнес-сервіс запущено на порту ${PORT}`);
});