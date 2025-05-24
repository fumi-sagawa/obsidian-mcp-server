export interface CommandExecutionRequest {
  commandId: string;
}

export interface CommandExecutionResponse {
  success: boolean;
  message?: string;
}

export interface CommandExecutionError {
  error: string;
  code: string;
}