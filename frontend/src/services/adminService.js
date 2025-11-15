import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Helper para obtener el token y la configuración
const getConfig = () => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  if (!token) {
    throw new Error('No autorizado, inicie sesión de nuevo.');
  }
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener las estadísticas del dashboard
export const getAdminStats = async () => {
  const { data } = await axios.get(`${API_URL}/stats`, getConfig());
  return data;
};

// Obtener el historial de solicitudes (con paginación)
export const getAdminSolicitudes = async (page = 1, limit = 10) => {
  const { data } = await axios.get(`${API_URL}/solicitudes?page=${page}&limit=${limit}`, getConfig());
  return data;
};