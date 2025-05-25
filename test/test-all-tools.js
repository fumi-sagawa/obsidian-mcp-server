#!/usr/bin/env node

/**
 * MCPツールの統合テストスクリプト（新構造）
 * 
 * 使用方法:
 *   npm run test:tools              # 全ツールのテスト
 *   npm run test:tools get-alerts   # 特定ツールのテスト
 *   npm run test:tools -- --verbose # 詳細モード
 */

import { runTestSuite } from './tools/shared/test-runner.js';

// 各ツールのテストケースをインポート
// import { testCases as getAlertsTests } from './tools/get-alerts/integration.js';
// import { testCases as getForecastTests } from './tools/get-forecast/integration.js';
import { testCases as healthCheckTests } from './tools/health-check/integration.js';
import { testCases as getServerStatusTests } from './tools/get-server-status/integration.js';
import { testCases as updateActiveFileTests } from './tools/obsidian/update-active-file/integration.js';
import { testCases as appendToActiveFileTests } from './tools/obsidian/append-to-active-file/integration.js';
import { testCases as insertIntoFileTests } from './tools/insert-into-file/integration.js';
import { testCases as deleteActiveFileTests } from './tools/obsidian/delete-active-file/integration.js';
import { testCases as deletePeriodicNoteTests } from './tools/delete-periodic-note/integration.js';
import { testCases as listCommandsTests } from './tools/list-commands/integration.js';
import { testCases as openFileTests } from './tools/open-file/integration.js';
import { testCases as getPeriodicNoteTests } from './tools/get-periodic-note/integration.js';
import { testCases as appendToPeriodicNoteTests } from './tools/append-to-periodic-note/integration.js';
import { testCases as updatePeriodicNoteTests } from './tools/update-periodic-note/integration.js';
import { testCases as simpleSearchTests } from './tools/simple-search/integration.js';
import { testCases as appendToFileTests } from './tools/append-to-file/integration.js';
import { testCases as createOrUpdateFileTests } from './tools/create-or-update-file/integration.js';
import { testCases as deleteFileTests } from './tools/delete-file/integration.js';
import { testCases as getFileTests } from './tools/get-file/integration.js';
import { testCases as executeCommandTests } from './tools/execute-command/integration.js';
import { testCases as listDirectoryTests } from './tools/list-directory/integration.js';
import { testCases as searchNotesTests } from './tools/search-notes/integration.js';
import { testCases as getActiveFileTests } from './tools/obsidian/get-active-file/integration.js';

// テストケース定義
const testSuites = {
  // 削除されたツール
  // 'get-alerts': getAlertsTests,
  // 'get-forecast': getForecastTests,
  
  'check_service_health': healthCheckTests,
  'get_server_status': getServerStatusTests,
  'update_active_file': updateActiveFileTests,
  'append_to_active_file': appendToActiveFileTests,
  'insert_to_file': insertIntoFileTests,
  'delete_active_file': deleteActiveFileTests,
  'delete_periodic_note': deletePeriodicNoteTests,
  'list_commands': listCommandsTests,
  'open_file': openFileTests,
  'get_periodic_note': getPeriodicNoteTests,
  'append_to_periodic_note': appendToPeriodicNoteTests,
  'update_periodic_note': updatePeriodicNoteTests,
  'search_notes': simpleSearchTests,
  'append_to_file': appendToFileTests,
  'create_or_update_file': createOrUpdateFileTests,
  'delete_file': deleteFileTests,
  'get_file': getFileTests,
  'execute_command': executeCommandTests,
  'list_directory': listDirectoryTests,
  'search_notes_json': searchNotesTests,
  'get_active_file': getActiveFileTests
};

// メイン実行
async function main() {
  const args = process.argv.slice(2);
  const targetTool = args.find(arg => !arg.startsWith('--'));
  const verbose = args.includes('--verbose');
  
  console.log('=== MCP Server 統合テスト ===\n');
  
  // テスト対象のツールを決定
  const suitesToTest = targetTool 
    ? { [targetTool]: testSuites[targetTool] }
    : testSuites;
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [toolName, testCases] of Object.entries(suitesToTest)) {
    if (!testCases) {
      console.log(`⚠️ ${toolName} のテストケースが見つかりません`);
      continue;
    }
    
    const result = await runTestSuite(toolName, testCases, { verbose });
    totalTests += result.total;
    passedTests += result.passed;
  }
  
  // サマリー
  console.log(`\n=== テスト結果 ===`);
  console.log(`合計: ${totalTests} テスト`);
  console.log(`成功: ${passedTests} テスト`);
  console.log(`失敗: ${totalTests - passedTests} テスト`);
  
  process.exit(totalTests === passedTests ? 0 : 1);
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('エラー:', error);
  process.exit(1);
});

main();