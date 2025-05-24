import { z } from 'zod';

export const insertIntoActiveFileSchema = z.object({
  operation: z.enum(['append', 'prepend', 'replace']),
  targetType: z.enum(['heading', 'block', 'frontmatter']),
  target: z.string().min(1, 'Target must not be empty'),
  content: z.string(),
  targetDelimiter: z.string().optional(),
  trimTargetWhitespace: z.boolean().optional(),
  createTargetIfMissing: z.boolean().optional(),
  contentType: z.enum(['text/markdown', 'application/json']).optional()
});