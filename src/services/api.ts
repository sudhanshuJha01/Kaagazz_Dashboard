import type { Order, User, UserDetails, DashboardStats } from '../types';
import type { DateRange } from "react-day-picker";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// A generic fetcher function
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Network response was not ok');
  }
  return response.json();
}

// --- Product API ---
export const getProducts = () => apiFetch('/product/list');
export const getProductById = (productId: string) => apiFetch(`/product/${productId}`);
export const uploadProductImages = async (productId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  const response = await fetch(`${API_BASE_URL}/api/product/${productId}/upload-images`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Image upload failed');
  return response.json();
};
export const deleteProduct = (productId: string) => apiFetch(`/product/delete/${productId}`, { method: 'DELETE' });
export const updateProduct = (productId: string, productData: any) => apiFetch(`/product/update/${productId}`, {
  method: 'PUT',
  body: JSON.stringify(productData),
});
export const createProduct = (productData: any) => apiFetch('/product/create', {
  method: 'POST',
  body: JSON.stringify(productData),
});
export const applyBulkDiscount = (productIds: string[], discountPercent: number) => apiFetch(`/product/bulk-discount`, {
  method: 'PATCH',
  body: JSON.stringify({ productIds, discountPercent }),
});

// --- Admin API ---
export const getAdminUsers = (sort: string): Promise<{ users: User[] }> => apiFetch(`/admin/users?sort=${sort}`);
export const getUserDetails = (userId: string): Promise<{ user: UserDetails }> => apiFetch(`/admin/users/${userId}`);
export const sendMassEmail = (userEmails: string[], subject: string, body: string) => apiFetch('/admin/mass-email', {
    method: 'POST',
    body: JSON.stringify({ userEmails, subject, body })
});

// <<< CORRECTED & SIMPLIFIED FUNCTION
export const getDashboardStats = (dateRange?: DateRange): Promise<{ stats: DashboardStats }> => {
  const params = new URLSearchParams();
  if (dateRange?.from) params.append('startDate', dateRange.from.toISOString());
  if (dateRange?.to) params.append('endDate', dateRange.to.toISOString());
  
  return apiFetch(`/admin/stats?${params.toString()}`);
};

// --- Order API ---
interface GetOrdersParams {
  sort?: string;
  status?: string;
  search?: string;
}
export const updateOrderStatus = (orderId: string, status: string) => apiFetch(`/order/update-status/${orderId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});
export const getOrders = (params: GetOrdersParams): Promise<{ orders: Order[] }> => {
  const query = new URLSearchParams();
  if (params.sort) query.append('sort', params.sort);
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  return apiFetch(`/order/list?${query.toString()}`);
};