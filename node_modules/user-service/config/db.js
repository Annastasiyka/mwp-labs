// Конфігурація бази даних
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Якщо DB_HOST відсутній або досі дорівнює застарілому app-database — автоматично беремо user-database
    const host = (!process.env.DB_HOST || process.env.DB_HOST === 'app-database') 
      ? 'user-database' 
      : process.env.DB_HOST;

    const mongoUri = process.env.MONGO_URI || 
      `mongodb://${process.env.DB_USER || 'dbuser'}:${process.env.DB_PASSWORD || 'dbpwd'}@${host}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'user_db'}?authSource=admin`;

    await mongoose.connect(mongoUri);
    console.log('✅ Успішно підключено до MongoDB (База користувачів)');
  } catch (err) {
    console.error('❌ Помилка підключення до MongoDB:', err.message);
  }
};

module.exports = connectDB;