import { getToken } from './auth';
import type { User } from '../types/models';

const BASE = import.meta.env.VITE_API_URL ?? '/api';

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
    throw new Error(
      body?.detail
        ? `${body?.message ?? `API ${res.status}: ${res.statusText}`} (${body.detail})`
        : (body?.message ?? `API ${res.status}: ${res.statusText}`)
    );
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { username: string; password: string; firstName?: string; lastName?: string }) =>
      request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      request<{ token: string; needPasswordReset: boolean; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
    createDonorProfile: (data?: { email?: string; phone?: string; region?: string; country?: string }) =>
      request<{ token: string; supporterId: number }>('/auth/create-donor-profile', { method: 'POST', body: JSON.stringify(data ?? {}) }),
  },
  residents: {
    list: (page = 1, pageSize = 20) => request<{ items: any[]; totalCount: number; page: number; pageSize: number }>(`/residents?page=${page}&pageSize=${pageSize}`),
    get: (id: number) => request<any>(`/residents/${id}`),
    create: (data: any) => request<any>('/residents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/residents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    alerts: () => request<any>('/residents/alerts'),
  },
  supporters: {
    list: (page = 1, pageSize = 20) => request<{ items: any[]; totalCount: number; page: number; pageSize: number }>(`/supporters?page=${page}&pageSize=${pageSize}`),
    get: (id: number) => request<any>(`/supporters/${id}`),
    create: (data: any) => request<any>('/supporters', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/supporters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    flagAtRisk: (id: number) => request<any>(`/supporters/${id}/flag-at-risk`, { method: 'PUT' }),
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
  reports: {
    charts: () => request<any>('/reports/charts'),
    annual: (year: number) => request<any>(`/reports/annual/${year}`),
    upcomingConferences: () => request<any[]>('/reports/upcoming-conferences'),
    mlPipelines: () => request<{ pipelines: any[] }>('/reports/ml-pipelines'),
  },
  admin: {
    recentActivity: () => request<any[]>('/admin/recent-activity'),
    search: (q: string) => request<any>(`/admin/search?q=${encodeURIComponent(q)}`),
    users: (page = 1, pageSize = 20) => request<{ items: any[]; totalCount: number; page: number; pageSize: number }>(`/admin/users?page=${page}&pageSize=${pageSize}`),
    createUser: (data: { username: string; password: string; roleId: number; firstName?: string; lastName?: string }) =>
      request<any>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    deleteUser: (userId: number) =>
      request<any>(`/admin/users/${userId}`, { method: 'DELETE' }),
    updateRole: (userId: number, roleId: number) =>
      request<any>(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ roleId }) }),
    setPasswordReset: (userId: number, needPasswordReset: boolean) =>
      request<any>(`/admin/users/${userId}/require-password-reset`, { method: 'PUT', body: JSON.stringify({ needPasswordReset }) }),
  },
  users: {
    list: () => request<User[]>('/users'), 
  },
};
