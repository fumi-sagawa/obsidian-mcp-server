import { nwsApi } from '../../../api/index.js';
import type { HealthCheck, HealthCheckResult } from '../types.js';
import { HealthStatus } from '../types.js';

export class NWSAPIHealthCheck implements HealthCheck {
  name = 'nws-api';
  private testCoordinates = { lat: 39.7456, lon: -97.0892 }; // Geographic center of US

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      // Try to fetch a simple endpoint to verify connectivity
      const response = await fetch(
        `https://api.weather.gov/points/${this.testCoordinates.lat},${this.testCoordinates.lon}`,
        {
          headers: {
            'User-Agent': '(weather-mcp-server, contact@example.com)'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );

      const duration = Date.now() - start;

      if (response.ok) {
        return {
          status: HealthStatus.HEALTHY,
          message: 'NWS API is accessible',
          duration,
          timestamp: Date.now(),
          details: {
            statusCode: response.status,
            endpoint: 'points'
          }
        };
      } else if (response.status >= 500) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: `NWS API returned server error: ${response.status}`,
          duration,
          timestamp: Date.now(),
          details: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      } else {
        return {
          status: HealthStatus.DEGRADED,
          message: `NWS API returned unexpected status: ${response.status}`,
          duration,
          timestamp: Date.now(),
          details: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch (error) {
      const duration = Date.now() - start;
      
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Failed to connect to NWS API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration,
        timestamp: Date.now(),
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
}