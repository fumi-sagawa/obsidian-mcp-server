# Weather MCP Server

A Model Context Protocol (MCP) server that provides real-time weather information from the US National Weather Service API.

## Features

- **Weather Alerts**: Get current weather alerts for any US state
- **Weather Forecasts**: Retrieve detailed forecasts for specific coordinates
- **MCP Integration**: Seamlessly integrates with MCP-compatible AI assistants

## Installation

```bash
npm install
npm run build
```

## Usage

This server implements the MCP protocol and can be used with any MCP-compatible client.

### Available Tools

#### `get-alerts`
Fetches current weather alerts for a specified US state.

**Parameters:**
- `state` (string, required): Two-letter US state code (e.g., "CA", "NY")

**Example Response:**
```json
[
  {
    "title": "Flood Warning",
    "description": "...FLOOD WARNING IN EFFECT...",
    "severity": "Severe",
    "certainty": "Observed",
    "urgency": "Immediate",
    "areas": "Los Angeles County"
  }
]
```

#### `get-forecast`
Retrieves weather forecast for specific coordinates.

**Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate

**Example Response:**
```json
[
  {
    "name": "Today",
    "temperature": 72,
    "temperatureUnit": "F",
    "windSpeed": "10 mph",
    "shortForecast": "Partly Cloudy",
    "detailedForecast": "Partly cloudy with a high near 72..."
  }
]
```

## Architecture

This project follows [Feature-Sliced Design (FSD)](https://feature-sliced.design/) principles for scalable architecture.

### Project Structure

```
src/
├── index.ts          # Application entry point
build/                # Compiled output
```

### Future Structure (FSD)

As the project grows, it will be organized into:

- **app/** - Application bootstrap and configuration
- **features/** - Business features (weather alerts, forecasts)
- **entities/** - Domain models (Alert, Forecast)
- **shared/** - Common utilities and API clients

## Development

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript and sets proper executable permissions.

### Running

The server communicates via stdio and is designed to be launched by an MCP client.

## API Integration

This server uses the [weather.gov API](https://www.weather.gov/documentation/services-web-api) from the US National Weather Service. No API key is required.

## Requirements

- Node.js 16+
- TypeScript 5+

## License

MIT