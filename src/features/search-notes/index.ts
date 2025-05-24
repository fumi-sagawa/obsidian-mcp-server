/**
 * search_notes ツールのエクスポート
 */

export { searchNotesHandler, searchNotesCore } from './search-notes-handler.js';
export { searchNotesTool, searchNotesSchema } from './schema.js';
export type { 
  SearchNotesRequest, 
  SearchNotesResponse, 
  SearchNotesResult,
  SearchResultItem,
  NoteMetadata,
  ErrorResponse
} from './types.js';

export {
  TAG_SEARCH_EXAMPLE,
  FRONTMATTER_SEARCH_EXAMPLE,
  GLOB_SEARCH_EXAMPLE,
  REGEXP_SEARCH_EXAMPLE,
  AND_SEARCH_EXAMPLE,
  OR_SEARCH_EXAMPLE
} from './types.js';