import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { movieApi } from '../api/movieApi';

export default function RegisterPage({ onLoginSuccess }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      // 1. Реєстрація користувача
      await movieApi.register({ 
        username: usernameInput, 
        password: passwordInput 
      });

      // 2. Автоматичний вхід одразу після успішної реєстрації
      const loginRes = await movieApi.login({
        username: usernameInput,
        password: passwordInput
      });

      const token = loginRes.data?.token;
      if (token && onLoginSuccess) {
        onLoginSuccess(token, usernameInput);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Помилка реєстрації. Можливо, це ім’я вже зайняте.');
      }
    }
  };

  return (
    <div className="centered-card-wrapper">
      <div className="page-card">
        <div className="card-title"><User size={20} /> Реєстрація</div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 15, fontSize: 13, border: '1px solid #fca5a5' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
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
          <button type="submit" className="btn-emerald" style={{ width: '100%' }}>Зареєструватися</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 15, fontSize: 13, color: '#64748b' }}>
          Вже є акаунт? <Link to="/login" style={{ color: '#1b4e43', fontWeight: 600 }}>Увійти</Link>
        </p>
      </div>
    </div>
  );
}