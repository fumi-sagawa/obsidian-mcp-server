/**
 * delete-active-file モックテスト
 */
export const deleteActiveFileMockTests = {
  name: 'delete-active-file',
  tests: [
    {
      name: 'delete active file successfully (mock)',
      test: async (runTool) => {
        const result = await runTool('delete-active-file', {});
        
        // 成功メッセージが返ることを確認
        if (!result.content[0].text.includes('deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'handle API error gracefully (mock)',
      test: async (runTool) => {
        // モックサーバーの状態によっては404エラーが返る可能性がある
        const result = await runTool('delete-active-file', {});
        
        // 成功またはエラーメッセージが返ることを確認
        const text = result.content[0].text;
        if (!text.includes('deleted successfully') && !text.includes('Error:')) {
          throw new Error(`Unexpected response: ${text}`);
        }
      }
    }
  ]
};