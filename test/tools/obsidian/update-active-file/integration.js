// update-active-file統合テスト
export const testCases = [
  {
    name: 'アクティブファイルの内容を更新',
    request: {
      method: 'tools/call',
      params: {
        name: 'update_active_file',
        arguments: { content: '# Updated Content\n\nThis is the new content for the active file.' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 成功メッセージ
      response => response.result.content[0].text.includes('Active file updated successfully')
    ]
  },
  {
    name: '空のコンテンツで更新',
    request: {
      method: 'tools/call',
      params: {
        name: 'update_active_file',
        arguments: { content: '' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 成功メッセージ
      response => response.result.content[0].text.includes('Active file updated successfully')
    ]
  }
];