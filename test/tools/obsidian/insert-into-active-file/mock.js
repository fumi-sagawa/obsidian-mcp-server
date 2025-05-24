// insert-into-active-fileモックテスト
export const testCases = [
  {
    name: '見出しの下にコンテンツを追加',
    request: {
      method: 'tools/call',
      params: {
        name: 'insert-into-active-file',
        arguments: {
          operation: 'append',
          targetType: 'heading',
          target: 'Test Heading',
          content: 'Content after heading'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to heading')
    ]
  },
  {
    name: 'ブロック参照の前にコンテンツを追加',
    request: {
      method: 'tools/call',
      params: {
        name: 'insert-into-active-file',
        arguments: {
          operation: 'prepend',
          targetType: 'block',
          target: 'abc123',
          content: 'Content before block'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully prepended to block')
    ]
  },
  {
    name: 'frontmatterフィールドを更新',
    request: {
      method: 'tools/call',
      params: {
        name: 'insert-into-active-file',
        arguments: {
          operation: 'replace',
          targetType: 'frontmatter',
          target: 'title',
          content: 'New Title'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully replaced in frontmatter')
    ]
  },
  {
    name: 'JSONコンテンツでテーブルに行を追加',
    request: {
      method: 'tools/call',
      params: {
        name: 'insert-into-active-file',
        arguments: {
          operation: 'append',
          targetType: 'block',
          target: 'table123',
          content: '[["New York", "20"]]',
          contentType: 'application/json'
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to block')
    ]
  },
  {
    name: 'カスタム区切り文字で階層的な見出し',
    request: {
      method: 'tools/call',
      params: {
        name: 'insert-into-active-file',
        arguments: {
          operation: 'append',
          targetType: 'heading',
          target: 'Parent / Child / Grandchild',
          content: 'Nested content',
          targetDelimiter: ' / '
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to heading')
    ]
  }
];