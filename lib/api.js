import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config.url.includes('/auth/login') &&
      !err.config.url.includes('/accounts/')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const accountAPI = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  getCategories: () => api.get('/accounts/categories'),
  getSkins: (params) => api.get('/accounts/skins', { params }),
  create: (data) => api.post('/accounts/create', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  getPostFeePercent: () => api.get('/accounts/post-fee-percent'),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const orderAPI = {
  createMiddleman: (data) => api.post('/orders/middleman/create', data),
  getDetail: (id) => api.get(`/orders/middleman/${id}`),
  getMessages: (id) => api.get(`/orders/middleman/${id}/messages`),
  sendMessage: (id, data) => api.post(`/orders/middleman/${id}/messages`, data),
  complete: (id) => api.post(`/orders/middleman/${id}/complete`),
  cancel: (id, data) => api.post(`/orders/middleman/${id}/cancel`, data),
  getMyOrders: () => api.get('/orders/my-orders'),
};

export const userAPI = {
  createDeposit: (data) => api.post('/user/deposits', data),
  getDeposits: () => api.get('/user/deposits'),
  getHistory: (params) => api.get('/user/history', { params }),
  getMyAccounts: () => api.get('/user/my-accounts'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/profile/change-password', data),
};

export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getBySlug: (slug) => api.get(`/news/${slug}`),
  getTopDeposit: () => api.get('/news/top-deposit'),
};

export const adminAPI = {
  getAccounts: (params) => api.get('/admin/accounts', { params }),
  createAccount: (data) => api.post('/admin/accounts', data),
  updateAccount: (id, data) => api.put(`/admin/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/admin/accounts/${id}`),
  getSkins: (params) => api.get('/admin/skins', { params }),
  createSkin: (data) => api.post('/admin/skins', data),
  updateSkin: (id, data) => api.put(`/admin/skins/${id}`, data),
  deleteSkin: (id) => api.delete(`/admin/skins/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getDeposits: (params) => api.get('/admin/deposits', { params }),
  approveDeposit: (id, data) => api.put(`/admin/deposits/${id}/approve`, data),
  rejectDeposit: (id, data) => api.put(`/admin/deposits/${id}/reject`, data),
  getRevenue: () => api.get('/admin/revenue'),
  getHistory: (params) => api.get('/admin/history', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  resetPassword: (id, data) => api.put(`/admin/users/${id}/reset-password`, data),
  getNews: () => api.get('/admin/news'),
  createNews: (data) => api.post('/admin/news', data),
  updateNews: (id, data) => api.put(`/admin/news/${id}`, data),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.post('/admin/settings', data),
  testTelegramSettings: (data) => api.post('/admin/test-telegram', data),
};
