


// Middleware для аутентифікації токенів
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Доступ заборонено. Токен не надано.' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недійсний або прострочений токен.' });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;