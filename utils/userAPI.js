import api from './api';

// User API calls for regular users (students/verifiers)
export const userAPI = {
  // Profile Management
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Password Management
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Institutions
  getInstitutions: async () => {
    const response = await api.get('/users/institutions');
    return response.data;
  },
};

export default userAPI;