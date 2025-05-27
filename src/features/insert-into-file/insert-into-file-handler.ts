import { ObsidianAPIClient } from '../../shared/api/obsidian/index.js';
import type { InsertIntoFileParams } from './types.js';
import { logger } from '../../shared/lib/logger/index.js';
import { insertIntoFileSchema } from './schema.js';

const featureLogger = logger.child({ feature: 'insert-into-file' });

export async function insertIntoFileHandler(
  params: InsertIntoFileParams
): Promise<any> {
  // パラメータのバリデーション
  const validatedParams = insertIntoFileSchema.parse(params);
  const {
    filename,
    operation,
    targetType,
    target,
    content,
    targetDelimiter = '::',
    trimTargetWhitespace = false,
    createTargetIfMissing = false,
    contentType = 'text/markdown'
  } = validatedParams;

  // ファイル名の検証
  if (!filename || filename.trim() === '') {
    throw new Error('Filename cannot be empty');
  }

  // ターゲットは常にURLエンコード（OpenAPI仕様に従う）
  const encodedTarget = encodeURIComponent(target);

  // HTTPヘッダーを構築
  const headers: Record<string, string> = {
    'Operation': operation,
    'Target-Type': targetType,
    'Target': encodedTarget,
    'Target-Delimiter': targetDelimiter,
    'Trim-Target-Whitespace': trimTargetWhitespace ? 'true' : 'false',
    'Content-Type': contentType
  };

  // オプションのヘッダー
  if (createTargetIfMissing) {
    headers['Create-Target-If-Missing'] = 'true';
  }

  const client = new ObsidianAPIClient();
  
  try {
    await client.patchFile(filename, headers, content);
    
    featureLogger.info('File patched successfully', { 
      filename,
      operation,
      targetType,
      target,
      contentLength: content.length
    });
    
    // 成功メッセージを生成
    const actionText = operation === 'append' ? 'appended to'
                    : operation === 'prepend' ? 'prepended to'
                    : 'replaced in';
    
    const targetTypeText = targetType === 'heading' ? 'heading'
                        : targetType === 'block' ? 'block'
                        : 'frontmatter';
    
    return {
      content: [
        {
          type: 'text',
          text: `Content successfully ${actionText} ${targetTypeText}: ${target} in file: ${filename}`
        }
      ]
    };
  } catch (error) {
    featureLogger.error('Failed to patch file', { 
      filename,
      operation,
      targetType,
      target,
      errorMessage: error instanceof Error ? error.message : String(error)
    } as any);
    throw error;
  }
}