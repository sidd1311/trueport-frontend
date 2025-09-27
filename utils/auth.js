import Cookies from 'js-cookie';

export const setAuthToken = (token) => {
  Cookies.set('auth-token', token, { expires: 7 }); // 7 days
};

export const getAuthToken = () => {
  return Cookies.get('auth-token');
};

export const removeAuthToken = () => {
  Cookies.remove('auth-token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const logout = () => {
  removeAuthToken();
  window.location.href = '/auth/login';
};