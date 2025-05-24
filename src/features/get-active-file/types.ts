export interface GetActiveFileResponse {
  content: string;
  frontmatter: Record<string, unknown>;
  path: string;
  stat: {
    ctime: number;
    mtime: number;
    size: number;
  };
  tags: string[];
}

export interface HandlerDependencies {
  obsidianApi: {
    getActiveFile: () => Promise<GetActiveFileResponse>;
  };
  logger: {
    debug: (message: string, context?: unknown) => void;
    error: (message: string, error: unknown) => void;
  };
}