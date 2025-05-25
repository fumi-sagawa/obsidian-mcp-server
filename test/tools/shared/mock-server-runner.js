#!/usr/bin/env node
import { MockApiServer } from './mock-server.js';

// モックサーバーを起動
const mockServer = new MockApiServer();

mockServer.start().then(() => {
  console.log('モックサーバーが起動しました: http://localhost:' + mockServer.port);
  
  // プロセスが終了するまで待機
  process.on('SIGINT', () => {
    console.log('\nモックサーバーを停止します...');
    mockServer.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nモックサーバーを停止します...');
    mockServer.stop();
    process.exit(0);
  });
});