/**
 * ============================================================
 * Reports API client
 * ============================================================
 */

import { api } from './api';

export interface CountRow {
  role?: string;
  department?: string;
  year?: string;
  type?: string;
  status?: string;
  label?: string;
  count: number;
}

export interface DashboardDayCount {
  isoDate: string;
  label: string;
  count: number;
}

export interface DashboardKpis {
  usersCreatedThisMonth: number;
  usersCreatedPrevMonth: number;
  alumniProfilesCreatedThisMonth: number;
  alumniProfilesCreatedPrevMonth: number;
  eventsCreatedRollingWeek: number;
  auditEntriesLast24h: number;
  auditEntriesPrev24h: number;
  auditEntriesDeltaPercent: number;
}

export interface ReviewQueueItemAlumni {
  kind: 'unverified_alumni';
  alumniId: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface ReviewQueueItemNewUser {
  kind: 'new_user';
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export type ReviewQueueItem = ReviewQueueItemAlumni | ReviewQueueItemNewUser;

export interface SummaryReportResponse {
  success: boolean;
  totals: {
    users: number;
    alumni: number;
    events: number;
  };
  dashboard?: {
    usersRegisteredLast7Days: DashboardDayCount[];
    reviewQueue?: ReviewQueueItem[];
    kpis: DashboardKpis;
  };
  usersByRole: { role: string; count: number }[];
  alumniByDepartment: { department: string; count: number }[];
  alumniByGraduationYear: { year: string; count: number }[];
  alumniVerification: { label: string; count: number }[];
  eventsByType: { type: string; count: number }[];
  eventsByStatus: { status: string; count: number }[];
}

export const reportsService = {
  async getSummary(): Promise<SummaryReportResponse> {
    const { data } = await api.get<SummaryReportResponse>('/v1/reports/summary');
    return data;
  },
};
