

// Основний файл сервера користувацького сервісу
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./services/rabbitmq');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Ініціалізація баз даних та сервісу повідомлень
connectDB();
connectRabbitMQ();

// Маршрутизація
app.use('/', userRoutes);

const PORT = process.env.API_PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Користувацький сервіс запущено на порту ${PORT}`);
});