
// Підключення до MongoDB
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
    await mongoose.connect(mongoUri);
    console.log('✅ Успішно підключено до MongoDB (База фільмів)');
  } catch (err) {
    console.error('❌ Помилка підключення до MongoDB (Business DB):', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;