// conciliacionService.js
import axios from 'axios';
import { saveAs } from 'file-saver';

const API_URL = 'https://api.systemlex.com.co/api/conciliaciones';

const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

const getConfig = (options = {}) => {
  const token = getToken();
  const headers = { }; 
  if (token) headers.Authorization = `Bearer ${token}`;
  
  // Do not set Content-Type for FormData, let browser do it
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return { headers, ...options };
};

export const createConciliacion = async (payload) => {
  try {
    const config = getConfig({ body: payload });
    const response = await axios.post(API_URL, payload, config);
    return response.data;
  } catch (err) {
    console.error('Error creating conciliacion:', err.response?.data || err.message || err);
    throw err.response?.data || { message: err.message || 'Error creando la solicitud de conciliación' };
  }
};

export const downloadConciliacionDocument = async (solicitudId, format = 'pdf') => {
  try {
    const config = getConfig({ responseType: 'blob' });
    const response = await axios.get(`${API_URL}/${solicitudId}/documento?format=${format}`, config);

    const contentType = (response.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/json')) {
      const text = await response.data.text();
      let errObj = { message: 'Error desconocido en servidor' };
      try { errObj = JSON.parse(text); } catch(e) {}
      throw errObj;
    }

    let filename = `conciliacion-${solicitudId}.${format}`;
    const cd = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    if (cd) {
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/);
      if (match) filename = decodeURIComponent(match[1] || match[2] || match[3]);
    }

    saveAs(response.data, filename);
    return true;
  } catch (error) {
    console.error('Error al descargar el documento de conciliación', error);
    throw error.response?.data || { message: error.message || 'Error descargando el documento' };
  }
};

const conciliacionService = { createConciliacion, downloadConciliacionDocument };
export default conciliacionService;
