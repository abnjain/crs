/**
 * Auth API service - login, register, getMe
 */

import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'faculty' | 'alumni';
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  csrfToken?: string;
  user: AuthResponse['user'];
}

export interface AuthResponse {
  success: boolean;
  /** Issued only when the account is approved or legacy flows */
  token?: string;
  pendingApproval?: boolean;
  message?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    isVerified?: boolean;
    isActive?: boolean;
  };
}

export interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    roles?: string[];
    isVerified?: boolean;
    isActive?: boolean;
  };
  emailPending?: boolean;
  pendingEmail?: string;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface DeleteMePayload {
  password: string;
  confirm: 'DELETE';
  deleteDocuments?: boolean;
}

export interface DeleteMeResponse {
  success: boolean;
  scheduledFor: string;
  deleteDocuments?: boolean;
}

export interface RequestEmailVerificationPayload {
  email: string;
}

export interface RequestEmailVerificationResponse {
  success: boolean;
  pendingEmail: string;
  expiresAt?: string;
}

export interface VerifyEmailPayload {
  code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  user: MeResponse['user'];
}

export interface CsrfResponse {
  success: boolean;
  csrfToken: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/v1/auth/login', payload);
    return data;
  },

  csrf: async (): Promise<CsrfResponse> => {
    const { data } = await api.get<CsrfResponse>('/v1/auth/csrf');
    return data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const { data } = await api.post<{ success: boolean }>('/v1/auth/logout');
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/v1/auth/register', payload);
    return data;
  },

  getMe: async (): Promise<MeResponse> => {
    const { data } = await api.get<MeResponse>('/v1/auth/me');
    return data;
  },

  updateMe: async (payload: UpdateMePayload): Promise<MeResponse> => {
    const { data } = await api.patch<MeResponse>('/v1/auth/me', payload);
    return data;
  },

  requestEmailVerification: async (
    payload: RequestEmailVerificationPayload
  ): Promise<RequestEmailVerificationResponse> => {
    const { data } = await api.post<RequestEmailVerificationResponse>('/v1/auth/verify-email/request', payload);
    return data;
  },

  verifyEmailOtp: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    const { data } = await api.post<VerifyEmailResponse>('/v1/auth/verify-email', payload);
    return data;
  },

  deleteMe: async (payload: DeleteMePayload): Promise<DeleteMeResponse> => {
    const { data } = await api.delete<DeleteMeResponse>('/v1/auth/me', {
      data: payload,
    });
    return data;
  },
};
