// Централізований сервіс усіх HTTP-запитів
import axios from 'axios';

const API_GATEWAY = 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const movieApi = {
  // Фільми
  getMovies: () => 
    axios.get(`${API_GATEWAY}/movies`, getAuthHeaders()),

  // Пошук за назвою та жанром одночасно
  searchMovies: (query) => {
    if (!query || !query.trim()) {
      return axios.get(`${API_GATEWAY}/movies`, getAuthHeaders());
    }
    const q = encodeURIComponent(query.trim());
    return axios.get(`${API_GATEWAY}/movies/search?title=${q}&genre=${q}`, getAuthHeaders());
  },

  // Отримання конкретного фільму за ID
  getMovieById: (id) => 
    axios.get(`${API_GATEWAY}/movies/${id}`, getAuthHeaders()),

  createMovie: (payload) => 
    axios.post(`${API_GATEWAY}/movies`, payload, getAuthHeaders()),

  watchMovie: (payload) => 
    axios.post(`${API_GATEWAY}/movies/watch`, payload, getAuthHeaders()),

  getHistory: () => 
    axios.get(`${API_GATEWAY}/movies/history`, getAuthHeaders()),

  notifyMovie: (movieId) => 
    axios.post(`${API_GATEWAY}/movies/notify`, { movieId }, getAuthHeaders()),

  // Авторизація та користувач
  login: (credentials) => 
    axios.post(`${API_GATEWAY}/login`, credentials),

  register: (credentials) => 
    axios.post(`${API_GATEWAY}/register`, credentials),

  updateProfile: (data) => 
    axios.put(`${API_GATEWAY}/user`, data, getAuthHeaders()),

  changePassword: (data) => 
    axios.put(`${API_GATEWAY}/user/password`, data, getAuthHeaders()),

  deleteAccount: () => 
    axios.delete(`${API_GATEWAY}/user`, getAuthHeaders()),

  sendMessage: (message) => 
    axios.post(`${API_GATEWAY}/send-message`, { message }, getAuthHeaders())
};