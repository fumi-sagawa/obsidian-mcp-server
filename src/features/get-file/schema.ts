import { z } from 'zod';

export const GetFileRequestSchema = z.object({
  filename: z.string().min(1, 'ファイル名は必須です'),
});

export const FileMetadataSchema = z.object({
  ctime: z.number(),
  mtime: z.number(),
  size: z.number(),
});

export const FileContentSchema = z.object({
  content: z.string(),
  path: z.string(),
  frontmatter: z.record(z.unknown()),
  tags: z.array(z.string()),
  stat: FileMetadataSchema,
});

export const GetFileResponseSchema = z.object({
  content: z.string(),
  metadata: FileMetadataSchema.optional(),
});

export const GetFileJsonResponseSchema = FileContentSchema;