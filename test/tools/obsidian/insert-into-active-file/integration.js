// 実際のObsidian APIとの統合テスト
export const tests = [
  {
    name: 'insert-into-active-file - 実際のAPIとの統合テスト',
    tool: 'insert-into-active-file',
    args: {
      operation: 'append',
      targetType: 'heading',
      target: '# Test Heading',
      content: 'Integration test content'
    },
    expectedSuccess: true,
    validate: (result) => {
      return result.content[0].text.includes('Content successfully appended');
    }
  }
];