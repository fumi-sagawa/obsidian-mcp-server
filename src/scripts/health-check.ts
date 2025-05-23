#!/usr/bin/env node
import { healthCheck, HealthStatus } from '../shared/lib/health/index.js';
import { metrics } from '../shared/lib/metrics/index.js';

async function runHealthCheck() {
  console.log('Running health check...\n');
  
  try {
    const health = await healthCheck();
    const metricsSnapshot = metrics.getSnapshot();
    
    // Print health status
    console.log(`Overall Status: ${health.status}`);
    console.log(`Timestamp: ${new Date(health.timestamp).toISOString()}`);
    console.log('\nHealth Checks:');
    
    for (const [name, result] of Object.entries(health.checks)) {
      const statusEmoji = result.status === HealthStatus.HEALTHY ? '✅' : 
                         result.status === HealthStatus.DEGRADED ? '⚠️' : '❌';
      console.log(`  ${statusEmoji} ${name}: ${result.status} (${result.duration}ms)`);
      if (result.message) {
        console.log(`     ${result.message}`);
      }
    }
    
    if (health.metrics) {
      console.log('\nSystem Metrics:');
      console.log(`  Uptime: ${Math.floor(health.metrics.uptime / 60)} minutes`);
      console.log(`  Memory: ${health.metrics.memory.percentage}% used`);
      console.log(`  CPU: ${health.metrics.cpu}%`);
    }
    
    // Print key metrics
    console.log('\nKey Metrics:');
    const requestsMetrics = metricsSnapshot.counters['mcp.requests.total'] || [];
    const requestsTotal = requestsMetrics.reduce((sum, metric) => sum + metric.value, 0);
    
    const errorsMetrics = metricsSnapshot.counters['mcp.requests.errors'] || [];
    const errorsTotal = errorsMetrics.reduce((sum, metric) => sum + metric.value, 0);
    
    console.log(`  Total Requests: ${requestsTotal}`);
    console.log(`  Total Errors: ${errorsTotal}`);
    
    if (requestsTotal > 0) {
      console.log(`  Error Rate: ${((errorsTotal / requestsTotal) * 100).toFixed(2)}%`);
    }
    
    // Exit with appropriate code
    process.exit(health.status === HealthStatus.HEALTHY ? 0 : 1);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(2);
  }
}

runHealthCheck();