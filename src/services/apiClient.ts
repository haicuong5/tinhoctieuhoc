/**
 * API Client kết nối React Frontend với Express Backend và Cloud Firestore Repository
 * Tự động gắn Bearer Token qua getCurrentBearerToken()
 */
import { getCurrentBearerToken } from './firebase';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getCurrentBearerToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Lỗi máy chủ (${res.status})`);
  }
  return data;
}

export const apiClient = {
  // 1. Users
  getUserProfile: async () => {
    return fetchWithAuth('/api/users/profile');
  },
  saveUserProfile: async (profile: { displayName?: string; assignedGrades?: number[] }) => {
    return fetchWithAuth('/api/users/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  // 2. Materials
  getMaterials: async (params?: { grade?: number; topic?: string }) => {
    const query = new URLSearchParams();
    if (params?.grade) query.append('grade', String(params.grade));
    if (params?.topic) query.append('topic', params.topic);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/api/materials${qs}`);
  },
  getMaterialById: async (id: string) => {
    return fetchWithAuth(`/api/materials/${id}`);
  },
  updateMaterial: async (id: string, updates: any) => {
    return fetchWithAuth(`/api/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteMaterial: async (id: string) => {
    return fetchWithAuth(`/api/materials/${id}`, {
      method: 'DELETE',
    });
  },

  // 3. Learning Plans
  getLearningPlans: async (params?: { grade?: number; materialId?: string }) => {
    const query = new URLSearchParams();
    if (params?.grade) query.append('grade', String(params.grade));
    if (params?.materialId) query.append('materialId', params.materialId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/api/learning-plans${qs}`);
  },
  saveLearningPlan: async (plan: any) => {
    return fetchWithAuth('/api/learning-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },
  updateLearningPlan: async (id: string, updates: any) => {
    return fetchWithAuth(`/api/learning-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 4. Lessons
  getLessons: async (params?: { grade?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.grade) query.append('grade', String(params.grade));
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/api/lessons${qs}`);
  },
  getLessonById: async (id: string) => {
    return fetchWithAuth(`/api/lessons/${id}`);
  },
  saveLesson: async (lesson: any) => {
    return fetchWithAuth('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },
  updateLesson: async (id: string, updates: any) => {
    return fetchWithAuth(`/api/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteLesson: async (id: string) => {
    return fetchWithAuth(`/api/lessons/${id}`, {
      method: 'DELETE',
    });
  },

  // 5. Results
  saveLearningResult: async (result: any) => {
    return fetchWithAuth('/api/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  },
  getMyResults: async () => {
    return fetchWithAuth('/api/results/my');
  },
  getLessonResults: async (lessonId: string) => {
    return fetchWithAuth(`/api/results/lesson/${lessonId}`);
  },

  // System status
  getSystemStatus: async () => {
    const res = await fetch('/api/system/status');
    return res.json();
  },
};
