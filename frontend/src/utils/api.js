import axios from 'axios';

// The baseURL now includes '/api' so all requests are automatically prefixed correctly.
const api = axios.create({ 
  baseURL: (import.meta.env.VITE_API_URL || 'https://hopeworks-platform.onrender.com') + '/api'
});

// Automatically attach the correct JWT token to every request
api.interceptors.request.use((config) => {
  // THE FIX: Directly grab the 'token' key that LoginPage.jsx created
  const token = localStorage.getItem('token');
  
  // Attach it to the secure headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;