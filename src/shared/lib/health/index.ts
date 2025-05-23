export * from './types.js';
export { HealthChecker } from './health-checker.js';

// Convenience function for health checks
import { HealthChecker } from './health-checker.js';

export const healthCheck = async () => {
  const checker = HealthChecker.getInstance();
  return checker.checkHealth();
};