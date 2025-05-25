import type { VaultItem } from './types.js';

/**
 * Vaultファイル一覧を整形して表示用の文字列を生成
 * @param items Vaultアイテムの配列
 * @returns フォーマットされた文字列
 */
export function formatFileList(items: VaultItem[]): string {
  const lines: string[] = [];
  
  lines.push('📁 Vault Files');
  lines.push('=============');
  lines.push('');

  if (items.length === 0) {
    lines.push('🔍 Vault is empty.');
    return lines.join('\n');
  }

  // ディレクトリとファイルを分類
  const directories = items.filter(item => item.type === 'directory');
  const files = items.filter(item => item.type === 'file');

  // ディレクトリを先に表示（アルファベット順）
  if (directories.length > 0) {
    lines.push('📂 Directories:');
    directories
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(dir => {
        lines.push(`  📁 ${dir.name}`);
      });
    lines.push('');
  }

  // ファイルを表示（アルファベット順）
  if (files.length > 0) {
    lines.push('📄 Files:');
    files
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(file => {
        lines.push(`  📄 ${file.name}`);
      });
    lines.push('');
  }

  // 統計情報
  lines.push('─────────────');
  lines.push(`📊 Total: ${directories.length} directories, ${files.length} files`);

  return lines.join('\n');
}