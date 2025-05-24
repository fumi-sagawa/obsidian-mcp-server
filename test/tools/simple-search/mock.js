// モックテストケース定義
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
      response => response.result !== undefined,
      response => response.result.content[0].type === 'text',
      response => response.result.content[0].text.includes('2件のファイルが見つかりました'),
      response => response.result.content[0].text.includes('notes/meetings/2024-01-20.md'),
      response => response.result.content[0].text.includes('notes/daily/2024-01-19.md')
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
      response => response.result.content[0].text.includes('2件のファイルが見つかりました'),
      response => response.result.content[0].text.includes('会議')
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
    name: 'should include context in results',
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
      response => response.result.content[0].text.includes('test'),
      response => response.result.content[0].text.includes('context length 50')
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
      response => response.error !== undefined || response.result.content[0].text.includes('Error')
    ]
  }
];

// モックエンドポイントのセットアップ
export default function setupSimpleSearchMockEndpoint(app) {
  // Simple search endpoint
  app.post('/search/simple/', (req, res) => {
    const { query, contextLength = 100 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }
    
    // Return mock results based on query
    if (query.includes('xyzabcdefghijklmnop')) {
      // No results case
      return res.json([]);
    }
    
    if (query === '会議' || query === 'meeting') {
      return res.json([
        {
          filename: 'notes/meetings/2024-01-20.md',
          matches: [
            {
              match: { start: 10, end: 17 },
              context: '今日は重要な会議がありました。'
            },
            {
              match: { start: 50, end: 57 },
              context: 'The meeting was productive and we made good progress.'
            }
          ],
          score: 0.95
        },
        {
          filename: 'notes/daily/2024-01-19.md',
          matches: [
            {
              match: { start: 20, end: 27 },
              context: '明日の会議の準備をする必要があります。'
            }
          ],
          score: 0.82
        }
      ]);
    }
    
    // Default case
    return res.json([
      {
        filename: `notes/test-${Date.now()}.md`,
        matches: [
          {
            match: { start: 0, end: query.length },
            context: `This is a test result for query: ${query} with context length ${contextLength}`
          }
        ],
        score: 0.75
      }
    ]);
  });
}