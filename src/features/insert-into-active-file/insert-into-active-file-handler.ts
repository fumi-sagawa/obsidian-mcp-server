import { ObsidianAPIClient } from '../../shared/api/obsidian/index.js';
import type { InsertIntoActiveFileParams, PatchActiveFileHeaders } from './types.js';
import { logger } from '../../shared/lib/logger/index.js';
import { insertIntoActiveFileSchema } from './schema.js';

const featureLogger = logger.child({ feature: 'insert-into-active-file' });

export async function insertIntoActiveFileHandler(
  params: InsertIntoActiveFileParams
): Promise<any> {
  // パラメータのバリデーション
  const validatedParams = insertIntoActiveFileSchema.parse(params);
  const {
    operation,
    targetType,
    target,
    content,
    targetDelimiter = '::',
    trimTargetWhitespace = false,
    createTargetIfMissing = false,
    contentType = 'text/markdown'
  } = validatedParams;

  // ターゲットが非ASCII文字を含む場合はURLエンコード
  const encodedTarget = /[^\x00-\x7F]/.test(target) || /[&<>]/.test(target)
    ? encodeURIComponent(target)
    : target;

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
    await client.patchActiveFile(headers, content);
    
    featureLogger.info('Active file patched successfully', { 
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
          text: `Content successfully ${actionText} ${targetTypeText}: ${target}`
        }
      ]
    };
  } catch (error) {
    featureLogger.error('Failed to patch active file', { 
      operation,
      targetType,
      target,
      errorMessage: error instanceof Error ? error.message : String(error)
    } as any);
    throw error;
  }
}