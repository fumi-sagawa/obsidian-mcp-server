#!/usr/bin/env node

/**
 * MCP Inspector ラッパースクリプト
 * 
 * Inspectorの起動前にポートの確認と既存プロセスのクリーンアップを行います
 */

import { spawn, execSync } from 'child_process';
import { createServer } from 'net';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 使用するポート
const INSPECTOR_PORT = 6274;
const PROXY_PORT = 6277;

// ポートが使用可能かチェック
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// ポートを使用しているプロセスを終了
function killProcessOnPort(port) {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    } else if (process.platform === 'win32') {
      execSync(`for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}"') do taskkill /F /PID %a`, { stdio: 'ignore' });
    }
  } catch (e) {
    // エラーは無視（プロセスが見つからない場合など）
  }
}

// 遅延を追加
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('MCP Inspector 起動準備中...\n');
  
  // ポートの状態をチェック
  const inspectorAvailable = await isPortAvailable(INSPECTOR_PORT);
  const proxyAvailable = await isPortAvailable(PROXY_PORT);
  
  if (!inspectorAvailable || !proxyAvailable) {
    console.log('⚠️  使用中のポートを検出しました');
    
    if (!inspectorAvailable) {
      console.log(`  - ポート ${INSPECTOR_PORT} を解放しています...`);
      killProcessOnPort(INSPECTOR_PORT);
    }
    
    if (!proxyAvailable) {
      console.log(`  - ポート ${PROXY_PORT} を解放しています...`);
      killProcessOnPort(PROXY_PORT);
    }
    
    console.log('  ✅ ポートを解放しました\n');
    
    // ポート解放後に少し待機
    await delay(1000);
  }
  
  // ビルドを実行
  console.log('📦 プロジェクトをビルドしています...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ ビルド完了\n');
  } catch (error) {
    console.error('❌ ビルドに失敗しました');
    process.exit(1);
  }
  
  // MCP Inspectorを起動
  console.log('🚀 MCP Inspector を起動しています...\n');
  
  const serverPath = join(__dirname, '..', 'build', 'index.js');
  const args = [
    '@modelcontextprotocol/inspector',
    'node',
    serverPath
  ];
  
  // 環境変数を設定（デバッグ情報を抑制）
  const env = {
    ...process.env,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    NODE_ENV: 'production'
  };
  
  const inspector = spawn('npx', args, {
    stdio: 'inherit',
    env
  });
  
  inspector.on('error', (error) => {
    console.error('❌ Inspector起動エラー:', error.message);
    process.exit(1);
  });
  
  inspector.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌ Inspectorが異常終了しました (code: ${code})`);
    }
    process.exit(code || 0);
  });
  
  // プロセス終了時のクリーンアップ
  process.on('SIGINT', () => {
    console.log('\n\n👋 MCP Inspector を終了しています...');
    inspector.kill('SIGTERM');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    inspector.kill('SIGTERM');
    process.exit(0);
  });
}

// 実行
main().catch((error) => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});