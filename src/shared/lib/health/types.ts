export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

export interface HealthCheck {
  name: string;
  check(): Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  duration: number;
  timestamp: number;
  details?: Record<string, any>;
}

export interface SystemHealth {
  status: HealthStatus;
  timestamp: number;
  checks: Record<string, HealthCheckResult>;
  metrics?: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: number;
  };
}