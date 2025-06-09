import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_APP_URL,
});

// Add token from localStorage to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
