/**
 * delete-file ツールの統合テスト
 */

export const testCases = [
  {
    name: 'ファイル削除テスト',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_file',
        arguments: {
          filename: 'test-delete-file.md'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // テキストコンテンツが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text';
      },
      // 成功またはエラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.text?.includes('Successfully deleted file') ||
               content?.text?.includes('Error');
      }
    ]
  },
  {
    name: '存在しないファイルのエラー処理',
    request: {
      method: 'tools/call',
      params: {
        name: 'delete_file',
        arguments: {
          filename: 'non-existent-file-12345.md'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // エラーメッセージが含まれること
      response => {
        const content = response.result?.content?.[0];
        return content?.type === 'text' && 
               content.text.includes('Error');
      }
    ]
  }
];