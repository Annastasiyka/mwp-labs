const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 8800;

// Дозволяємо CORS для майбутнього Angular фронтенду
app.use(cors());

// Адреси внутрішніх мікросервісів у Docker-мережі
const USER_SERVICE_URL = process.env.USER_SERVICE_API_URL || 'http://user_nodejs:8800';
const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_API_URL || 'http://business_nodejs:8801';

// Маршрутизація до User Service
app.use(
  createProxyMiddleware(
    ['/register', '/login', '/user', '/change-password', '/send-message'],
    {
      target: USER_SERVICE_URL,
      changeOrigin: true
    }
  )
);

// Маршрутизація до Business Service (збереження повного шляху /movies)
app.use(
  createProxyMiddleware('/movies', {
    target: BUSINESS_SERVICE_URL,
    changeOrigin: true
  })
);

// Базовий тестовий маршрут шлюзу
app.get('/', (req, res) => {
  res.send('API Gateway is running...');
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});