import { test, expect } from '@playwright/test';
import { MCPInspectorPage } from '../fixtures/mcp-inspector-page';

test.describe('ヘルスチェック機能', () => {
  let inspector: MCPInspectorPage;

  test.beforeEach(async ({ page }) => {
    inspector = new MCPInspectorPage(page);
    await page.goto('/');
    await inspector.waitForLoad();
    await inspector.connectToSTDIO();
  });

  test('正常系: ヘルスチェックが成功する', async ({ page }) => {
    await inspector.selectTool('health-check');
    // ヘルスチェックはパラメータ不要
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    
    // ヘルスステータスが含まれることを確認
    expect(responseText.toLowerCase()).toContain('healthy');
    
    // メモリチェックとAPIチェックの結果が含まれることを確認
    expect(responseText).toContain('memory');
    expect(responseText).toContain('nws_api');
    
    // エラーが発生していないことを確認
    const hasError = await inspector.checkForError();
    expect(hasError).toBe(false);
  });

  test('レスポンス構造の確認', async ({ page }) => {
    await inspector.selectTool('health-check');
    await inspector.sendRequest();
    await inspector.waitForResponse();

    const responseText = await inspector.getResponseText();
    
    // 必須フィールドの存在を確認
    expect(responseText).toContain('status');
    expect(responseText).toContain('checks');
    expect(responseText).toContain('details');
  });
});