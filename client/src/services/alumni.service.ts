import axios from 'axios';
import { api } from './api';

export interface AlumniRecord {
  id: string;
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    roles: string[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  graduationYear: number;
  batch: string;
  department: string;
  company: string;
  designation: string;
  location: string;
  address?: string;
  linkedIn: string;
  phone: string;
  bio: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlumniListResponse {
  success: boolean;
  count: number;
  alumni: AlumniRecord[];
}

interface AlumniSingleResponse {
  success: boolean;
  alumni: AlumniRecord;
}

export const alumniService = {
  async getAll(): Promise<AlumniRecord[]> {
    const { data } = await api.get<AlumniListResponse>('/v1/alumni');
    return data.alumni;
  },

  async getById(id: string): Promise<AlumniRecord> {
    const { data } = await api.get<AlumniSingleResponse>(`/v1/alumni/${id}`);
    return data.alumni;
  },

  /** Null when no alumni profile exists for this user. */
  async getByUserId(userId: string): Promise<AlumniRecord | null> {
    const enc = encodeURIComponent(userId);
    try {
      const { data } = await api.get<AlumniSingleResponse>(`/v1/alumni/by-user/${enc}`);
      return data.alumni;
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },

  async create(body: Record<string, unknown>): Promise<AlumniRecord> {
    const { data } = await api.post<AlumniSingleResponse>('/v1/alumni', body);
    return data.alumni;
  },

  async update(id: string, body: Record<string, unknown>): Promise<AlumniRecord> {
    const { data } = await api.patch<AlumniSingleResponse>(`/v1/alumni/${id}`, body);
    return data.alumni;
  },

  async upsertMe(body: Record<string, unknown>): Promise<AlumniRecord> {
    const { data } = await api.patch<AlumniSingleResponse>('/v1/alumni/me', body);
    return data.alumni;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/v1/alumni/${id}`);
  },

  async reviewQueueDecision(id: string, decision: 'approve' | 'reject'): Promise<void> {
    await api.patch(`/v1/alumni/${encodeURIComponent(id)}/review-queue`, { decision });
  },
};
