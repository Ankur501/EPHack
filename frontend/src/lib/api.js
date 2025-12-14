import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
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
};