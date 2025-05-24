import { z } from 'zod';

/**
 * execute_command ツールの入力スキーマ
 */
export const executeCommandArgsSchema = z.object({
  commandId: z.string().min(1, 'Command ID is required')
}).strict();

export type ExecuteCommandArgs = z.infer<typeof executeCommandArgsSchema>;