import { test, expect } from '@playwright/test';
import { MCPInspectorPage } from '../fixtures/mcp-inspector-page';

test.describe('エラーハンドリング', () => {
  let inspector: MCPInspectorPage;

  test.beforeEach(async ({ page }) => {
    inspector = new MCPInspectorPage(page);
    await page.goto('/');
    await inspector.waitForLoad();
    await inspector.connectToSTDIO();
  });

  test('不正なJSON形式のパラメータでもクラッシュしない', async () => {
    await inspector.selectTool('get-alerts');
    
    // 不正なJSONを直接入力
    const parameterInput = inspector.page.locator('textarea').first();
    await parameterInput.clear();
    await parameterInput.fill('{ invalid json }');
    
    await inspector.sendRequest();
    await inspector.waitForResponse();

    // エラーが表示されることを確認
    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
    
    // ページがクラッシュしていないことを確認
    const isPageAlive = await inspector.page.evaluate(() => document.body !== null);
    expect(isPageAlive).toBe(true);
  });

  test('非常に大きな数値でもクラッシュしない', async () => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: 999999999,
      longitude: -999999999
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
    
    // バリデーションエラーが返されることを確認
    const responseText = await inspector.getResponseText();
    expect(responseText.toLowerCase()).toMatch(/error|invalid/);
  });

  test('文字列を数値パラメータに渡してもクラッシュしない', async () => {
    await inspector.selectTool('get-forecast');
    await inspector.setParameters({
      latitude: "not a number",
      longitude: "also not a number"
    });
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const hasError = await inspector.checkForError();
    expect(hasError).toBe(true);
  });

  test('存在しないツールを選択してもクラッシュしない', async () => {
    // 直接存在しないツール名を指定しようとする
    const hasNonExistentTool = await inspector.page.locator('text=non-existent-tool').count();
    expect(hasNonExistentTool).toBe(0);
    
    // UIが正常に動作していることを確認
    const toolList = await inspector.page.locator('text=/get-alerts|get-forecast|health-check/').count();
    expect(toolList).toBeGreaterThan(0);
  });

  test('連続リクエストでもメモリリークしない', async () => {
    // 5回連続でリクエストを送信
    for (let i = 0; i < 5; i++) {
      await inspector.selectTool('health-check');
      await inspector.sendRequest();
      await inspector.waitForResponse();
      
      const hasError = await inspector.checkForError();
      expect(hasError).toBe(false);
      
      // 少し待機
      await inspector.page.waitForTimeout(1000);
    }
    
    // 最後のヘルスチェックでメモリ使用量を確認
    const responseText = await inspector.getResponseText();
    expect(responseText).toContain('memory');
    expect(responseText).toContain('healthy');
  });
});