#!/usr/bin/env node
import { metrics } from '../shared/lib/metrics/index.js';

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function printDashboard() {
  console.clear();
  const snapshot = metrics.getSnapshot();
  const systemInfo = metrics.getSystemInfo();
  
  console.log('='.repeat(60));
  console.log('Obsidian MCP Server - Metrics Dashboard');
  console.log('='.repeat(60));
  console.log(`Last Updated: ${new Date().toISOString()}`);
  console.log();
  
  // System Information
  console.log('📊 System Information');
  console.log('-'.repeat(60));
  console.log(`Platform: ${systemInfo.platform} (${systemInfo.arch})`);
  console.log(`Node Version: ${systemInfo.nodeVersion}`);
  console.log(`CPUs: ${systemInfo.cpuCount}`);
  console.log(`Memory: ${(systemInfo.freeMemory / systemInfo.totalMemory * 100).toFixed(1)}% free`);
  console.log(`Load Average: ${systemInfo.loadAverage.map(l => l.toFixed(2)).join(', ')}`);
  console.log();
  
  // System Metrics
  console.log('💻 System Metrics');
  console.log('-'.repeat(60));
  console.log(`CPU Usage: ${snapshot.system.cpuUsage.toFixed(1)}%`);
  console.log(`Heap Used: ${(snapshot.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Heap Total: ${(snapshot.system.memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`RSS: ${(snapshot.system.memoryUsage.rss / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Uptime: ${formatDuration(snapshot.system.uptime * 1000)}`);
  console.log();
  
  // Request Metrics
  console.log('📈 Request Metrics');
  console.log('-'.repeat(60));
  
  // Calculate totals from counters
  let totalRequests = 0;
  let totalErrors = 0;
  const requestsByTool: Record<string, number> = {};
  
  if (snapshot.counters['mcp.requests.total']) {
    for (const metric of snapshot.counters['mcp.requests.total']) {
      totalRequests += metric.value;
      if (metric.labels?.tool) {
        requestsByTool[metric.labels.tool] = (requestsByTool[metric.labels.tool] || 0) + metric.value;
      }
    }
  }
  
  if (snapshot.counters['mcp.requests.errors']) {
    for (const metric of snapshot.counters['mcp.requests.errors']) {
      totalErrors += metric.value;
    }
  }
  
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Error Rate: ${totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00'}%`);
  console.log();
  
  if (Object.keys(requestsByTool).length > 0) {
    console.log('Requests by Tool:');
    for (const [tool, count] of Object.entries(requestsByTool)) {
      console.log(`  ${tool}: ${count}`);
    }
    console.log();
  }
  
  // Response Time Metrics
  if (snapshot.histograms['mcp.request.duration'] && snapshot.histograms['mcp.request.duration'].count > 0) {
    const stats = snapshot.histograms['mcp.request.duration'];
    console.log('⏱️  Response Times');
    console.log('-'.repeat(60));
    console.log(`Mean: ${formatDuration(stats.mean)}`);
    console.log(`P50: ${formatDuration(stats.p50)}`);
    console.log(`P90: ${formatDuration(stats.p90)}`);
    console.log(`P95: ${formatDuration(stats.p95)}`);
    console.log(`P99: ${formatDuration(stats.p99)}`);
    console.log();
  }
  
  
  console.log('\n' + '='.repeat(60));
}

// Run dashboard
if (process.argv.includes('--watch')) {
  // Update every 5 seconds
  setInterval(printDashboard, 5000);
  printDashboard();
} else {
  printDashboard();
}