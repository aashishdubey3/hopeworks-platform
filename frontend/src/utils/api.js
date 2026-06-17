import axios from 'axios';

// The baseURL now includes '/api' so all requests are automatically prefixed correctly.
// This solves the 404 error you were getting.
const api = axios.create({ 
  baseURL: (import.meta.env.VITE_API_URL || 'https://hopeworks-platform.onrender.com') + '/api'
});

// Automatically attach the correct JWT token to every request
api.interceptors.request.use((config) => {
  // Look for both types of users in Local Storage
  const ngoInfo = JSON.parse(localStorage.getItem('ngoInfo'));
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // Grab whichever token exists
  const token = (ngoInfo && ngoInfo.token) || (userInfo && userInfo.token);
  
  // Attach it to the secure headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;