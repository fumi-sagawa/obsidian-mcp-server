export interface GetFileRequest {
  filename: string;
}

export interface FileMetadata {
  ctime: number;
  mtime: number;
  size: number;
}

export interface FileContent {
  content: string;
  path: string;
  frontmatter: Record<string, unknown>;
  tags: string[];
  stat: FileMetadata;
}

export interface GetFileResponse {
  content: string;
  metadata?: FileMetadata;
}

export interface GetFileJsonResponse extends FileContent {}