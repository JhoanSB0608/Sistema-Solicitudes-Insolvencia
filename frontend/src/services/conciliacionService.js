// conciliacionService.js
import axios from 'axios';

const API_URL = 'https://api.systemlex.com.co/api/conciliaciones';

const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

const getConfig = (options = {}) => {
  const token = getToken();
  const headers = { }; // Let browser set Content-Type for FormData
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers, ...options };
};

export const createConciliacion = async (payload) => {
  try {
    const config = getConfig();
    if (!(payload instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios.post(API_URL, payload, config);
    return response.data;
  } catch (err) {
    console.error('Error creating conciliacion:', err.response?.data || err.message || err);
    throw err.response?.data || { message: err.message || 'Error creando la solicitud de conciliación' };
  }
};

const conciliacionService = { createConciliacion };
export default conciliacionService;
