import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for authenticated routes (not the initial getMe check)
    // Skip redirect if already on login/register page
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage = path === '/login' || path === '/register';
      const isMeEndpoint = error.config?.url?.includes('/auth/me');

      // Only redirect for real auth failures, not initial session checks
      if (!isAuthPage && !isMeEndpoint) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
