import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '..', '..', '..', 'build', 'index.js');

/**
 * MCPツールのテストを実行する共通関数
 * @param {Object} testCase - テストケース
 * @param {Object} [options] - オプション
 * @param {string} [options.mockBaseUrl] - モックAPIのベースURL
 * @param {boolean} [options.verbose] - 詳細モード
 * @returns {Promise<Object>} レスポンス
 */
export async function runToolTest(testCase, options = {}) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      LOG_LEVEL: 'error' // テスト中はエラーログのみ
    };

    // モックURLが指定されている場合は環境変数に設定
    if (options.mockBaseUrl) {
      env.NWS_API_BASE_URL = options.mockBaseUrl;
      env.OBSIDIAN_API_URL = options.mockBaseUrl;
    }

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
    
    child.on('close', () => {
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

/**
 * テストケースを実行してアサーションをチェックする
 * @param {string} toolName - ツール名
 * @param {Array} testCases - テストケース配列
 * @param {Object} [options] - オプション
 * @returns {Promise<{total: number, passed: number}>} テスト結果
 */
export async function runTestSuite(toolName, testCases, options = {}) {
  console.log(`\n## ${toolName} のテスト`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of testCases) {
    totalTests++;
    console.log(`\n### ${testCase.name}`);
    
    try {
      const response = await runToolTest(testCase, options);
      
      if (options.verbose) {
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
        } else if (options.verbose) {
          console.log(`✅ アサーション ${i + 1} 成功`);
        }
      }
      
      if (allPassed) {
        passedTests++;
        console.log('✅ テスト成功');
      } else {
        console.log('❌ テスト失敗');
        if (!options.verbose) {
          console.log('レスポンス:', JSON.stringify(response, null, 2));
        }
      }
      
    } catch (error) {
      console.log('❌ エラー:', error.message);
    }
  }
  
  return { total: totalTests, passed: passedTests };
}