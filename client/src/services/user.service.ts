import { api } from './api';

export interface UserRecord {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  isActive: boolean;
  deletionScheduledFor?: string | null;
  createdAt: string;
  updatedAt: string;
  messagingBanned?: boolean;
  /** Present for users linked to an alumni profile (listing filters). */
  alumniDepartment?: string;
  alumniGraduationYear?: number;
  alumniProfileVerified?: boolean;
}

interface UsersResponse {
  success: boolean;
  count: number;
  users: UserRecord[];
}

interface UserResponse {
  success: boolean;
  user: UserRecord;
}

export const userService = {
  async getAll(): Promise<UserRecord[]> {
    const { data } = await api.get<UsersResponse>('/v1/users');
    return data.users;
  },

  async getById(id: string): Promise<UserRecord> {
    const { data } = await api.get<UserResponse>(`/v1/users/${id}`);
    return data.user;
  },

  async reviewQueueDecision(userId: string, decision: 'approve' | 'reject'): Promise<void> {
    await api.patch(`/v1/users/${encodeURIComponent(userId)}/review-queue`, { decision });
  },

  async cancelDeletion(userId: string): Promise<void> {
    await api.patch(`/v1/users/${encodeURIComponent(userId)}/cancel-deletion`);
  },
};
