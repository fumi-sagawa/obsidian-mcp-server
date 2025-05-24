export { simpleSearchHandler } from './simple-search-handler.js';
export { formatSearchResults, groupResultsByFile, sortResultsByScore } from './format-results.js';
export type { 
  SimpleSearchRequest, 
  SimpleSearchResponse, 
  SearchResult, 
  SearchMatch,
  SimpleSearchError 
} from './types.js';