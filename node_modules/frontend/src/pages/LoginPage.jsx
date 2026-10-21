import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { movieApi } from '../api/movieApi';

export default function LoginPage({ onLoginSuccess }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await movieApi.login({ 
        username: usernameInput, 
        password: passwordInput 
      });

      const token = res.data?.token;
      if (token) {
        onLoginSuccess(token, usernameInput);
        navigate('/');
      }
    } catch (err) {
      // Перевірка статусу та повідомлення з бекенду
      if (err.response?.status === 404) {
        setLoginError('Користувача з таким іменем не існує.');
      } else if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setLoginError(err.response.data.error);
      } else {
        setLoginError('Користувача не знайдено або введено невірний пароль.');
      }
    }
  };

  return (
    <div className="centered-card-wrapper">
      <div className="page-card">
        <div className="card-title"><User size={20} /> Увійти в акаунт</div>

        {loginError && (
          <div style={{ 
            background: '#fef2f2', 
            color: '#dc2626', 
            padding: '10px 14px', 
            borderRadius: 6, 
            marginBottom: 15, 
            fontSize: 13, 
            fontWeight: 500,
            border: '1px solid #fca5a5' 
          }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5 }}>Ім'я користувача</label>
            <input 
              type="text" className="form-control" placeholder="Введіть ім'я" required
              value={usernameInput} onChange={e => setUsernameInput(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5 }}>Пароль</label>
            <input 
              type="password" className="form-control" placeholder="••••••••" required
              value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-emerald" style={{ width: '100%' }}>Увійти</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 15, fontSize: 13, color: '#64748b' }}>
          Немає акаунту? <Link to="/register" style={{ color: '#1b4e43', fontWeight: 600 }}>Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
}