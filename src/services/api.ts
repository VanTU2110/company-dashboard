import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5109/api',
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Đặt headers Authorization nếu có token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Thêm time và keyCert vào data (body) hoặc params tùy theo method
  const time = new Date().toISOString();
  const keyCert = 'your-key-cert'; // thay thế bằng key thực tế

  if (config.method === 'get') {
    config.params = {
      ...config.params,
      time,
      keyCert,
    };
  } else {
    // Nếu là POST/PUT thì thêm vào data
    if (config.data && typeof config.data === 'object') {
      config.data = {
        ...config.data,
        time,
        keyCert,
      };
    } else {
      config.data = { time, keyCert };
    }
  }

  return config;
});

export default api;
