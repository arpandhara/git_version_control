import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // for HttpOnly cookies
});

// Response interceptor to handle 401s for refresh token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call the refresh endpoint
        await axios.post('http://localhost:3000/api/v1/auth/refresh', {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch (refreshError) {
        const publicRoutes = ['/', '/signup', '/forgot-password', '/verify'];
        if (!publicRoutes.includes(window.location.pathname)) {
          window.location.href = '/'; // Redirect to sign in
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
