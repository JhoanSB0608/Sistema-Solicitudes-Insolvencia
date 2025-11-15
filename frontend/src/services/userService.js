import axios from 'axios';

const API_URL = 'https://sistema-solicitudes-insolvencia.onrender.com/api/users';

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axios.post(API_URL, { name, email, password });
  if (response.data.token) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('userInfo');
};

export const getMe = async () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
  const response = await axios.get('https://sistema-solicitudes-insolvencia.onrender.com/api/auth/me', config);
  // The /me route returns the user object, but the app stores user object + token.
  // So, we merge them.
  const user = { ...response.data, token: userInfo.token };
  localStorage.setItem('userInfo', JSON.stringify(user));
  return user;
};
