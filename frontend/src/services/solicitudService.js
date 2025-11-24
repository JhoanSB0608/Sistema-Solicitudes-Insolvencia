// solicitudService.js (actualizado)
import axios from 'axios';
import { saveAs } from 'file-saver';

const API_URL = 'https://api.systemlex.com.co/api/solicitudes';

const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

const getConfig = (options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers, ...options };
};

export const createSolicitud = async (payload) => {
  try {
    const config = getConfig();
    // If payload is FormData, we must remove the Content-Type header
    // so that the browser can set it with the correct boundary.
    if (payload instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const response = await axios.post(API_URL, payload, config);
    return response.data;
  } catch (err) {
    console.error('Error creating solicitud:', err.response?.data || err.message || err);
    // Normalize error for frontend
    throw err.response?.data || { message: err.message || 'Error creando la solicitud' };
  }
};

export const downloadSolicitudDocument = async (solicitudId, format = 'pdf') => {
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

    let filename = `solicitud-${solicitudId}.${format}`;
    const cd = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    if (cd) {
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/);
      if (match) filename = decodeURIComponent(match[1] || match[2] || match[3]);
    }

    saveAs(response.data, filename);
    return true;
  } catch (error) {
    console.error('Error al descargar el documento', error);
    // lanzar objeto consistente
    throw error.response?.data || { message: error.message || 'Error descargando el documento' };
  }
};

export const getSolicitudById = async (solicitudId) => {
  try {
    const config = getConfig();
    const response = await axios.get(`${API_URL}/${solicitudId}`, config);
    return response.data;
  } catch (err) {
    console.error('Error fetching solicitud:', err.response?.data || err.message || err);
    throw err.response?.data || { message: err.message || 'Error obteniendo la solicitud' };
  }
};

export const updateSolicitud = async (solicitudId, payload) => {
  try {
    const config = getConfig();
    if (payload instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    const response = await axios.put(`${API_URL}/${solicitudId}`, payload, config);
    return response.data;
  } catch (err) {
    console.error('Error updating solicitud:', err.response?.data || err.message || err);
    throw err.response?.data || { message: err.message || 'Error actualizando la solicitud' };
  }
};

const solicitudService = { createSolicitud, downloadSolicitudDocument, getSolicitudById, updateSolicitud };
export default solicitudService;
