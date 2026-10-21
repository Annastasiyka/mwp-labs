import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check } from 'lucide-react';
import { movieApi } from '../api/movieApi';

export default function MyMoviesPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchMessage, setWatchMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    movieApi.getHistory()
      .then(res => {
        if (!isMounted) return;
        let rawHistory = [];
        if (Array.isArray(res.data)) {
          rawHistory = res.data;
        } else if (Array.isArray(res.data?.history)) {
          rawHistory = res.data.history;
        } else if (Array.isArray(res.data?.movies)) {
          rawHistory = res.data.movies;
        }

        const uniqueHistoryMap = new Map();

        rawHistory.forEach(item => {
          const displayTitle = 
            item.title || 
            item.movieTitle || 
            item.movie?.title || 
            (typeof item.movieId === 'object' ? item.movieId?.title : null) || 
            item.name || 
            'Фільм з бази даних';

          const key = displayTitle.trim().toLowerCase();
          const displayDate = item.watchedAt || item.updatedAt || item.createdAt || 'Нещодавно';

          if (!uniqueHistoryMap.has(key)) {
            uniqueHistoryMap.set(key, { ...item, displayTitle, displayDate });
          } else {
            const existing = uniqueHistoryMap.get(key);
            const dateExisting = new Date(existing.displayDate).getTime() || 0;
            const dateNew = new Date(displayDate).getTime() || Date.now();

            if (dateNew >= dateExisting) {
              uniqueHistoryMap.set(key, { ...item, displayTitle, displayDate });
            }
          }
        });

        setHistory(Array.from(uniqueHistoryMap.values()));
      })
      .catch(err => {
        if (isMounted) console.error('Помилка завантаження історії:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleToggleWatched = async (item) => {
    const targetMovieId = (typeof item.movieId === 'object' && item.movieId !== null)
      ? (item.movieId._id || item.movieId.id)
      : (item.movieId || item._id || item.id);

    try {
      await movieApi.watchMovie({ 
        movieId: targetMovieId,
        id: targetMovieId,
        title: item.displayTitle 
      });

      const nowFormatted = new Date().toLocaleDateString('uk-UA') + ' ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

      setHistory(prev => prev.map(m => {
        if (m.displayTitle === item.displayTitle) {
          return { ...m, displayDate: nowFormatted };
        }
        return m;
      }));

      setWatchMessage(`Час перегляду фільму "${item.displayTitle}" оновлено в MongoDB !`);
    } catch (err) {
      console.error('Помилка оновлення статусу фільму:', err);
      setWatchMessage(`Помилка оновлення статусу фільму "${item.displayTitle}".`);
    }
    setTimeout(() => setWatchMessage(''), 3500);
  };

  return (
    <div>
      <h1 className="content-title">Мій список перегляду</h1>
      <p className="content-subtitle">Ваші додані фільми та історія переглядів </p>

      {watchMessage && (
        <div style={{ background: '#eaf2f0', color: '#1b4e43', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontWeight: 600 }}>
          {watchMessage}
        </div>
      )}

      {loading ? (
        <div className="table-card" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
          Завантаження історії...
        </div>
      ) : history.length === 0 ? (
        <div className="table-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Bookmark size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 16 }}>
            Записи про перегляди відсутні в базі даних.
          </p>
          <Link to="/" className="btn-emerald">
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        history.map((item, index) => (
          <div key={item._id || item.id || index} className="watchlist-card">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                {item.displayTitle}
              </h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Додано / переглянуто: {item.displayDate}
              </span>
            </div>

            <button 
              className="btn-emerald"
              onClick={() => handleToggleWatched(item)}
              title="Оновити відмітку перегляду в базі даних"
            >
              <Check size={15} /> Переглянуто ✓
            </button>
          </div>
        ))
      )}
    </div>
  );
}