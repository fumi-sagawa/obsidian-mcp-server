// get-file統合テスト
export const testCases = [
  {
    name: 'ファイルを正常に取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file',
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
      // 期待される結果: ファイル名が含まれる
      response => response.result.content[0].text.includes('test.md')
    ]
  },
  {
    name: '存在しないファイルの場合エラーを返す',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file',
        arguments: {
          filename: 'non-existent-file.md'
        }
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.error !== undefined,
      // 期待される結果: ファイルが見つからないエラー
      response => response.error.message.includes('not found') || response.error.message.includes('見つかりません')
    ]
  },
  {
    name: 'ファイル名が空の場合エラーを返す',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file',
        arguments: {
          filename: ''
        }
      }
    },
    assertions: [
      // 期待される結果: エラーレスポンス
      response => response.error !== undefined,
      // 期待される結果: バリデーションエラー
      response => response.error.message.includes('required') || response.error.message.includes('必須')
    ]
  },
  {
    name: 'サブディレクトリのファイルを取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_file',
        arguments: {
          filename: 'notes/daily.md'
        }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: content配列が存在
      response => Array.isArray(response.result.content),
      // 期待される結果: ファイルパスが含まれる
      response => response.result.content[0].text.includes('notes/daily.md')
    ]
  }
];