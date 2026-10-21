import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movieApi';

const formatArray = (val) => {
  if (Array.isArray(val)) return val.join(', ');
  return val || '-';
};

export default function CatalogPage({ token, setMovies }) {
  const [allMovies, setAllMovies] = useState([]);

  // Стани для фільтрів
  const [titleQuery, setTitleQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedActor, setSelectedActor] = useState('');

  // Динамічні списки опцій з MongoDB
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableActors, setAvailableActors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 1. Початкове завантаження всіх фільмів з MongoDB
  useEffect(() => {
    let isMounted = true;

    movieApi.getMovies()
      .then(res => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) ? res.data : (res.data?.movies || []);
        
        setAllMovies(data);

        // Синхронізуємо масив фільмів із глобальним станом App.jsx
        if (typeof setMovies === 'function') {
          setMovies(data);
        }

        // Динамічний витяг унікальних жанрів
        const genres = [...new Set(
          data.flatMap(m => Array.isArray(m.genre) ? m.genre : [m.genre]).filter(Boolean)
        )].sort();
        setAvailableGenres(genres);

        // Динамічний витяг унікальних років
        const years = [...new Set(
          data.map(m => m.year).filter(Boolean)
        )].sort((a, b) => b - a);
        setAvailableYears(years);

        // Динамічний витяг унікальних акторів
        const actors = [...new Set(
          data.flatMap(m => Array.isArray(m.cast) ? m.cast : (Array.isArray(m.actors) ? m.actors : [])).filter(Boolean)
        )].sort();
        setAvailableActors(actors);
      })
      .catch(err => {
        if (!isMounted) return;
        if (err.response?.status === 401) {
          setErrorMsg('Для перегляду каталогу з бази даних спочатку увійдіть у систему.');
        } else {
          setErrorMsg('Не вдалося завантажити фільми з MongoDB.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [setMovies]);

  // 2. Обчислення відфільтрованого списку під час рендеру
  const filteredMovies = useMemo(() => {
    return allMovies.filter(m => {
      if (titleQuery.trim()) {
        const q = titleQuery.trim().toLowerCase();
        const matchTitle = m.title?.toLowerCase().includes(q) || m.originalTitle?.toLowerCase().includes(q);
        if (!matchTitle) return false;
      }

      if (selectedGenre) {
        const matchGenre = Array.isArray(m.genre) ? m.genre.includes(selectedGenre) : m.genre === selectedGenre;
        if (!matchGenre) return false;
      }

      if (selectedYear) {
        if (String(m.year) !== String(selectedYear)) return false;
      }

      if (selectedActor) {
        const castList = Array.isArray(m.cast) ? m.cast : (Array.isArray(m.actors) ? m.actors : []);
        if (!castList.includes(selectedActor)) return false;
      }

      return true;
    });
  }, [allMovies, titleQuery, selectedGenre, selectedYear, selectedActor]);

  const handleResetFilters = () => {
    setTitleQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedActor('');
  };

  return (
    <main>
      <h1 className="content-title">Каталог фільмів</h1>
      <p className="content-subtitle">Фільми з вашої бази даних MongoDB</p>

      {errorMsg && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20, border: '1px solid #fca5a5' }}>
          {errorMsg} {!token && <Link to="/login" style={{ fontWeight: 700, color: '#dc2626' }}>Увійти &gt;</Link>}
        </div>
      )}

      {/* Панель фільтрів */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Пошук за назвою</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Введіть назву фільму..." 
              value={titleQuery}
              onChange={e => setTitleQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Жанр</label>
            <select 
              className="form-control" 
              value={selectedGenre} 
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="">Усі жанри</option>
              {availableGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Рік випуску</label>
            <select 
              className="form-control" 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
            >
              <option value="">Усі роки</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Актор</label>
            <select 
              className="form-control" 
              value={selectedActor} 
              onChange={e => setSelectedActor(e.target.value)}
            >
              <option value="">Усі актори</option>
              {availableActors.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {(titleQuery || selectedGenre || selectedYear || selectedActor) && (
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button 
              onClick={handleResetFilters}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Скинути всі фільтри
            </button>
          </div>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            Завантаження даних з MongoDB...
          </div>
        ) : filteredMovies.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            Фільми відсутні в базі даних за обраними критеріями.
          </div>
        ) : (
          <table className="movie-table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Жанр</th>
                <th>Рік</th>
                <th>Режисер</th>
                <th>Рейтинг</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map(movie => {
                const movieId = movie._id || movie.id;
                return (
                  <tr 
                    key={movieId} 
                    onClick={() => navigate(`/movie/${movieId}`)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>{movie.title}</td>
                    <td>{formatArray(movie.genre)}</td>
                    <td>{movie.year || '-'}</td>
                    <td>{formatArray(movie.director || movie.directors)}</td>
                    <td style={{ fontWeight: 600, color: '#d97706' }}>
                      {movie.rating ? `⭐ ${movie.rating}` : '-'}
                    </td>
                    <td>
                      <button 
                        className="btn-outline-emerald" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/movie/${movieId}`);
                        }}
                      >
                        Деталі &gt;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}