/**
 * search_notes ツールの統合テスト
 */

export const testCases = [
  {
    name: '基本的なタグ検索',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"in": ["project", {"var": "tags"}]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => Array.isArray(response.result.content),
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('Search Results') ||
                 response.result.content[0].text.includes('No matches found')
    ]
  },
  {
    name: 'コンテンツ検索',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"==": ["test", {"var": "content"}]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Search Results') ||
                 response.result.content[0].text.includes('No matches found')
    ]
  },
  {
    name: '複合検索クエリ',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"and": [{"in": ["project", {"var": "tags"}]}, {">=": [{"var": "stat.mtime"}, 1640995200000]}]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Search Results') ||
                 response.result.content[0].text.includes('No matches found')
    ]
  },
  {
    name: '存在しないタグの検索（空の結果）',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"in": ["nonexistent-tag-12345", {"var": "tags"}]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('No matches found') ||
                 response.result.content[0].text.includes('Search Results')
    ]
  },
  {
    name: '無効なJSON Logic形式でエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: 'invalid-json'
        }
      }
    },
    assertions: [
      response => response.error !== undefined || 
                 (response.result && response.result.content[0].text.includes('Error')),
      response => (response.error && response.error.message) ||
                 (response.result && response.result.content[0].text.includes('Invalid'))
    ]
  },
  {
    name: '空のクエリでエラー',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: ''
        }
      }
    },
    assertions: [
      response => response.error !== undefined ||
                 (response.result && response.result.content[0].text.includes('Error')),
      response => (response.error && response.error.message.includes('required')) ||
                 (response.result && response.result.content[0].text.includes('required'))
    ]
  },
  {
    name: 'ファイル名での検索',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{"==": ["daily", {"var": "basename"}]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Search Results') ||
                 response.result.content[0].text.includes('No matches found')
    ]
  },
  {
    name: 'ファイルサイズ条件での検索',
    request: {
      method: 'tools/call',
      params: {
        name: 'search_notes',
        arguments: {
          jsonLogicQuery: '{">=": [{"var": "stat.size"}, 1000]}'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Search Results') ||
                 response.result.content[0].text.includes('No matches found')
    ]
  }
];