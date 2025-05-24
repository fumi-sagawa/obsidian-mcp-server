// append-to-active-file統合テスト
export const testCases = [
  {
    name: 'アクティブファイルにコンテンツを追記',
    request: {
      method: 'tools/call',
      params: {
        name: 'append-to-active-file',
        arguments: { content: '\n\n## 追記されたセクション\n\nこれは追記されたコンテンツです。' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 成功メッセージ
      response => response.result.content[0].text.includes('アクティブファイルにコンテンツを追記しました')
    ]
  },
  {
    name: '空のコンテンツを追記',
    request: {
      method: 'tools/call',
      params: {
        name: 'append-to-active-file',
        arguments: { content: '' }
      }
    },
    assertions: [
      // 期待される結果: 成功レスポンス
      response => response.result !== undefined,
      // 期待される結果: 成功メッセージ
      response => response.result.content[0].text.includes('アクティブファイルにコンテンツを追記しました')
    ]
  }
];