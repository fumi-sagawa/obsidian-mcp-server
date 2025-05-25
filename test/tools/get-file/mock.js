// get_fileモックテスト
export const testCases = [
  {
    name: 'ファイルを正常に取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file_content',
        arguments: {
          filename: 'test.md'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: content配列が存在
      response => Array.isArray(response.result.content),
      // 期待される結果: text typeのコンテンツが存在
      response => response.result.content.some(item => item.type === 'text'),
      // 期待される結果: JSON形式でパスとコンテンツが含まれる
      response => {
        try {
          const data = JSON.parse(response.result.content[0].text);
          return data.path === 'test.md' && data.content !== undefined;
        } catch {
          return false;
        }
      }
    ]
  },
  {
    name: '日本語ファイル名のファイルを取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file_content',
        arguments: {
          filename: '日本語ファイル.md'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 日本語ファイル名が正しく処理される
      response => {
        try {
          const data = JSON.parse(response.result.content[0].text);
          return data.path === '日本語ファイル.md';
        } catch {
          return false;
        }
      }
    ]
  },
  {
    name: 'サブディレクトリのファイルを取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file_content',
        arguments: {
          filename: 'notes/daily/2024-05-25.md'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: パスが正しく処理される
      response => {
        try {
          const data = JSON.parse(response.result.content[0].text);
          return data.path === 'notes/daily/2024-05-25.md';
        } catch {
          return false;
        }
      }
    ]
  },
  {
    name: '存在しないファイルの場合エラーを返す',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file_content',
        arguments: {
          filename: 'non-existent-file.md'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンスだがエラーメッセージ
      response => response.result !== undefined,
      // 期待される結果: エラーメッセージが含まれる
      response => response.result.content[0].text.includes('Error: File not found')
    ]
  },
  {
    name: 'ファイル名が空の場合エラーを返す',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file_content',
        arguments: {
          filename: ''
        }
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.error !== undefined,
      // 期待される結果: バリデーションエラー
      response => response.error.message.includes('ファイル名は必須です')
    ]
  }
];