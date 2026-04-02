import api from '../api';
import type { User } from '../types';

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post<User>('/auth/login', { username, password });
    return res.data;
  },
  register: async (username: string, password: string) => {
    const res = await api.post<User>('/auth/register', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await api.put('/auth/password', { oldPassword, newPassword });
    return res.data;
  },
};
