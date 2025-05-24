import type { SearchResult } from './types.js';

/**
 * 検索結果を人間が読みやすい形式にフォーマットする
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '検索結果が見つかりませんでした。';
  }

  const formattedResults = results.map((result, index) => {
    const header = `## ${index + 1}. ${result.filename} (スコア: ${result.score.toFixed(2)})`;
    
    const matches = result.matches.map((match, matchIndex) => {
      const contextWithHighlight = highlightMatch(
        match.context,
        match.match.start,
        match.match.end
      );
      return `   ${matchIndex + 1}. ${contextWithHighlight}`;
    }).join('\n');

    return `${header}\n${matches}`;
  }).join('\n\n');

  const summary = `検索結果: ${results.length}件のファイルが見つかりました。\n\n`;
  
  return summary + formattedResults;
}

/**
 * マッチ部分をハイライトする
 */
function highlightMatch(context: string, start: number, end: number): string {
  // コンテキスト内でのマッチ位置を計算
  const beforeMatch = context.substring(0, start);
  const match = context.substring(start, end);
  const afterMatch = context.substring(end);
  
  return `${beforeMatch}**${match}**${afterMatch}`;
}

/**
 * ファイル名ごとにグループ化した結果を返す
 */
export function groupResultsByFile(results: SearchResult[]): Map<string, SearchResult> {
  const grouped = new Map<string, SearchResult>();
  
  for (const result of results) {
    grouped.set(result.filename, result);
  }
  
  return grouped;
}

/**
 * スコアの高い順にソート
 */
export function sortResultsByScore(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => b.score - a.score);
}