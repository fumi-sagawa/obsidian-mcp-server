# Debugging Guide for Weather MCP Server

This guide helps you debug and troubleshoot the Weather MCP Server.

## Environment Variables

### Logging Configuration

- `LOG_LEVEL`: Set the minimum log level (default: `info`)
  - Values: `trace`, `debug`, `info`, `warn`, `error`
  - Example: `LOG_LEVEL=debug npm run dev`

- `DEBUG_MODE`: Enable debug mode for verbose logging (default: `false`)
  - Values: `true`, `false`
  - Example: `DEBUG_MODE=true npm run dev`

- `PRETTY_LOGS`: Enable human-readable log format (default: `false` in production)
  - Values: `true`, `false`
  - Automatically enabled in development mode

- `LOG_TIMESTAMPS`: Include timestamps in logs (default: `true`)
  - Values: `true`, `false`

### API Configuration

- `API_TIMEOUT`: Request timeout in milliseconds (default: `30000`)
- `API_RETRY_ATTEMPTS`: Number of retry attempts for failed requests (default: `3`)
- `API_RETRY_DELAY`: Base delay between retries in milliseconds (default: `1000`)
- `NWS_API_BASE_URL`: NWS API base URL (default: `https://api.weather.gov`)
- `NWS_USER_AGENT`: User agent for NWS API requests

## Debug Scripts

### Development Mode
```bash
npm run dev
```
Runs the server with debug logging and pretty output.

### Trace Mode
```bash
npm run dev:trace
```
Runs with maximum verbosity, including trace logs and debug mode.

### MCP Inspector
```bash
npm run inspector
```
Runs the server with MCP Inspector for interactive testing.

### MCP Inspector with Debug
```bash
npm run inspector:debug
```
Runs MCP Inspector with debug logging enabled.

### Test Commands

Test weather alerts:
```bash
npm run test:alerts
```

Test weather forecast:
```bash
npm run test:forecast
```

Test error handling:
```bash
npm run test:error
```

## Error Types

The server uses typed errors for better debugging:

### API Errors
- `API_REQUEST_FAILED`: General API failure
- `API_RESPONSE_INVALID`: Invalid API response format
- `API_TIMEOUT`: Request timeout
- `API_RATE_LIMIT`: Rate limit exceeded

### Validation Errors
- `VALIDATION_FAILED`: General validation failure
- `INVALID_COORDINATES`: Invalid latitude/longitude
- `INVALID_STATE_CODE`: Invalid US state code

### Business Errors
- `NO_ALERTS_FOUND`: No weather alerts for the specified state
- `NO_FORECAST_AVAILABLE`: No forecast data available
- `LOCATION_NOT_SUPPORTED`: Location outside US boundaries

### System Errors
- `SYSTEM_ERROR`: General system error
- `CONFIGURATION_ERROR`: Configuration issue

## Log Levels

### Trace
Most verbose level, includes:
- HTTP request/response details
- Memory usage information
- Detailed execution flow

### Debug
Development information:
- Operation timings
- Configuration details
- Request processing steps

### Info
General information:
- Server startup
- Tool registrations
- Successful operations

### Warn
Warning conditions:
- Retry attempts
- Degraded functionality
- Non-critical errors

### Error
Error conditions:
- Failed operations
- Exceptions
- Critical issues

## Debugging Tips

1. **Enable trace logging** for maximum visibility:
   ```bash
   LOG_LEVEL=trace DEBUG_MODE=true npm run dev
   ```

2. **Use MCP Inspector** for interactive testing:
   ```bash
   npm run inspector:debug
   ```

3. **Check error metadata** - all errors include contextual information:
   - Request IDs for tracing
   - Operation names
   - Input parameters
   - Timestamps

4. **Monitor API interactions** - trace logs show:
   - Full request URLs
   - Response status codes
   - Response sizes
   - Retry attempts

5. **Memory debugging** - in debug mode, memory usage is logged periodically

## Common Issues

### "Location not supported"
- The coordinates are outside US boundaries
- Check latitude/longitude values
- Only US locations are supported by NWS

### "Invalid state code"
- State code must be a valid 2-letter US state abbreviation
- Includes territories: PR, VI, GU, AS, MP

### API Timeouts
- Default timeout is 30 seconds
- Can be increased with `API_TIMEOUT` env var
- Check network connectivity

### Rate Limiting
- NWS API has rate limits
- Server implements automatic retry with backoff
- Check logs for 429 status codes