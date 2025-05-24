import { z } from 'zod';

export const simpleSearchRequestSchema = z.object({
  query: z.string().trim().min(1, 'クエリは必須です'),
  contextLength: z.number().int().positive().optional(),
});

export type SimpleSearchRequestInput = z.infer<typeof simpleSearchRequestSchema>;