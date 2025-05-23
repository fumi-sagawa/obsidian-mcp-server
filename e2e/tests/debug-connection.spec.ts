import { test, expect } from '@playwright/test';

test.describe('MCP Inspector 接続デバッグ', () => {
  test('STDIO設定画面の詳細確認', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 初期画面のスクリーンショット
    await page.screenshot({ 
      path: 'e2e/screenshots/initial-ui.png',
      fullPage: true 
    });
    
    // STDIO ボタンをクリック
    await page.click('button:has-text("STDIO")');
    await page.waitForTimeout(2000);
    
    // STDIO設定画面のスクリーンショット
    await page.screenshot({ 
      path: 'e2e/screenshots/stdio-config.png',
      fullPage: true 
    });
    
    // Connect ボタンを強制クリック
    const connectButton = page.locator('button:has-text("Connect")');
    console.log('Connectボタンをクリック試行...');
    try {
      await connectButton.click({ force: true, timeout: 5000 });
      console.log('Connectボタンのクリック成功');
      
      await page.waitForTimeout(5000);
      
      // 接続後のスクリーンショット
      await page.screenshot({ 
        path: 'e2e/screenshots/after-connect.png',
        fullPage: true 
      });
      
      // ツール一覧の確認
      const tools = await page.locator('text=/get-alerts|get-forecast|health-check/').all();
      console.log(`利用可能なツール数: ${tools.length}`);
      
      // すべてのボタンを確認
      const allButtons = await page.locator('button').all();
      console.log(`ボタン数: ${allButtons.length}`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        console.log(`ボタン ${i}: "${text}"`);
      }
      
    } catch (error) {
      console.log('Connectボタンのクリック失敗:', error);
    }
  });
});