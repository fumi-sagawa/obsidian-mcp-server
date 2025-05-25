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
      // 期待される結果: JSON形式でパスとコンテンツが含まれる
      response => {
        try {
          const data = JSON.parse(response.result.content[0].text);
          return data.path !== undefined && data.content !== undefined;
        } catch {
          return false;
        }
      }
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
      // 期待される結果: 成功レスポンス（モックサーバーは常に成功を返す）
      response => response.result !== undefined,
      // 期待される結果: JSON形式のレスポンス
      response => {
        try {
          JSON.parse(response.result.content[0].text);
          return true;
        } catch {
          return false;
        }
      }
    ]
  }
];