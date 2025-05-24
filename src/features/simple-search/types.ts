/**
 * simple_searchツールの型定義
 */

export interface SimpleSearchRequest {
  query: string;
  contextLength?: number;
}

export interface SearchMatch {
  match: {
    start: number;
    end: number;
  };
  context: string;
}

export interface SearchResult {
  filename: string;
  matches: SearchMatch[];
  score: number;
}

export interface SimpleSearchResponse {
  results: SearchResult[];
}

export interface SimpleSearchError {
  error: string;
  code: string;
  details?: string;
}