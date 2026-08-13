import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const WMS_API_URL = process.env.NEXT_PUBLIC_WMS_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
});

export const wmsApiInstance = axios.create({
  baseURL: `${WMS_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
const setupInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use((config: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (res: any) => res,
    async (err: any) => {
      if (err.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Prevent infinite loops if already on login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(err);
    }
  );
};

setupInterceptors(api);
setupInterceptors(wmsApiInstance);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// ── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: object) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: (params?: object) => api.get('/categories', { params }),
  create: (data: object) => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const brandsApi = {
  getAll: (params?: object) => api.get('/brands', { params }),
  create: (data: object) => api.post('/brands', data),
  update: (id: string, data: object) => api.put(`/brands/${id}`, data),
  remove: (id: string) => api.delete(`/brands/${id}`),
};

export const unitsApi = {
  getAll: (params?: object) => api.get('/units', { params }),
  create: (data: object) => api.post('/units', data),
};

export const taxesApi = {
  getAll: (params?: object) => api.get('/taxes', { params }),
  create: (data: object) => api.post('/taxes', data),
};

export const stockInfoApi = {
  getAll: (params?: object) => api.get('/stock-info', { params }),
};

// ── POS ──────────────────────────────────────────────────────────────────────
export const posApi = {
  openShift: (data: object) => api.post('/pos/shifts/open', data),
  closeShift: (data: object) => api.post('/pos/shifts/close', data),
  getReport: (id: string) => api.get(`/pos/shifts/${id}/report`),
  cashIn: (id: string, data: object) => api.post(`/pos/shifts/${id}/cash-in`, data),
  cashOut: (id: string, data: object) => api.post(`/pos/shifts/${id}/cash-out`, data),
  createSale: (data: object) => api.post('/pos/sales', data),
  refund: (data: object) => api.post('/pos/sales/refund', data),
};

// ── Marketplace ───────────────────────────────────────────────────────────────
export const marketplaceApi = {
  sync: () => api.post('/marketplace/sync'),
  status: () => api.get('/marketplace/status'),
};

// ── WMS (C# Microservice) ─────────────────────────────────────────────────────
export const wmsApi = {
  getDashboard: (warehouseId?: string) =>
    wmsApiInstance.get('/analytics/dashboard', { params: { warehouseId } }),
  getSales: (params: { from: string; to: string; warehouseId?: string; productId?: string }) =>
    wmsApiInstance.get('/analytics/sales', { params }),
  getStaff: (params: { from: string; to: string; warehouseId?: string }) =>
    wmsApiInstance.get('/analytics/staff', { params }),
  getNetwork: () =>
    wmsApiInstance.get('/analytics/network'),
  
  getPreorders: (params?: { warehouseId?: string; status?: number }) =>
    wmsApiInstance.get('/preorders', { params }),
  createPreorder: (data: object) =>
    wmsApiInstance.post('/preorders', data),
  updatePreorderStatus: (id: string, status: number) =>
    wmsApiInstance.put(`/preorders/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    }),

  getSeasonalPrices: (productId?: string, activeOnly: boolean = false) =>
    wmsApiInstance.get('/pricing/seasonal', { params: { productId, activeOnly } }),
  createSeasonalPrice: (data: object) =>
    wmsApiInstance.post('/pricing/seasonal', data),

  getStocks: (params?: { warehouseId?: string; productId?: string }) =>
    wmsApiInstance.get('/stock', { params }),
  getMovements: (params?: { stockId?: string; warehouseId?: string }) =>
    wmsApiInstance.get('/stock/movements', { params }),
  getExpiringStocks: (params?: { warehouseId?: string; days?: number }) =>
    wmsApiInstance.get('/stock/expiring', { params }),
  receiveStock: (data: object) =>
    wmsApiInstance.post('/stock/receive', data),
  writeOffStock: (data: object) =>
    wmsApiInstance.post('/stock/writeoff', data),
  moveStock: (data: object) =>
    wmsApiInstance.post('/stock/move', data),

  getWarehouses: () =>
    wmsApiInstance.get('/warehouse'),
  createWarehouse: (data: object) =>
    wmsApiInstance.post('/warehouse', data),
};
