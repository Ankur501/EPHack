import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store session token from login/signup responses
api.interceptors.response.use((response) => {
  if (response.data?.session_token) {
    localStorage.setItem('session_token', response.data.session_token);
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

// Add session token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('session_token');
    return api.post('/auth/logout');
  },
  getMe: () => api.get('/auth/me'),
  googleRedirect: () => api.get('/auth/google-redirect'),
  exchangeSession: (sessionId) => api.get(`/auth/session?session_id=${sessionId}`),
};

export const videoAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      },
    });
  },
  process: (videoId) => api.post(`/videos/${videoId}/process`),
  getJobStatus: (jobId) => api.get(`/jobs/${jobId}/status`),
};

export const reportAPI = {
  getReport: (reportId) => api.get(`/reports/${reportId}`),
  listReports: () => api.get('/reports'),
  createShareLink: (reportId) => api.post(`/reports/${reportId}/share`),
  getSharedReport: (shareId) => api.get(`/shared/reports/${shareId}`),
};

export const coachingAPI = {
  createRequest: (payload) => api.post('/coaching/requests', payload),
};
