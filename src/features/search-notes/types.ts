/**
 * search_notes ツールの型定義
 * JsonLogic クエリ文字列による高度検索機能
 * OpenAPI仕様書 `/search/` エンドポイント（JsonLogic）に基づく
 */

/**
 * search_notes ツールのリクエスト型
 */
export interface SearchNotesRequest {
  /** JsonLogic クエリ（JSON文字列） */
  jsonLogicQuery: string;
}

/**
 * 検索結果の個別アイテム型
 * OpenAPI仕様書の response schema に基づく
 */
export interface SearchResultItem {
  /** マッチしたファイルのパス */
  filename: string;
  
  /** 
   * クエリ結果
   * oneOf: string | number | array | object | boolean
   */
  result: string | number | Array<any> | Record<string, any> | boolean;
}

/**
 * API レスポンス型
 */
export type SearchNotesResponse = SearchResultItem[];

/**
 * よく使用される検索パターンのサンプル（文字列形式）
 */

/** タグで検索するクエリのサンプル */
export const TAG_SEARCH_EXAMPLE = '{"in": ["project", {"var": "tags"}]}';

/** フロントマターのフィールドで検索するクエリのサンプル */
export const FRONTMATTER_SEARCH_EXAMPLE = '{"==": [{"var": "frontmatter.status"}, "published"]}';

/** ファイル名のglobパターンで検索するクエリのサンプル */
export const GLOB_SEARCH_EXAMPLE = '{"glob": ["2024*.md", {"var": "path"}]}';

/** 正規表現で検索するクエリのサンプル */
export const REGEXP_SEARCH_EXAMPLE = '{"regexp": ["^# .*Project.*", {"var": "content"}]}';

/** 複合条件（AND）のサンプル */
export const AND_SEARCH_EXAMPLE = '{"and": [{"in": ["important", {"var": "tags"}]}, {"glob": ["2024*.md", {"var": "path"}]}]}';

/** 複合条件（OR）のサンプル */
export const OR_SEARCH_EXAMPLE = '{"or": [{"in": ["urgent", {"var": "tags"}]}, {"in": ["important", {"var": "tags"}]}]}';

/**
 * エラーレスポンス型
 */
export interface ErrorResponse {
  /** 5桁のエラーコード */
  errorCode: number;
  /** エラーの説明メッセージ */
  message: string;
}

/**
 * MCP ツールのレスポンス型
 */
export type SearchNotesResult = {
  success: true;
  data: SearchNotesResponse;
} | {
  success: false;
  error: ErrorResponse;
};

/**
 * ノートのメタデータ型（参考用）
 * JsonLogic の { "var": "..." } で参照可能なフィールド
 */
export interface NoteMetadata {
  /** ファイルのパス */
  path: string;
  /** ファイルの内容 */
  content: string;
  /** フロントマターのオブジェクト */
  frontmatter: Record<string, any>;
  /** タグの配列 */
  tags: string[];
  /** ファイル統計情報 */
  stat: {
    /** 作成時刻（Unix timestamp） */
    ctime: number;
    /** 更新時刻（Unix timestamp） */
    mtime: number;
    /** ファイルサイズ（バイト） */
    size: number;
  };
}