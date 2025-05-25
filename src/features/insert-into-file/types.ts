export type Operation = 'append' | 'prepend' | 'replace';
export type TargetType = 'heading' | 'block' | 'frontmatter';

export interface InsertIntoFileParams {
  filename: string;
  operation: Operation;
  targetType: TargetType;
  target: string;
  content: string;
  targetDelimiter?: string;
  trimTargetWhitespace?: boolean;
  createTargetIfMissing?: boolean;
  contentType?: 'text/markdown' | 'application/json';
}

export interface PatchFileHeaders {
  'Operation': Operation;
  'Target-Type': TargetType;
  'Target': string;
  'Target-Delimiter'?: string;
  'Trim-Target-Whitespace'?: string;
  'Create-Target-If-Missing'?: string;
  'Content-Type'?: string;
}

export interface InsertIntoFileResponse {
  success: boolean;
  message?: string;
}