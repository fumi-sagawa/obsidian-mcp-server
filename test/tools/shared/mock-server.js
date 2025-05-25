import { createServer } from 'http';

/**
 * テスト用のモックAPIサーバー
 */
export class MockApiServer {
  constructor() {
    this.server = null;
    this.port = 0;
  }

  async start() {
    return new Promise((resolve) => {
      this.server = createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        
        // URLパスに基づいてモックレスポンスを返す
        if (req.method === 'PUT' && req.url === '/active/') {
          // アクティブファイルの更新をモック
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'GET' && req.url === '/vault/') {
          // ルートディレクトリの一覧（GET /vault/）
          res.statusCode = 200;
          res.end(JSON.stringify({
            files: ['note1.md', 'note2.md', 'documents/', 'projects/']
          }));
        } else if (req.method === 'GET' && req.url.match(/^\/vault\/.*\/$/)) {
          // list-directory エンドポイント（GET /vault/{pathToDirectory}/）
          const pathMatch = req.url.match(/^\/vault\/(.*)\/$/);
          const pathToDirectory = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
          
          // パストラバーサル攻撃のテスト
          if (pathToDirectory.includes('../')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ 
              error: 'Bad request',
              errorCode: 40001
            }));
            return;
          }
          
          // 存在しないディレクトリのテスト
          if (pathToDirectory === 'non-existent-directory') {
            res.statusCode = 404;
            res.end(JSON.stringify({
              errorCode: 40400,
              message: 'Directory does not exist'
            }));
            return;
          }
          
          // モックレスポンスを返す
          let mockFiles = [];
          
          if (pathToDirectory === '' || pathToDirectory === '/') {
            // ルートディレクトリ
            mockFiles = ['note1.md', 'note2.md', 'documents/', 'projects/'];
          } else if (pathToDirectory === 'notes') {
            mockFiles = ['daily/', 'weekly/', 'meeting-notes.md', 'ideas.md'];
          } else if (pathToDirectory === 'projects/web/frontend') {
            mockFiles = ['components/', 'pages/', 'utils/', 'main.tsx', 'App.tsx'];
          } else if (pathToDirectory === 'my notes/日本語フォルダ') {
            mockFiles = ['メモ.md', 'タスク/', '会議録.md'];
          } else if (pathToDirectory === 'notes/daily') {
            mockFiles = ['2024-05-24.md', '2024-05-23.md', 'templates/'];
          } else {
            // デフォルトケース（空のディレクトリ）
            mockFiles = [];
          }
          
          res.statusCode = 200;
          res.end(JSON.stringify({
            files: mockFiles
          }));
        } else if (req.method === 'GET' && req.url.startsWith('/vault/')) {
          // ファイルの取得をモック
          const filename = decodeURIComponent(req.url.substring('/vault/'.length));
          if (filename.includes('existing-file')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/markdown');
            res.end('# Existing Content\n\nThis is an existing file.');
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'File not found' }));
          }
        } else if (req.method === 'PUT' && req.url.startsWith('/vault/')) {
          // ファイルの作成・更新をモック
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'DELETE' && req.url.startsWith('/vault/')) {
          // ファイルの削除をモック
          const filename = decodeURIComponent(req.url.split('/vault/')[1]);
          
          // 存在しないファイルのテスト
          if (filename === 'non-existent.md') {
            res.statusCode = 404;
            res.end(JSON.stringify({ 
              errorCode: 404,
              error: 'Not found' 
            }));
            return;
          }
          
          // 成功の場合
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'POST' && req.url === '/active/') {
          // アクティブファイルへの追記をモック
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'PATCH' && req.url === '/active/') {
          // アクティブファイルへのPATCH操作をモック
          res.statusCode = 200; // OK
          res.end();
        } else if (req.method === 'DELETE' && req.url === '/active/') {
          // アクティブファイルの削除をモック
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'GET' && req.url === '/commands/') {
          // コマンド一覧をモック
          res.statusCode = 200;
          res.end(JSON.stringify({
            commands: [
              { id: 'global-search:open', name: 'Search: Search in all files' },
              { id: 'graph:open', name: 'Graph view: Open graph view' },
              { id: 'daily-notes:goto-today', name: 'Daily notes: Open today\'s note' },
              { id: 'command-palette:open', name: 'Command palette: Open command palette' },
              { id: 'quick-switcher:open', name: 'Quick switcher: Open quick switcher' }
            ]
          }));
        } else if (req.method === 'POST' && req.url.startsWith('/commands/')) {
          // コマンド実行をモック
          const commandId = decodeURIComponent(req.url.substring('/commands/'.length, req.url.length - 1));
          
          if (commandId === 'non-existent-command') {
            // 存在しないコマンドの場合は404
            res.statusCode = 404;
            res.end(JSON.stringify({
              errorCode: 40149,
              message: 'The command you specified does not exist.'
            }));
          } else if (commandId === '') {
            // 空のコマンドID
            res.statusCode = 400;
            res.end(JSON.stringify({
              errorCode: 40001,
              message: 'Command ID is required'
            }));
          } else {
            // 正常なコマンド実行
            res.statusCode = 204; // No Content
            res.end();
          }
        } else if (req.url === '/') {
          // Obsidian API root endpoint
          res.statusCode = 200;
          res.end(JSON.stringify({
            authenticated: true,
            status: 'OK',
            service: 'Obsidian Local REST API',
            versions: {
              obsidian: '1.5.0',
              self: '1.0.0'
            },
            manifest: {
              id: 'obsidian-local-rest-api',
              name: 'Local REST API',
              version: '3.1.0',
              minAppVersion: '0.12.0',
              description: 'Get, change or otherwise interact with your notes in Obsidian via a REST API.',
              author: 'Adam Coddington',
              authorUrl: 'https://coddingtonbear.net/',
              isDesktopOnly: true,
              dir: '.obsidian/plugins/obsidian-local-rest-api'
            },
            certificateInfo: {
              validityDays: 364.6621255324074,
              regenerateRecommended: false
            },
            apiExtensions: []
          }));
        } else if (req.url.includes('/alerts?area=CA')) {
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
        } else if (req.method === 'POST' && req.url.startsWith('/open/')) {
          // open-file エンドポイント
          const filename = decodeURIComponent(req.url.split('/open/')[1].split('?')[0]);
          
          // パストラバーサル攻撃のテスト
          if (filename.includes('../')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid file path' }));
            return;
          }
          
          // 空のファイル名のテスト
          if (!filename || filename.trim() === '') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Filename is required' }));
            return;
          }
          
          // 成功レスポンス
          res.statusCode = 200;
          res.end(''); // open エンドポイントは空のレスポンスを返す
        } else if (req.method === 'POST' && req.url.startsWith('/vault/')) {
          // vault/{filename} エンドポイント（ファイルへの追記）
          const filename = decodeURIComponent(req.url.split('/vault/')[1]);
          
          // ディレクトリへの追記エラー
          if (filename.endsWith('/')) {
            res.statusCode = 405;
            res.end(JSON.stringify({ 
              error: 'Cannot append to directory',
              errorCode: 40501
            }));
            return;
          }
          
          // 無効なファイルパス
          if (filename.includes('../')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ 
              error: 'Bad request',
              errorCode: 40001
            }));
            return;
          }
          
          // 成功レスポンス
          res.statusCode = 204; // No Content
          res.end();
        } else if (req.method === 'GET' && req.url.match(/^\/periodic\/(daily|weekly|monthly|quarterly|yearly)\/?$/)) {
          // GET periodic note
          const period = req.url.match(/^\/periodic\/(daily|weekly|monthly|quarterly|yearly)\/?$/)[1];
          const periodPaths = {
            daily: 'Daily Notes/2024-05-24.md',
            weekly: 'Weekly Notes/2024-W21.md',
            monthly: 'Monthly Notes/2024-05.md',
            quarterly: 'Quarterly Notes/2024-Q2.md',
            yearly: 'Yearly Notes/2024.md'
          };
          
          res.statusCode = 200;
          res.end(JSON.stringify({
            path: periodPaths[period] || `${period} notes/current.md`,
            content: 'Mock periodic note content',
            tags: [],
            frontmatter: {},
            stat: {
              ctime: Date.now() - 86400000,
              mtime: Date.now(),
              size: 100
            }
          }));
        } else if (req.method === 'POST' && req.url.match(/^\/periodic\/(daily|weekly|monthly|quarterly|yearly)\/?$/)) {
          // POST to append to periodic note
          // Simulate successful append (204 No Content)
          res.statusCode = 204;
          res.end();
        } else if (req.method === 'DELETE' && req.url.match(/^\/periodic\/(daily|weekly|monthly|quarterly|yearly)\/?$/)) {
          // DELETE periodic note
          const period = req.url.match(/^\/periodic\/(daily|weekly|monthly|quarterly|yearly)\/?$/)[1];
          
          // テスト用に特定の条件でエラーをシミュレート
          if (period === 'nonexistent') {
            res.statusCode = 404;
            res.end(JSON.stringify({
              error: 'No nonexistent note found',
              errorCode: 40401
            }));
            return;
          }
          
          // 成功の場合（204 No Content）
          res.statusCode = 204;
          res.end();
        } else if (req.method === 'POST' && req.url.startsWith('/search/simple/')) {
          // simple search エンドポイント
          const urlParts = req.url.split('?');
          const queryParams = new URLSearchParams(urlParts[1] || '');
          const query = queryParams.get('query');
          const contextLength = parseInt(queryParams.get('contextLength') || '100', 10);
          
          if (!query) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Query parameter is required' }));
            return;
          }
          
          // モック結果を返す
          if (query.includes('xyzabcdefghijklmnop')) {
            // 結果なしの場合
            res.statusCode = 200;
            res.end(JSON.stringify([]));
          } else if (query === '会議' || query === 'meeting') {
            res.statusCode = 200;
            res.end(JSON.stringify([
              {
                filename: 'notes/meetings/2024-01-20.md',
                matches: [
                  {
                    match: { start: 10, end: 17 },
                    context: '今日は重要な会議がありました。'
                  }
                ],
                score: 0.95
              },
              {
                filename: 'notes/daily/2024-01-19.md',
                matches: [
                  {
                    match: { start: 20, end: 27 },
                    context: '明日の会議の準備をする必要があります。'
                  }
                ],
                score: 0.82
              }
            ]));
          } else {
            // デフォルトケース
            res.statusCode = 200;
            res.end(JSON.stringify([
              {
                filename: `notes/test-${Date.now()}.md`,
                matches: [
                  {
                    match: { start: 0, end: query.length },
                    context: `This is a test result for query: ${query} with context length ${contextLength}`
                  }
                ],
                score: 0.75
              }
            ]));
          }
        } else if (req.method === 'GET' && req.url.match(/^\/vault\/.*\/$/)) {
          // list-directory エンドポイント（GET /vault/{pathToDirectory}/）
          const pathMatch = req.url.match(/^\/vault\/(.*)\/$/);
          const pathToDirectory = pathMatch ? decodeURIComponent(pathMatch[1]) : '';
          
          // パストラバーサル攻撃のテスト
          if (pathToDirectory.includes('../')) {
            res.statusCode = 400;
            res.end(JSON.stringify({ 
              error: 'Bad request',
              errorCode: 40001
            }));
            return;
          }
          
          // 存在しないディレクトリのテスト
          if (pathToDirectory === 'non-existent-directory') {
            res.statusCode = 404;
            res.end(JSON.stringify({
              errorCode: 40400,
              message: 'Directory does not exist'
            }));
            return;
          }
          
          // モックレスポンスを返す
          let mockFiles = [];
          
          if (pathToDirectory === '' || pathToDirectory === '/') {
            // ルートディレクトリ
            mockFiles = ['note1.md', 'note2.md', 'documents/', 'projects/'];
          } else if (pathToDirectory === 'notes') {
            mockFiles = ['daily/', 'weekly/', 'meeting-notes.md', 'ideas.md'];
          } else if (pathToDirectory === 'projects/web/frontend') {
            mockFiles = ['components/', 'pages/', 'utils/', 'main.tsx', 'App.tsx'];
          } else if (pathToDirectory === 'my notes/日本語フォルダ') {
            mockFiles = ['メモ.md', 'タスク/', '会議録.md'];
          } else if (pathToDirectory === 'notes/daily') {
            mockFiles = ['2024-05-24.md', '2024-05-23.md', 'templates/'];
          } else {
            // デフォルトケース（空のディレクトリ）
            mockFiles = [];
          }
          
          res.statusCode = 200;
          res.end(JSON.stringify({
            files: mockFiles
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