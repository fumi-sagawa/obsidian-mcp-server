/**
 * delete-file ツール
 * Obsidianの指定したファイルを削除する
 */

export { deleteFileHandler } from './delete-file-handler.js';
export { deleteFileSchema } from './schema.js';
export type {
  DeleteFileRequest,
  DeleteFileResponse,
  ErrorResponse,
} from './types.js';