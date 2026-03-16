// lib/api.ts — API client replacing localStorage-based storage.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
    }
    throw error;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur réseau' }));
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  const json = await res.json();
  // The ResponseInterceptor wraps responses in { success, data, timestamp }
  return json.data ?? json;
}

export const api = {
  // ─── Auth ──────────────────────────────────────────
  login: (email: string, password: string) =>
    request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<any>('/auth/me'),

  // ─── Couriers ──────────────────────────────────────
  getCouriers: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = params ? new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return request<{ data: any[]; meta: any }>(`/couriers${query ? `?${query}` : ''}`);
  },
  getCourierById: (id: string) => request<any>(`/couriers/${id}`),
  createCourier: (data: any) =>
    request<any>('/couriers', { method: 'POST', body: JSON.stringify(data) }),
  updateCourierState: (id: string, state: string, notes?: string) =>
    request<any>(`/couriers/${id}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ state, notes }),
    }),
  deleteCourier: (id: string) =>
    request<any>(`/couriers/${id}`, { method: 'DELETE' }),

  // ─── Entities ──────────────────────────────────────
  getEntities: () => request<any[]>('/entities'),
  getEntityById: (id: string) => request<any>(`/entities/${id}`),
  createEntity: (data: any) =>
    request<any>('/entities', { method: 'POST', body: JSON.stringify(data) }),
  updateEntity: (id: string, data: any) =>
    request<any>(`/entities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEntity: (id: string) =>
    request<any>(`/entities/${id}`, { method: 'DELETE' }),

  // ─── Users ─────────────────────────────────────────
  getUsers: () => request<any[]>('/users'),
  getUserById: (id: string) => request<any>(`/users/${id}`),
  createUser: (data: any) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) =>
    request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<any>(`/users/${id}`, { method: 'DELETE' }),

  // ─── Référentiels ──────────────────────────────────
  getCategories: () => request<any[]>('/categories'),
  createCategory: (data: any) =>
    request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) =>
    request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    request<any>(`/categories/${id}`, { method: 'DELETE' }),

  getTypes: () => request<any[]>('/courier-types'),
  createType: (data: any) =>
    request<any>('/courier-types', { method: 'POST', body: JSON.stringify(data) }),
  updateType: (id: string, data: any) =>
    request<any>(`/courier-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteType: (id: string) =>
    request<any>(`/courier-types/${id}`, { method: 'DELETE' }),

  getRefStates: () => request<any[]>('/ref-states'),
  createRefState: (data: any) =>
    request<any>('/ref-states', { method: 'POST', body: JSON.stringify(data) }),
  updateRefState: (id: string, data: any) =>
    request<any>(`/ref-states/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRefState: (id: string) =>
    request<any>(`/ref-states/${id}`, { method: 'DELETE' }),

  // ─── Upload ────────────────────────────────────────
  uploadFile: async (file: File, courierId: string): Promise<any> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courierId', courierId);

    const res = await fetch(`${API_URL}/attachments/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error('Erreur upload fichier');
    const json = await res.json();
    return json.data ?? json;
  },
};
