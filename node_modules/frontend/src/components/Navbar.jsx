import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, LogOut } from 'lucide-react';

export default function Navbar({ token, userName, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleProtectedNav = (path) => {
    if (!token && (path === '/my-movies' || path === '/profile' || path === '/add-movie')) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand-logo">
        <Film size={26} /> Кіносписок
      </Link>

      <nav className="nav-links">
        <Link 
          to="/" 
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          Каталог
        </Link>
        <button 
          onClick={() => handleProtectedNav('/add-movie')}
          className={`nav-item ${location.pathname === '/add-movie' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Додати фільм
        </button>
        <button 
          onClick={() => handleProtectedNav('/my-movies')}
          className={`nav-item ${location.pathname === '/my-movies' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Мої фільми
        </button>
        <button 
          onClick={() => handleProtectedNav('/profile')}
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Кабінет
        </button>
      </nav>

      <div className="nav-right">
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1b4e43' }}>
              👤 {userName}
            </span>
            <button className="btn-outline-emerald" onClick={onLogout}>
              <LogOut size={14} /> Вийти
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn-outline-emerald">
              Увійти
            </Link>
            <Link to="/register" className="btn-emerald">
              Реєстрація
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}