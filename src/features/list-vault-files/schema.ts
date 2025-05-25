import { z } from 'zod';

/**
 * list_vault_files ツールのパラメータスキーマ
 * このツールはパラメータを取らない
 */
export const listVaultFilesParamsSchema = z.object({}).describe('Vault root directory file listing parameters');

/**
 * MCPツール定義
 */
export const listVaultFilesTool = {
  name: 'list_vault_files',
  description: 'List all files and directories in the vault root directory',
  inputSchema: listVaultFilesParamsSchema
};