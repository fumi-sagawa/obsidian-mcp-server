/**
 * create-or-update-file ツールのモックテスト
 */

export const testCases = [
  {
    name: '新規ファイルを作成',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: 'test/new-file.md',
          content: '# New File\n\nThis is a new file created by the test.'
        }
      }
    },
    assertions: [
      // レスポンスが存在すること
      response => response.result !== undefined,
      // content配列が存在すること
      response => response.result.content && Array.isArray(response.result.content),
      // テキストタイプであること
      response => response.result.content[0].type === 'text',
      // 成功メッセージが含まれること
      response => response.result.content[0].text.includes('File created successfully'),
      // ファイル名が含まれること
      response => response.result.content[0].text.includes('test/new-file.md')
    ]
  },
  {
    name: '既存ファイルを更新',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: 'test/existing-file.md',
          content: '# Updated File\n\nThis content has been updated.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content && Array.isArray(response.result.content),
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('successfully'),
      response => response.result.content[0].text.includes('test/existing-file.md')
    ]
  },
  {
    name: '深いディレクトリ構造にファイルを作成',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: 'test/deep/nested/path/file.md',
          content: '# Nested File\n\nFile in a nested directory.'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content && Array.isArray(response.result.content),
      response => response.result.content[0].text.includes('successfully')
    ]
  },
  {
    name: '空のコンテンツでファイルを作成',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: 'test/empty-file.md',
          content: ''
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content && Array.isArray(response.result.content),
      response => response.result.content[0].text.includes('successfully')
    ]
  },
  {
    name: '無効なパスでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: '../outside-vault.md',
          content: 'This should fail'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content && Array.isArray(response.result.content),
      response => response.result.content[0].text.includes('Error'),
      response => response.result.content[0].text.includes('Invalid file path')
    ]
  },
  {
    name: '必須パラメータ不足でエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'create-or-update-file',
        arguments: {
          filename: 'test/file.md'
          // contentが不足
        }
      }
    },
    assertions: [
      // エラーレスポンスの場合は response.error が存在することがある
      response => response.result !== undefined || response.error !== undefined,
      response => {
        if (response.result && response.result.content && Array.isArray(response.result.content)) {
          return response.result.content[0].text.includes('Error');
        }
        // エラーレスポンスの場合
        if (response.error) {
          return true;
        }
        return false;
      }
    ]
  }
];