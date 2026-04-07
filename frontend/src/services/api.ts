import type { User } from '../types/models';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
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
  },
  users: {
    list: () => request<User[]>('/users'), // Add this line
  },
};
