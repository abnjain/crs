/**
 * ============================================================
 * User routes — request bodies (Zod)
 * ============================================================
 */

import { z } from 'zod';

export const patchUserActiveBodySchema = z.object({
  isActive: z.boolean(),
});
