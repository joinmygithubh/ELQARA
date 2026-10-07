import axios from 'axios';

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('elqara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for centralized error parsing
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout')
};

// Products endpoints
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleStatus: (id) => api.patch(`/products/${id}/status`)
};

// Categories endpoints
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Orders endpoints
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  getAllAdmin: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/admin/stats')
};

// Customers endpoints
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  toggleBlock: (id) => api.patch(`/customers/${id}/toggle-block`)
};

// Coupons endpoints
export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`)
};

// Homepage settings
export const homepageAPI = {
  get: () => api.get('/homepage'),
  update: (data) => api.put('/homepage', data)
};

// Image Uploads
export const uploadAPI = {
  single: (formData) =>
    api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  multiple: (formData) =>
    api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Currency endpoints
export const currencyAPI = {
  getRates: () => api.get('/currency/rates'),
  detect: (params) => api.get('/currency/detect', { params })
};

// Customer Enquiry endpoints
export const enquiryAPI = {
  submit: (data) => api.post('/enquiries', data),
  getAllAdmin: (params) => api.get('/enquiries/admin/all', { params }),
  getById: (id) => api.get(`/enquiries/${id}`),
  updateStatus: (id, data) => api.patch(`/enquiries/${id}/status`, data),
  delete: (id) => api.delete(`/enquiries/${id}`)
};

export default api;
