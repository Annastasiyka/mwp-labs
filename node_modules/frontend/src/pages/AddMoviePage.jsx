import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { movieApi } from '../api/movieApi';

export default function AddMoviePage({ token }) {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [director, setDirector] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [description, setDescription] = useState('');
  const [cast, setCast] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = "Назва фільму є обов'язковою.";
    }
    if (year && (Number(year) < 1888 || Number(year) > 2100)) {
      errors.year = 'Рік має бути від 1888 до 2100.';
    }
    if (duration && Number(duration) <= 0) {
      errors.duration = 'Тривалість має бути додатним числом.';
    }
    if (rating && (Number(rating) < 0 || Number(rating) > 10)) {
      errors.rating = 'Рейтинг має бути від 0 до 10.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const genreArray = genre ? genre.split(',').map(s => s.trim()).filter(Boolean) : [];
      const castArray = cast ? cast.split(',').map(s => s.trim()).filter(Boolean) : [];
      const directorVal = director.trim();

      const payload = {
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        director: directorVal || undefined,
        directors: directorVal ? [directorVal] : [],
        genre: genreArray,
        year: year ? Number(year) : undefined,
        duration: duration ? Number(duration) : undefined,
        rating: rating ? Number(rating) : undefined,
        description: description.trim() || undefined,
        cast: castArray,
        actors: castArray
      };

      await movieApi.createMovie(payload);
      setStatusMsg(`Фільм "${title}" успішно додано в MongoDB!`);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch {
      setStatusMsg('Помилка додавання фільму в базу даних.');
    }
  };

  if (!token) {
    return (
      <div className="centered-card-wrapper">
        <div className="page-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', marginBottom: 15 }}>
            Для додавання нового фільму в базу даних потрібно увійти.
          </p>
          <Link to="/login" className="btn-emerald">Увійти</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="centered-card-wrapper">
      <div className="page-card" style={{ maxWidth: '760px' }}>
        <div className="card-title">
          <PlusCircle size={22} /> Додати фільм у базу даних
        </div>

        {statusMsg && (
          <div style={{ background: '#eaf2f0', color: '#1b4e43', padding: '10px 14px', borderRadius: 6, marginBottom: 15, fontSize: 13, fontWeight: 600 }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleCreateMovie}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
              Назва фільму * {formErrors.title && <span style={{ color: '#dc2626' }}>({formErrors.title})</span>}
            </label>
            <input 
              type="text" className="form-control" placeholder="Наприклад: Початок"
              value={title} onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Оригінальна назва</label>
              <input 
                type="text" className="form-control" placeholder="Inception"
                value={originalTitle} onChange={e => setOriginalTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Режисер</label>
              <input 
                type="text" className="form-control" placeholder="Крістофер Нолан"
                value={director} onChange={e => setDirector(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Жанри (через кому)</label>
            <input 
              type="text" className="form-control" placeholder="Наукова фантастика, Драма"
              value={genre} onChange={e => setGenre(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Рік {formErrors.year && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <input 
                type="number" className="form-control" placeholder="2010"
                value={year} onChange={e => setYear(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Тривалість (хв) {formErrors.duration && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <input 
                type="number" className="form-control" placeholder="148"
                value={duration} onChange={e => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Рейтинг (0-10) {formErrors.rating && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <input 
                type="number" step="0.1" className="form-control" placeholder="8.8"
                value={rating} onChange={e => setRating(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Актори (через кому)</label>
            <input 
              type="text" className="form-control" placeholder="Леонардо Ді Капріо, Елліот Пейдж"
              value={cast} onChange={e => setCast(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Короткий опис</label>
            <textarea 
              className="form-control" rows="4" placeholder="Опис сюжету..."
              value={description} onChange={e => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn-emerald" style={{ width: '100%', padding: '12px' }}>
            Зберегти фільм у MongoDB
          </button>
        </form>
      </div>
    </div>
  );
}