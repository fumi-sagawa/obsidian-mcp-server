#!/usr/bin/env node

/**
 * MCPツールの標準入出力テストスクリプト
 * 
 * 使用方法:
 *   npm run test:tools              # 全ツールのテスト
 *   npm run test:tools get-alerts   # 特定ツールのテスト
 *   npm run test:tools -- --verbose # 詳細モード
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', 'build', 'index.js');

// テストケース定義
const testCases = {
  'get-alerts': [
    {
      name: '正常な州コードで警報を取得',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-alerts',
          arguments: { state: 'CA' }
        }
      },
      assertions: [
        // 期待される結果: 成功レスポンス
        response => response.result !== undefined,
        // 期待される結果: textタイプのコンテンツ
        response => response.result.content[0].type === 'text',
        // 期待される結果: CA州の警報情報を含む
        response => response.result.content[0].text.includes('Active alerts for CA')
      ]
    },
    {
      name: '無効な州コードでエラー',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-alerts',
          arguments: { state: 'XX' }
        }
      },
      assertions: [
        // 期待される結果: エラーメッセージを含む
        response => response.result.content[0].text.includes('Invalid state code')
      ]
    }
  ],
  
  'get-forecast': [
    {
      name: 'サンフランシスコの予報を取得',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-forecast',
          arguments: { latitude: 37.7749, longitude: -122.4194 }
        }
      },
      assertions: [
        // 期待される結果: 成功レスポンス
        response => response.result !== undefined,
        // 期待される結果: 予報データを含む
        response => response.result.content[0].text.includes('Forecast for')
      ]
    },
    {
      name: '必須パラメータ欠落でエラー',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-forecast',
          arguments: {}
        }
      },
      assertions: [
        // 期待される結果: エラーレスポンス
        response => response.error !== undefined,
        // 期待される結果: パラメータエラー
        response => response.error.code === -32602
      ]
    }
  ],
  
  'health-check': [
    {
      name: 'ヘルスチェックを実行',
      request: {
        method: 'tools/call',
        params: {
          name: 'health-check',
          arguments: {}
        }
      },
      assertions: [
        // 期待される結果: 成功レスポンス
        response => response.result !== undefined,
        // 期待される結果: ヘルスチェックレポートを含む
        response => response.result.content[0].text.includes('Health Check Report'),
        // 期待される結果: ステータス情報を含む
        response => response.result.content[0].text.includes('Overall Status')
      ]
    }
  ],
  
  'get-server-status': [
    {
      name: 'Obsidianサーバーステータスを取得',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-server-status',
          arguments: {}
        }
      },
      assertions: [
        // 期待される結果: 成功レスポンス
        response => response.result !== undefined,
        // 期待される結果: Obsidian Server Statusを含む
        response => response.result.content[0].text.includes('Obsidian Server Status'),
        // 期待される結果: バージョン情報を含む
        response => response.result.content[0].text.includes('Obsidian Version')
      ]
    }
  ]
};

// テスト実行関数
async function runTest(testCase) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      try {
        const lines = output.split('\n').filter(line => line.trim());
        const jsonLine = lines.find(line => line.startsWith('{') && line.includes('jsonrpc'));
        
        if (!jsonLine) {
          reject(new Error('No JSON response found'));
          return;
        }
        
        const response = JSON.parse(jsonLine);
        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
    
    // リクエストを送信
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      ...testCase.request
    };
    
    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
  });
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);
  const targetTool = args.find(arg => !arg.startsWith('--'));
  const verbose = args.includes('--verbose');
  
  console.log('=== Weather MCP Server ツールテスト ===\n');
  
  // テスト対象のツールを決定
  const toolsToTest = targetTool 
    ? { [targetTool]: testCases[targetTool] }
    : testCases;
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [toolName, cases] of Object.entries(toolsToTest)) {
    console.log(`\n## ${toolName} のテスト`);
    
    for (const testCase of cases) {
      totalTests++;
      console.log(`\n### ${testCase.name}`);
      
      try {
        const response = await runTest(testCase);
        
        if (verbose) {
          console.log('レスポンス:', JSON.stringify(response, null, 2));
        }
        
        // アサーションを実行
        let allPassed = true;
        for (let i = 0; i < testCase.assertions.length; i++) {
          const assertion = testCase.assertions[i];
          const passed = assertion(response);
          
          if (!passed) {
            allPassed = false;
            console.log(`❌ アサーション ${i + 1} 失敗`);
          } else if (verbose) {
            console.log(`✅ アサーション ${i + 1} 成功`);
          }
        }
        
        if (allPassed) {
          passedTests++;
          console.log('✅ テスト成功');
        } else {
          console.log('❌ テスト失敗');
        }
        
      } catch (error) {
        console.log('❌ エラー:', error.message);
      }
    }
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