#!/usr/bin/env node

/**
 * MCPツールのモックを使用した統合テストスクリプト
 * 
 * 外部APIをモック化して、安定したテスト結果を保証します
 * 
 * 使用方法:
 *   npm run test:tools:mock              # 全ツールのモックテスト
 *   npm run test:tools:mock get-alerts   # 特定ツールのモックテスト
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', 'build', 'index.js');

// モックAPIサーバーの作成
class MockNWSApiServer {
  constructor() {
    this.server = null;
    this.port = 0;
  }

  async start() {
    return new Promise((resolve) => {
      this.server = createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        
        // URLパスに基づいてモックレスポンスを返す
        if (req.url.includes('/alerts?area=CA')) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            features: [
              {
                properties: {
                  event: 'Test Alert',
                  headline: 'Test Alert for CA',
                  severity: 'Moderate',
                  urgency: 'Expected',
                  status: 'Actual',
                  description: 'This is a test alert',
                  areaDesc: 'Test Area, CA',
                  effective: '2025-01-23T10:00:00Z',
                  expires: '2025-01-24T10:00:00Z'
                }
              }
            ]
          }));
        } else if (req.url.includes('/alerts?area=XX')) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        } else if (req.url.includes('/alerts?area=HI')) {
          res.statusCode = 200;
          res.end(JSON.stringify({ features: [] }));
        } else if (req.url.includes('/points/37.7749,-122.4194')) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            properties: {
              forecast: `http://localhost:${this.port}/gridpoints/MTR/85,105/forecast`
            }
          }));
        } else if (req.url.includes('/gridpoints/MTR/85,105/forecast')) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            properties: {
              periods: [
                {
                  name: 'Today',
                  temperature: 65,
                  temperatureUnit: 'F',
                  windSpeed: '10 mph',
                  windDirection: 'W',
                  shortForecast: 'Sunny'
                },
                {
                  name: 'Tonight',
                  temperature: 50,
                  temperatureUnit: 'F',
                  windSpeed: '5 mph',
                  windDirection: 'W',
                  shortForecast: 'Clear'
                }
              ]
            }
          }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      });

      this.server.listen(0, () => {
        this.port = this.server.address().port;
        console.log(`モックAPIサーバーが起動しました: http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }

  getBaseUrl() {
    return `http://localhost:${this.port}`;
  }
}

// テストケース定義（決定的な結果を返す）
const testCases = {
  'get-alerts': [
    {
      name: '正常な州コードで固定の警報を取得',
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
        // 期待される結果: テスト用の固定警報を含む
        response => response.result.content[0].text.includes('Test Alert for CA'),
        // 期待される結果: 正確なエリア情報
        response => response.result.content[0].text.includes('Test Area, CA')
      ]
    },
    {
      name: '警報がない州で空の結果',
      request: {
        method: 'tools/call',
        params: {
          name: 'get-alerts',
          arguments: { state: 'HI' }
        }
      },
      assertions: [
        // 期待される結果: 警報なしメッセージ
        response => response.result.content[0].text === 'No active alerts for HI'
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
        // 期待される結果: バリデーションエラー
        response => response.result.content[0].text.includes('Invalid state code: XX')
      ]
    }
  ],
  
  'get-forecast': [
    {
      name: 'サンフランシスコの固定予報を取得',
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
        // 期待される結果: 固定の予報データ
        response => response.result.content[0].text.includes('Today'),
        response => response.result.content[0].text.includes('65°F'),
        response => response.result.content[0].text.includes('Sunny')
      ]
    }
  ]
};

// テスト実行関数（環境変数でモックURLを指定）
async function runTest(testCase, mockBaseUrl) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      NWS_API_BASE_URL: mockBaseUrl,
      LOG_LEVEL: 'error' // テスト中はエラーログのみ
    };

    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env
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
  
  console.log('=== Weather MCP Server モックテスト ===\n');
  
  // モックサーバーを起動
  const mockServer = new MockNWSApiServer();
  await mockServer.start();
  
  try {
    // テスト対象のツールを決定
    const toolsToTest = targetTool 
      ? { [targetTool]: testCases[targetTool] }
      : testCases;
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const [toolName, cases] of Object.entries(toolsToTest)) {
      console.log(`\n## ${toolName} のモックテスト`);
      
      for (const testCase of cases) {
        totalTests++;
        console.log(`\n### ${testCase.name}`);
        
        try {
          const response = await runTest(testCase, mockServer.getBaseUrl());
          
          // アサーションを実行
          let allPassed = true;
          for (let i = 0; i < testCase.assertions.length; i++) {
            const assertion = testCase.assertions[i];
            const passed = assertion(response);
            
            if (!passed) {
              allPassed = false;
              console.log(`❌ アサーション ${i + 1} 失敗`);
            }
          }
          
          if (allPassed) {
            passedTests++;
            console.log('✅ テスト成功');
          } else {
            console.log('❌ テスト失敗');
            console.log('レスポンス:', JSON.stringify(response, null, 2));
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