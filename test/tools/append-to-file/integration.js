export const testCases = [
  {
    name: '基本的なファイル追記',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'test-append.md',
          content: '\n## 新しいセクション\n追記されたコンテンツ'
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('追記しました')
        );
      }
    ]
  },
  {
    name: '空のコンテンツ追記',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'test-empty.md',
          content: ''
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('追記しました')
        );
      }
    ]
  },
  {
    name: '日本語ファイル名とコンテンツ',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'テスト用ファイル.md',
          content: '# 日本語の見出し\n\nこれは日本語のコンテンツです。\n絵文字も含みます: 😊 🎉 🌸'
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('追記しました')
        );
      }
    ]
  },
  {
    name: '必須パラメータチェック',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          content: 'テストコンテンツ'
          // filename が欠落
        }
      }
    },
    expectedError: true,
    assertions: [
      response => response.error !== undefined,
      response => response.error.message && response.error.message.includes('Required')
    ]
  },
  {
    name: '拡張子なしのファイル名でエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'append_to_file',
        arguments: {
          filename: 'test-without-extension',
          content: 'テストコンテンツ'
        }
      }
    },
    expectedError: true,
    assertions: [
      response => response.error !== undefined,
      response => response.error.message && response.error.message.includes('拡張子')
    ]
  }
];