/**
 * delete-active-file 統合テスト（実APIサーバー用）
 */
export const testCases = {
  name: 'delete_active_file',
  tests: [
    {
      name: 'delete active file successfully',
      test: async (runTool) => {
        // 注意: このテストは破壊的操作のため、実行には注意が必要
        // テスト用のダミーファイルがアクティブになっていることを前提とする
        const result = await runTool('delete-active-file', {});
        
        // 成功メッセージが返ることを確認
        if (!result.content[0].text.includes('deleted successfully')) {
          throw new Error(`Expected success message but got: ${result.content[0].text}`);
        }
      }
    },
    {
      name: 'handle no active file error',
      test: async (runTool) => {
        // 注意: アクティブファイルがない状態でテストする必要がある
        // 前のテストで削除済みの場合、このテストが成功する
        const result = await runTool('delete-active-file', {});
        
        if (!result.content[0].text.includes('Error:')) {
          throw new Error(`Expected error but got: ${result.content[0].text}`);
        }
      }
    }
  ]
};