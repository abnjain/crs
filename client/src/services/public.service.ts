/**
 * ============================================================
 * Public API client (no auth required)
 * ============================================================
 */

import { api } from './api';

export interface LandingStatsResponse {
  success: boolean;
  stats: {
    registeredAlumni: number;
    facultyMembers: number;
    libraryVolumes: number;
    yearsExcellence: number;
  };
}

export const publicService = {
  async getLandingStats(): Promise<LandingStatsResponse['stats']> {
    const { data } = await api.get<LandingStatsResponse>('/v1/public/landing-stats');
    return data.stats;
  },
};
