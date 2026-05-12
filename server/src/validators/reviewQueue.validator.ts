/**
 * ============================================================
 * Review queue — approve / reject pending registrations (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const reviewQueueDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
});
