const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendMessageToBusiness } = require('../services/rabbitmq');

// 1. Реєстрація з хешуванням пароля
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Будь ласка, вкажіть ім\'я користувача та пароль' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач із таким іменем вже існує' });
    }

    // Хешуємо пароль перед збереженням
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Користувача успішно зареєстровано' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 2. Вхід із перевіркою хешу
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Будь ласка, вкажіть ім\'я користувача та пароль' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Невірне ім\'я користувача або пароль' });
    }

    // Порівнюємо введений пароль із захешованим у БД
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Невірне ім\'я користувача або пароль' });
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
};

// 3. Оновлення профілю користувача (заборонено змінювати пароль через цей маршрут)
exports.updateUser = async (req, res) => {
  try {
    const { username, password, oldPassword, newPassword } = req.body;

    // Перевірка: якщо передано будь-які поля пароля
    if (password || oldPassword || newPassword) {
      return res.status(400).json({
        error: 'Не можна змінити дані паролю через цей маршрут. Для зміни пароля використовуйте PUT /password після /user з відповідними полями oldPassword та newPassword'
      });
    }

    if (!username) {
      return res.status(400).json({ error: 'Вкажіть нове ім\'я користувача (username)' });
    }

    // Оновлюємо лише дозволені поля та приховуємо password з відповіді
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json({ message: 'Профіль успішно оновлено', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Безпечна зміна пароля (з перевіркою старого пароля)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Необхідно вказати старий та новий пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новий пароль повинен містити щонайменше 6 символів' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Перевірка старого пароля
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ error: 'Старий пароль вказано невірно' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'Новий пароль не може збігатися зі старим' });
    }

    // Хешуємо новий пароль та зберігаємо
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Пароль успішно змінено та захешовано' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Видалення акаунта
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndDelete(userId);

    sendMessageToBusiness({
      action: 'DELETE_USER',
      userId: userId
    });

    res.json({ message: 'Користувача видалено, повідомлення відправлено в RabbitMQ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Відправка довільного повідомлення в RabbitMQ
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    sendMessageToBusiness({
      action: 'SEND_MESSAGE',
      payload: message
    });
    res.json({ message: 'Повідомлення відправлено в RabbitMQ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};