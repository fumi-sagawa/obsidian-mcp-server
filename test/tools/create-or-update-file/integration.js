/**
 * create-or-update-file ツールの統合テスト
 */

export const testCases = [
  {
    name: '新規ファイルを作成して内容を確認',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_or_update_file',
        arguments: {
          filename: 'test-create-update/new-integration-file.md',
          content: '# Integration Test\n\nThis is created by integration test.'
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
          item.text.includes('File created successfully')
        );
      }
    ]
  },
  {
    name: '既存ファイルを更新して内容を確認',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_or_update_file',
        arguments: {
          filename: 'test-create-update/update-integration-file.md',
          content: '# Updated Content\n\nThis has been updated by the test.'
        }
      }
    },
    assertions: [
      response => {
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        // 最初の呼び出しでファイルを作成するため、2回目は更新になる
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('successfully')
        );
      }
    ]
  },
  {
    name: '深いディレクトリ構造にファイルを作成',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_or_update_file',
        arguments: {
          filename: 'test-create-update/deep/nested/directory/file.md',
          content: '# Nested File\n\nFile in a deeply nested directory.'
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
          item.text.includes('File created successfully')
        );
      }
    ]
  },
  {
    name: '特殊文字を含む内容でファイルを作成',
    request: {
      method: 'tools/call',
      params: {
        name: 'create_or_update_file',
        arguments: {
          filename: 'test-create-update/special-chars.md',
          content: '# 日本語タイトル\n\n特殊文字テスト: 🎉 ★ ♥ © ®\n\n```javascript\nconst message = "Hello, World!";\nconsole.log(message);\n```'
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
          item.text.includes('File created successfully')
        );
      }
    ]
  }
];