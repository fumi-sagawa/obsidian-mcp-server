// get-active-fileモックテスト
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
      // 期待される結果: アクティブファイル情報を含む
      response => response.result.content[0].text.includes('Active File:') &&
                 response.result.content[0].text.includes('Path:') &&
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
      // 期待される結果: 成功レスポンス（エラーメッセージ付き）
      response => response.result !== undefined,
      // 期待される結果: エラーメッセージを含む
      response => response.result.content[0].text.includes('Error') ||
                 response.result.content[0].text.includes('No active file') ||
                 response.result.content[0].text.includes('アクティブファイルが見つかりません')
    ]
  }
];