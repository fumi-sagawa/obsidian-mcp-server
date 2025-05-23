import { test, expect } from '@playwright/test';

test.describe('MCP Inspector 基本UI確認', () => {
  test('ページが正常に読み込まれること', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/MCP Inspector/);
    
    // 初期画面のスクリーンショット
    await page.screenshot({ 
      path: 'e2e/screenshots/basic-ui-load.png',
      fullPage: true 
    });
    
    console.log('基本UI確認テスト完了');
  });

  test('基本要素の存在確認', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // ページ上のすべてのボタンを取得
    const buttons = await page.locator('button').all();
    console.log(`検出されたボタン数: ${buttons.length}`);
    
    // ボタンのテキストを表示
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`ボタン ${i}: "${text}" (表示: ${isVisible})`);
    }
    
    // 入力要素の確認
    const inputs = await page.locator('input').all();
    console.log(`検出された入力要素数: ${inputs.length}`);
    
    const textareas = await page.locator('textarea').all();
    console.log(`検出されたテキストエリア数: ${textareas.length}`);
    
    const selects = await page.locator('select').all();
    console.log(`検出されたセレクト要素数: ${selects.length}`);
    
    // コンボボックスの確認
    const combos = await page.locator('[role="combobox"]').all();
    console.log(`検出されたコンボボックス数: ${combos.length}`);
    
    // スクリーンショット
    await page.screenshot({ 
      path: 'e2e/screenshots/basic-elements.png',
      fullPage: true 
    });
  });
});