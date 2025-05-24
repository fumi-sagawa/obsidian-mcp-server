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
import { testCases as getAlertsTests } from './tools/get-alerts/mock.js';
import { testCases as getForecastTests } from './tools/get-forecast/mock.js';
import { testCases as healthCheckTests } from './tools/health-check/mock.js';
import { testCases as getServerStatusTests } from './tools/get-server-status/mock.js';
import { testCases as updateActiveFileTests } from './tools/obsidian/update-active-file/mock.js';
import { testCases as appendToActiveFileTests } from './tools/obsidian/append-to-active-file/mock.js';
import { testCases as insertIntoActiveFileTests } from './tools/obsidian/insert-into-active-file/mock.js';
import { testCases as deleteActiveFileTests } from './tools/obsidian/delete-active-file/mock.js';
import { testCases as listCommandsTests } from './tools/list-commands/mock.js';
import { testCases as executeCommandTests } from './tools/execute-command/mock.js';
import { testCases as openFileTests } from './tools/open-file/mock.js';
import { testCases as getPeriodicNoteMockTests } from './tools/get-periodic-note/mock.js';

// テストスイート定義
const testSuites = {
  'get-alerts': getAlertsTests,
  'get-forecast': getForecastTests,
  'health-check': healthCheckTests,
  'get-server-status': getServerStatusTests,
  'update_active_file': updateActiveFileTests,
  'append-to-active-file': appendToActiveFileTests,
  'insert-into-active-file': insertIntoActiveFileTests,
  'delete-active-file': deleteActiveFileTests,
  'list-commands': listCommandsTests,
  'execute-command': executeCommandTests,
  'open-file': openFileTests,
  'get-periodic-note': getPeriodicNoteMockTests
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