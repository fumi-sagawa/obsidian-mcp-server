#!/usr/bin/env node

/**
 * MCPツールのモックテストスクリプト（新構造）
 * 
 * 外部APIをモック化して、安定したテスト結果を保証します
 * 
 * 使用方法:
 *   npm run test:tools:mock              # 全ツールのモックテスト
 *   npm run test:tools:mock get-alerts   # 特定ツールのモックテスト
 */

import { runTestSuite } from './tools/shared/test-runner.js';
import { MockApiServer } from './tools/shared/mock-server.js';

// 各ツールのモックテストケースをインポート
// import { testCases as getAlertsTests } from './tools/get-alerts/mock.js';
// import { testCases as getForecastTests } from './tools/get-forecast/mock.js';
import { testCases as healthCheckTests } from './tools/health-check/mock.js';
import { testCases as getServerStatusTests } from './tools/get-server-status/mock.js';
import { testCases as updateActiveFileTests } from './tools/obsidian/update-active-file/mock.js';
import { testCases as appendToActiveFileTests } from './tools/obsidian/append-to-active-file/mock.js';
import { testCases as insertIntoActiveFileTests } from './tools/obsidian/insert-into-active-file/mock.js';
import { testCases as insertIntoFileTests } from './tools/insert-into-file/mock.js';
import { testCases as deleteActiveFileTests } from './tools/obsidian/delete-active-file/mock.js';
import { testCases as deletePeriodicNoteTests } from './tools/delete-periodic-note/mock.js';
import { testCases as listCommandsTests } from './tools/list-commands/mock.js';
import { testCases as executeCommandTests } from './tools/execute-command/mock.js';
import { testCases as openFileTests } from './tools/open-file/mock.js';
import { testCases as getPeriodicNoteMockTests } from './tools/get-periodic-note/mock.js';
import { testCases as appendToPeriodicNoteTests } from './tools/append-to-periodic-note/mock.js';
import { testCases as updatePeriodicNoteMockTests } from './tools/update-periodic-note/mock.js';
import { testCases as simpleSearchTests } from './tools/simple-search/mock.js';
import { testCases as searchNotesTests } from './tools/search-notes/mock.js';
import { testCases as appendToFileTests } from './tools/append-to-file/mock.js';
import { testCases as createOrUpdateFileTests } from './tools/create-or-update-file/mock.js';
import { testCases as deleteFileTests } from './tools/delete-file/mock.js';
import { testCases as listDirectoryTests } from './tools/list-directory/mock.js';
import { testCases as listVaultFilesTests } from './tools/list-vault-files/mock.js';
import { testCases as getFileTests } from './tools/get-file/mock.js';
import { testCases as getActiveFileTests } from './tools/obsidian/get-active-file/mock.js';

// テストスイート定義
const testSuites = {
  // 削除されたツール
  // 'get-alerts': getAlertsTests,
  // 'get-forecast': getForecastTests,
  
  'check_service_health': healthCheckTests,
  'get_server_status': getServerStatusTests,
  'update_active_file': updateActiveFileTests,
  'append_to_active_file': appendToActiveFileTests,
  'insert_to_active_file': insertIntoActiveFileTests,
  'insert_to_file': insertIntoFileTests,
  'delete_active_file': deleteActiveFileTests,
  'delete_periodic_note': deletePeriodicNoteTests,
  'list_commands': listCommandsTests,
  'execute_command': executeCommandTests,
  'open_file': openFileTests,
  'get_periodic_note': getPeriodicNoteMockTests,
  'append_to_periodic_note': appendToPeriodicNoteTests,
  'update_periodic_note': updatePeriodicNoteMockTests,
  'search_notes': searchNotesTests,
  'simple_search': simpleSearchTests,
  'append_to_file': appendToFileTests,
  'create_or_update_file': createOrUpdateFileTests,
  'delete_file': deleteFileTests,
  'list_directory': listDirectoryTests,
  'list_vault_files': listVaultFilesTests,
  'get_file_content': getFileTests,
  'get_active_file': getActiveFileTests
};

// メイン実行
async function main() {
  const args = process.argv.slice(2);
  const targetTool = args.find(arg => !arg.startsWith('--'));
  
  console.log('=== MCP Server モックテスト ===\n');
  
  // モックサーバーを起動
  const mockServer = new MockApiServer();
  await mockServer.start();
  
  try {
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
      
      const result = await runTestSuite(toolName, testCases, { 
        mockBaseUrl: mockServer.getBaseUrl()
      });
      totalTests += result.total;
      passedTests += result.passed;
    }
    
    // サマリー
    console.log(`\n=== テスト結果 ===`);
    console.log(`合計: ${totalTests} テスト`);
    console.log(`成功: ${passedTests} テスト`);
    console.log(`失敗: ${totalTests - passedTests} テスト`);
    
    process.exit(totalTests === passedTests ? 0 : 1);
    
  } finally {
    // モックサーバーを停止
    mockServer.stop();
  }
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
  console.error('エラー:', error);
  process.exit(1);
});

main();