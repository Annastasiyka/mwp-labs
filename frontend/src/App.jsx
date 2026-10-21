import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import AddMoviePage from './pages/AddMoviePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import MyMoviesPage from './pages/MyMoviesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [movies, setMovies] = useState([]);

  const handleLogout = () => {
    setToken('');
    setUserName('');
    localStorage.clear();
  };

  // Автоматичне розлогінування при 401 Unauthorized
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLoginSuccess = (newToken, name) => {
    setToken(newToken);
    setUserName(name || 'Користувач');
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', name || 'Користувач');
  };

  return (
    <BrowserRouter>
      <div className="page-wrapper">
        <Navbar token={token} userName={userName} onLogout={handleLogout} />

        <Routes>
          <Route 
            path="/" 
            element={<CatalogPage movies={movies} setMovies={setMovies} token={token} />} 
          />
          <Route 
            path="/add-movie" 
            element={<AddMoviePage token={token} />} 
          />
          <Route 
            path="/movie/:id" 
            element={<MovieDetailsPage movies={movies} token={token} />} 
          />
          <Route 
            path="/login" 
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/register" 
            element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/my-movies" 
            element={<MyMoviesPage />} 
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                userName={userName} 
                setUserName={setUserName}
                onLogout={handleLogout}
              />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}