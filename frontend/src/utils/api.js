import axios from 'axios';

// GOOD: This will use your Vercel Environment Variable
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://hopeworks-platform.onrender.com' 
});

// Automatically attach the correct JWT token to every request
api.interceptors.request.use((config) => {
  // Look for both types of users in Local Storage
  const ngoInfo = JSON.parse(localStorage.getItem('ngoInfo'));
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  // Grab whichever token exists (NGO token gets priority if both somehow exist)
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