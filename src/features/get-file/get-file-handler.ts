import { logger } from '../../shared/lib/logger/index.js';
import { obsidianApi } from '../../shared/api/obsidian/index.js';
import { ValidationError } from '../../shared/lib/errors/index.js';
import { GetFileRequestSchema } from './schema.js';

const handlerLogger = logger.child({ component: 'get-file-handler' });

export async function getFileHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  handlerLogger.debug('ファイル取得リクエストを処理中', { args });

  // 入力値の検証
  const validationResult = GetFileRequestSchema.safeParse(args);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    
    handlerLogger.error('入力値の検証に失敗');
    
    throw new ValidationError(
      `入力値が無効です: ${errorMessage}`
    );
  }

  const { filename } = validationResult.data;

  try {
    handlerLogger.debug('Obsidian APIからファイルを取得中', { filename });
    
    // Obsidian APIからファイル内容を取得
    const fileData = await obsidianApi.getFile(filename);
    
    handlerLogger.info('ファイルを正常に取得', { 
      filename,
      contentLength: fileData.content.length
    });

    const content = JSON.stringify({
      content: fileData.content,
      path: filename,
      frontmatter: {},
      tags: [],
      stat: {
        ctime: Date.now(),
        mtime: Date.now(),
        size: fileData.content.length
      }
    }, null, 2);

    return {
      content: [
        {
          type: "text" as const,
          text: content
        }
      ]
    };
  } catch (error) {
    handlerLogger.error('ファイル取得に失敗');
    throw error;
  }
}