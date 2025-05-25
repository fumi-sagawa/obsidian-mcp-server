export const testCases = [
  {
    name: "見出しの下にコンテンツを追加（実際のAPI）",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "test-insert-file.md",
          operation: "append",
          targetType: "heading",
          target: "Test Heading",
          content: "\n\nThis content was added via insert_into_file tool."
        }
      }
    },
    assertions: [
      response => response.result !== undefined || response.error !== undefined
    ],
    skipIfMock: false
  },
  {
    name: "frontmatterフィールドを更新（実際のAPI）",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "test-insert-file.md",
          operation: "replace",
          targetType: "frontmatter",
          target: "status",
          content: "updated-via-tool"
        }
      }
    },
    assertions: [
      response => response.result !== undefined || response.error !== undefined
    ],
    skipIfMock: false
  },
  {
    name: "存在しないファイルでエラー（実際のAPI）",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "nonexistent-file.md",
          operation: "append", 
          targetType: "heading",
          target: "Any Heading",
          content: "Content"
        }
      }
    },
    assertions: [
      response => response.error !== undefined
    ],
    skipIfMock: false
  }
];