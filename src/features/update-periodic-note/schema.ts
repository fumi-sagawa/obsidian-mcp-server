import { z } from 'zod';

export const updatePeriodicNoteSchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  content: z.string()
});