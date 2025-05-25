export const testCases = [
  {
    name: 'Vaultルートファイル一覧の取得',
    request: {
      method: 'tools/call',
      params: {
        name: 'list_vault_files',
        arguments: {}
      }
    },
    assertions: [
      response => {
        // レスポンスの基本構造を確認
        if (!response.result || !response.result.content || !Array.isArray(response.result.content)) {
          return false;
        }
        return response.result.content.some(item => 
          item.type === 'text' && 
          item.text.includes('📁 Vault Files')
        );
      },
      response => {
        // テキストコンテンツに期待される要素が含まれているか確認
        const textContent = response.result.content.find(item => item.type === 'text');
        if (!textContent) return false;
        
        const text = textContent.text;
        return (
          // ヘッダーとセパレーター
          text.includes('📁 Vault Files') &&
          text.includes('=============') &&
          // 統計情報
          (text.includes('📊 Total:') || text.includes('🔍 Vault is empty'))
        );
      }
    ]
  }
];