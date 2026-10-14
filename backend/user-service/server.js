require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

// Підключення до MongoDB
const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Модель користувача
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Налаштування RabbitMQ
let channel = null;
const QUEUE_TO_BUSINESS = 'user_to_business';
const QUEUE_FROM_BUSINESS = 'business_to_user';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_TO_BUSINESS, { durable: false });
    await channel.assertQueue(QUEUE_FROM_BUSINESS, { durable: false });

    console.log('Connected to RabbitMQ');

    // Зчитування повідомлень з RabbitMQ від Бізнес мікросервісу
    channel.consume(QUEUE_FROM_BUSINESS, (msg) => {
      if (msg !== null) {
        console.log('Received from Business Service:', msg.content.toString());
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.log('RabbitMQ not available yet (will be configured in Lab 2):', error.message);
  }
}
connectRabbitMQ();

// Реєстрація користувача
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Авторизація користувача та видача JWT токена
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Надсилання повідомлення до Business Service через RabbitMQ
app.post('/send-message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!channel) {
      return res.status(503).json({ error: 'RabbitMQ channel is not connected' });
    }
    channel.sendToQueue(QUEUE_TO_BUSINESS, Buffer.from(JSON.stringify(message)));
    res.json({ status: 'Message sent to Business Service', message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 8800;
app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});