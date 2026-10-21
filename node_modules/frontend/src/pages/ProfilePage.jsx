import { useState } from 'react';
import { Settings, Key, Bell, Trash2 } from 'lucide-react';
import { movieApi } from '../api/movieApi';

export default function ProfilePage({ userName, setUserName, onLogout }) {
  const [message, setMessage] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msgText, setMsgText] = useState('');

  const handleUpdateProfile = async () => {
    try {
      await movieApi.updateProfile({ name: userName, username: userName });
      setMessage('Ім\'я користувача оновлено!');
    } catch { setMessage('Помилка оновлення імені.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await movieApi.changePassword({ oldPassword, newPassword });
      setMessage('Пароль успішно змінено!');
      setOldPassword('');
      setNewPassword('');
    } catch { setMessage('Помилка зміни пароля.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await movieApi.sendMessage(msgText);
      setMessage('Повідомлення надіслано в RabbitMQ!');
      setMsgText('');
    } catch { setMessage('Помилка відправки в RabbitMQ.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Ви дійсно бажаєте видалити свій профіль?')) {
      try { await movieApi.deleteAccount(); } catch (err) { console.error(err); }
      onLogout();
    }
  };

  return (
    <div className="centered-card-wrapper">
      <div className="page-card">
        <div className="card-title"><Settings size={20} /> Налаштування акаунта</div>

        {message && (
          <div style={{ background: '#eaf2f0', color: '#1b4e43', padding: '10px 14px', borderRadius: 6, marginBottom: 15, fontSize: 13, fontWeight: 600 }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 5 }}>Ім'я користувача</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" className="form-control" value={userName} onChange={e => setUserName(e.target.value)} />
            <button className="btn-emerald" onClick={handleUpdateProfile}>Зберегти</button>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 15, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Key size={16} /> Зміна пароля 
          </div>
          <div style={{ marginBottom: 10 }}>
            <input type="password" className="form-control" placeholder="Старий пароль" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input type="password" className="form-control" placeholder="Новий пароль" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-outline-emerald" style={{ width: '100%' }}>Оновити пароль</button>
        </form>

        <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 15, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={16} /> Надіслати RabbitMQ 
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" className="form-control" placeholder="Текст..." required value={msgText} onChange={e => setMsgText(e.target.value)} />
            <button type="submit" className="btn-emerald">Надіслати</button>
          </div>
        </form>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 15 }}>
          <button className="btn-outline-danger" style={{ width: '100%' }} onClick={handleDeleteAccount}>
            <Trash2 size={16} /> Видалити акаунт
          </button>
        </div>
      </div>
    </div>
  );
}