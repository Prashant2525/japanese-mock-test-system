import axios from 'axios';

export const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
}

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload)
};

export const assessmentApi = {
  status: () => api.get('/assessment/status'),
  start: () => api.post('/assessment/start'),
  answer: (attemptId, payload) => api.post(`/assessment/${attemptId}/answers`, payload),
  submit: (attemptId) => api.post(`/assessment/${attemptId}/submit`)
};

export const dashboardApi = { get: () => api.get('/dashboard') };
export const coursesApi = {
  list: (params) => api.get('/courses', { params }),
  get: (courseId) => api.get(`/courses/${courseId}`),
  updateProgress: (courseId, payload) => api.post(`/courses/${courseId}/progress`, payload)
};
export const mocksApi = {
  list: (params) => api.get('/mock-tests', { params }),
  get: (testId) => api.get(`/mock-tests/${testId}`),
  start: (testId) => api.post(`/mock-tests/${testId}/start`)
};
export const attemptsApi = {
  get: (attemptId) => api.get(`/attempts/${attemptId}`),
  answer: (attemptId, payload) => api.post(`/attempts/${attemptId}/answers`, payload),
  submit: (attemptId) => api.post(`/attempts/${attemptId}/submit`),
  results: () => api.get('/results'),
  result: (attemptId) => api.get(`/results/${attemptId}/result`)
};
export const profileApi = { get: () => api.get('/profile') };

