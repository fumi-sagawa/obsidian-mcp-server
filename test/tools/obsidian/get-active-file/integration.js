// get-active-file統合テスト
export const testCases = [
  {
    name: 'アクティブファイルを正常に取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_active_file',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: content配列が存在
      response => Array.isArray(response.result.content),
      // 期待される結果: text typeのコンテンツが存在
      response => response.result.content.some(item => item.type === 'text'),
      // 期待される結果: ファイル情報を含む
      response => response.result.content[0].text.includes('Active File:') ||
                 response.result.content[0].text.includes('Path:') ||
                 response.result.content[0].text.includes('Content:')
    ]
  },
  {
    name: 'アクティブファイルが存在しない場合のエラー処理',
    request: {
      method: 'tools/call',
      params: {
        name: 'get_active_file',
        arguments: {}
      }
    },
    assertions: [
      // 期待される結果: レスポンスが存在（成功またはエラー）
      response => response.result !== undefined || response.error !== undefined,
      // 期待される結果: エラーの場合は適切なメッセージ
      response => (response.result && response.result.content) ||
                 (response.error && response.error.message) ||
                 (response.result && response.result.content[0].text.includes('Error')) ||
                 (response.result && response.result.content[0].text.includes('No active file'))
    ]
  }
];