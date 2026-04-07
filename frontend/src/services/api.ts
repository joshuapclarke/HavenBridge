import { getToken } from './auth';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { username: string; password: string; firstName?: string; lastName?: string }) =>
      request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
  },
  residents: {
    list: () => request<any[]>('/residents'),
    get: (id: number) => request<any>(`/residents/${id}`),
    create: (data: any) => request<any>('/residents', { method: 'POST', body: JSON.stringify(data) }),
    alerts: () => request<any>('/residents/alerts'),
  },
  supporters: {
    list: () => request<any[]>('/supporters'),
    get: (id: number) => request<any>(`/supporters/${id}`),
    create: (data: any) => request<any>('/supporters', { method: 'POST', body: JSON.stringify(data) }),
    summary: () => request<any>('/supporters/summary'),
  },
  safehouses: {
    list: () => request<any[]>('/safehouses'),
    get: (id: number) => request<any>(`/safehouses/${id}`),
  },
  sessions: {
    list: (residentId?: number) => request<any[]>(`/processrecordings${residentId ? `?residentId=${residentId}` : ''}`),
    create: (data: any) => request<any>('/processrecordings', { method: 'POST', body: JSON.stringify(data) }),
  },
  visits: {
    list: (residentId?: number) => request<any[]>(`/homevisitations${residentId ? `?residentId=${residentId}` : ''}`),
    create: (data: any) => request<any>('/homevisitations', { method: 'POST', body: JSON.stringify(data) }),
  },
  donations: {
    list: (supporterId?: number) => request<any[]>(`/donations${supporterId ? `?supporterId=${supporterId}` : ''}`),
    create: (data: any) => request<any>('/donations', { method: 'POST', body: JSON.stringify(data) }),
  },
  impact: {
    snapshots: () => request<any[]>('/impact/snapshots'),
    donorImpact: (id: number) => request<any>(`/impact/donor/${id}`),
    overview: () => request<any>('/impact/overview'),
  },
  admin: {
    recentActivity: () => request<any[]>('/admin/recent-activity'),
    search: (q: string) => request<any>(`/admin/search?q=${encodeURIComponent(q)}`),
    users: () => request<any[]>('/admin/users'),
    updateRole: (userId: number, roleId: number) =>
      request<any>(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ roleId }) }),
  },
};
