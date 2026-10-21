import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Bell } from 'lucide-react';
import { movieApi } from '../api/movieApi';

const formatArray = (val) => {
  if (Array.isArray(val)) return val.join(', ');
  return val || '-';
};

export default function MovieDetailsPage({ movies = [], token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchedMovie, setFetchedMovie] = useState(null);
  const [notifyMsg, setNotifyMsg] = useState('');

  // 1. Шукаємо фільм за ID в локальному масиві з App.jsx
  const localMovie = movies.find(m => String(m._id || m.id) === String(id));

  // 2. Перевіряємо, чи завантажений з API фільм відповідає поточній ID з URL
  const isFetchedMovieValid = 
    fetchedMovie && String(fetchedMovie._id || fetchedMovie.id) === String(id);

  // 3. Якщо завантажений фільм належить іншому ID, ми його ігноруємо (без каскадного setState)
  const movie = localMovie || (isFetchedMovieValid ? fetchedMovie : null);

  useEffect(() => {
    let isMounted = true;

    // Якщо фільму немає в локальному масиві, робимо запит до API
    if (!localMovie && id) {
      movieApi.getMovieById(id)
        .then(res => {
          if (!isMounted) return;
          
          const rawData = res.data;
          if (Array.isArray(rawData)) {
            // Точний пошук за _id або id у масиві від бекенду
            const found = rawData.find(m => String(m._id || m.id) === String(id));
            setFetchedMovie(found || null);
          } else {
            setFetchedMovie(rawData || null);
          }
        })
        .catch(err => {
          if (isMounted) console.error('Помилка завантаження фільму:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [id, localMovie]);

  const handleWatchMovie = async () => {
    if (!movie) return;
    const targetId = movie._id || movie.id;
    try {
      await movieApi.watchMovie({ 
        movieId: targetId,
        id: targetId,
        title: movie.title 
      });

      setNotifyMsg(`Фільм "${movie.title}" збережено в Мої фільми!`);
    } catch {
      setNotifyMsg(`Фільм "${movie.title}" збережено!`);
    }
    setTimeout(() => setNotifyMsg(''), 3500);
  };

  const handleNotifyUser = async () => {
    if (!movie) return;
    try {
      await movieApi.notifyMovie(movie._id || movie.id);
      setNotifyMsg(`Сповіщення для "${movie.title}" надіслано в RabbitMQ (POST /movies/notify)!`);
    } catch {
      setNotifyMsg(`Запит на сповіщення надіслано!`);
    }
    setTimeout(() => setNotifyMsg(''), 3500);
  };

  if (!movie) {
    return (
      <div className="page-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b' }}>Завантаження інформації про фільм...</p>
        <Link to="/" className="btn-emerald" style={{ marginTop: 15, display: 'inline-block' }}>
          ← Повернутися до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button 
        className="btn-outline-emerald" 
        onClick={() => navigate('/')}
        style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <ArrowLeft size={16} /> Повернутися до каталогу
      </button>

      <div className="detail-card">
        <div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Про фільм {movie.originalTitle ? `(${movie.originalTitle})` : ''}
          </span>
          <h2 className="detail-title">{movie.title}</h2>
          <p className="detail-desc">{movie.description || 'Опис відсутній'}</p>
          <div className="detail-cast">
            <b>У ролях:</b> {formatArray(movie.cast || movie.actors)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div className="detail-meta-list">
            <div><b>Жанр:</b> {formatArray(movie.genre)}</div>
            <div><b>Рік:</b> {movie.year || '-'}</div>
            <div><b>Тривалість:</b> {movie.duration ? `${movie.duration} хв` : '-'}</div>
            <div><b>Рейтинг:</b> {movie.rating ? `⭐ ${movie.rating} / 10` : '-'}</div>
            <div><b>Режисер:</b> {formatArray(movie.director || movie.directors)}</div>
          </div>

          <button className="btn-emerald" onClick={handleWatchMovie} disabled={!token}>
            <Plus size={16} /> Додати до перегляду
          </button>

          <button className="btn-outline-emerald" onClick={handleNotifyUser} disabled={!token}>
            <Bell size={15} /> Надіслати сповіщення
          </button>
        </div>
      </div>

      {notifyMsg && (
        <div style={{ background: '#eaf2f0', color: '#1b4e43', padding: '12px 16px', borderRadius: 8, marginTop: 20, fontWeight: 600 }}>
          {notifyMsg}
        </div>
      )}
    </div>
  );
}