import type { CommandInfo } from './types.js';

/**
 * コマンド一覧を読みやすい形式にフォーマットする
 */
export function formatCommands(commands: CommandInfo[]): string {
  if (commands.length === 0) {
    return '利用可能なコマンドが見つかりませんでした。';
  }

  const lines: string[] = [
    `📋 利用可能なコマンド一覧 (${commands.length}個のコマンドが見つかりました)`,
    '━'.repeat(60),
    ''
  ];

  // IDの最大長を計算（表示の整列用）
  const maxIdLength = Math.max(...commands.map(cmd => cmd.id.length));

  // コマンドを表示
  for (const command of commands) {
    const paddedId = command.id.padEnd(maxIdLength + 2);
    lines.push(`${paddedId}${command.name}`);
  }

  lines.push('');
  lines.push('💡 ヒント: execute_command ツールを使用してこれらのコマンドを実行できます。');

  return lines.join('\n');
}