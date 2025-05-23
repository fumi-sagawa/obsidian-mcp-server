import { Page } from '@playwright/test';

export class MCPInspectorPage {
  constructor(public readonly page: Page) {}

  async waitForLoad() {
    // MCP Inspector の初期化を待つ
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // React アプリの初期化を待つ
  }

  async connectToSTDIO() {
    try {
      // Transport Type コンボボックス（RadixUI）でSTDIOを選択
      const transportCombo = this.page.getByRole('combobox', { name: 'Transport Type' });
      await transportCombo.click(); // コンボボックスを開く
      await this.page.waitForTimeout(500);
      
      // STDIO オプションをクリック（ドロップダウン内の特定の要素）
      const stdioOption = this.page.getByLabel('STDIO').getByText('STDIO');
      await stdioOption.click();
      await this.page.waitForTimeout(1000);
      
      // Command入力
      const commandInput = this.page.getByRole('textbox', { name: 'Command' });
      await commandInput.fill('node');
      
      // Arguments入力 (絶対パスを使用)
      const argsInput = this.page.getByRole('textbox', { name: 'Arguments' });
      await argsInput.fill('/Users/fumiyasagawa/Development/fumiya/obsidian-mcp-server/build/index.js');
      
      // Connectボタンをクリック
      const connectButton = this.page.getByRole('button', { name: 'Connect' });
      await connectButton.click();
      
      // 接続状態を確認（タイムアウトを短く）
      await this.page.waitForTimeout(5000);
      
    } catch (error) {
      console.log('接続処理でエラーが発生:', error);
      throw error;
    }
  }

  async selectTool(toolName: string) {
    // ツールが表示されるまで待つ
    const toolSelector = this.page.locator(`text=${toolName}`).first();
    await toolSelector.waitFor({ state: 'visible', timeout: 10000 });
    await toolSelector.click();
    await this.page.waitForTimeout(1000);
  }

  async setParameters(params: Record<string, any>) {
    // パラメータ入力エリアを探す
    const parameterInput = this.page.locator('textarea').first();
    await parameterInput.clear();
    await parameterInput.fill(JSON.stringify(params, null, 2));
  }

  async sendRequest() {
    // Send ボタンをクリック
    const sendButton = this.page.locator('button:has-text("Send")').first();
    await sendButton.click();
  }

  async waitForResponse() {
    // レスポンスエリアの表示を待つ（より柔軟なセレクタ）
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle');
  }

  async getResponseText(): Promise<string> {
    // レスポンステキストを取得（複数のセレクタを試行）
    const possibleSelectors = [
      '.response-container',
      '[data-testid="response"]',
      'pre',
      'code'
    ];
    
    for (const selector of possibleSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.count() > 0) {
        return await element.textContent() || '';
      }
    }
    
    return '';
  }

  async checkForError(): Promise<boolean> {
    // エラーメッセージの存在を確認
    const errorPatterns = [
      'text=/error/i',
      'text=/Error/i',
      'text=/failed/i',
      'text=/Failed/i',
      'text=/Connection Error/i'
    ];
    
    for (const pattern of errorPatterns) {
      const elements = this.page.locator(pattern);
      if (await elements.count() > 0) {
        return true;
      }
    }
    
    return false;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}