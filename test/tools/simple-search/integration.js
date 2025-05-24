export const testCases = [
  {
    name: 'should search with basic query',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: 'meeting'
        }
      }
    },
    assertions: [
      // 成功レスポンス
      response => response.result !== undefined,
      // テキストコンテンツを含む
      response => response.result.content[0].type === 'text',
      // 検索結果を含む
      response => response.result.content[0].text.includes('検索結果') || response.result.content[0].text.includes('ファイルが見つか')
    ]
  },
  {
    name: 'should search with context length',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: 'test',
          contextLength: 50
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('検索結果') || response.result.content[0].text.includes('ファイルが見つか')
    ]
  },
  {
    name: 'should handle Japanese query',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: '会議'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('検索結果') || response.result.content[0].text.includes('ファイルが見つか')
    ]
  },
  {
    name: 'should handle no results',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: 'xyzabcdefghijklmnop12345'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('見つかりませんでした')
    ]
  },
  {
    name: 'should reject empty query',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: ''
        }
      }
    },
    assertions: [
      // エラーレスポンス
      response => response.error !== undefined || response.result.content[0].text.includes('Error')
    ]
  },
  {
    name: 'should reject missing query',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {}
      }
    },
    assertions: [
      // エラーレスポンス
      response => response.error !== undefined || response.result.content[0].text.includes('Error')
    ]
  },
  {
    name: 'should reject invalid context length',
    request: {
      method: 'tools/call',
      params: {
        name: 'simple-search',
        arguments: {
          query: 'test',
          contextLength: -5
        }
      }
    },
    assertions: [
      // エラーレスポンス
      response => response.error !== undefined || response.result.content[0].text.includes('Error')
    ]
  }
];