import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_APP_URL,
  withCredentials: true,
});

// Add token from localStorage to each request
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin-token");
  const userToken = localStorage.getItem("token");
  
  // Check for parent data in userData
  let parentToken = null;
  const userData = localStorage.getItem("userData");
  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      parentToken = parsedData.access_token;
    } catch (error) {
      console.error('Error parsing userData for token:', error);
    }
  }

  // Prioritize admin-token, then user token, then parent token
  const token = adminToken || userToken || parentToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
