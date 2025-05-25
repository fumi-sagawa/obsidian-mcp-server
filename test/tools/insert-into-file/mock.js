export const testCases = [
  {
    name: "見出しの下にコンテンツを追加",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "test-note.md",
          operation: "append",
          targetType: "heading",
          target: "Section 1",
          content: "New content under the heading"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to heading: Section 1 in file: test-note.md')
    ]
  },
  {
    name: "ブロック参照の前にコンテンツを追加",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "notes/research.md", 
          operation: "prepend",
          targetType: "block",
          target: "abc123",
          content: "Content before the block"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully prepended to block: abc123 in file: notes/research.md')
    ]
  },
  {
    name: "frontmatterフィールドを置換",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "blog/article.md",
          operation: "replace",
          targetType: "frontmatter", 
          target: "title",
          content: "New Article Title"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully replaced in frontmatter: title in file: blog/article.md')
    ]
  },
  {
    name: "JSONコンテンツでテーブルに行を追加",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "data/cities.md",
          operation: "append",
          targetType: "block",
          target: "table-ref",
          content: '[["Chicago", "2.7M"]]',
          contentType: "application/json"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to block: table-ref in file: data/cities.md')
    ]
  },
  {
    name: "カスタム区切り文字で階層的な見出し",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "hierarchical-notes.md",
          operation: "append",
          targetType: "heading",
          target: "Parent/Child/Grandchild",
          content: "Nested heading content",
          targetDelimiter: "/"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to heading: Parent/Child/Grandchild in file: hierarchical-notes.md')
    ]
  },
  {
    name: "空のファイル名でエラー",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "",
          operation: "append",
          targetType: "heading",
          target: "Section 1",
          content: "Content"
        }
      }
    },
    assertions: [
      response => response.error !== undefined,
      response => response.error.message.includes('Filename must not be empty')
    ]
  },
  {
    name: "日本語ファイル名と見出し",
    request: {
      method: 'tools/call',
      params: {
        name: 'insert_to_file',
        arguments: {
          filename: "日本語ノート.md",
          operation: "append",
          targetType: "heading",
          target: "日本語の見出し",
          content: "日本語のコンテンツ"
        }
      }
    },
    assertions: [
      response => response.result !== undefined,
      response => response.result.content[0].text.includes('Content successfully appended to heading: 日本語の見出し in file: 日本語ノート.md')
    ]
  }
];