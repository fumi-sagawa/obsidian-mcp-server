# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Weather MCP Server** that provides weather information through the Model Context Protocol (MCP). It connects to the US National Weather Service API to fetch weather alerts and forecasts.

## Commands

### Build
```bash
npm run build
```
Compiles TypeScript files to JavaScript and sets executable permissions on the output.

### Development
```bash
npm install    # Install dependencies
npm run build  # Build the project
```

## Architecture Philosophy - Feature-Sliced Design (FSD)

This project follows Feature-Sliced Design principles for maintainable architecture:

### Current Structure
```
src/
├── index.ts          # Entry point (app layer)
```

### Target FSD Structure
When expanding this project, organize code following these layers:

```
src/
├── app/              # Application initialization, MCP server setup
├── features/         # Weather-related features (alerts, forecasts)
├── entities/         # Weather domain models (Alert, Forecast)
├── shared/           # Common utilities, API clients, types
```

### FSD Principles to Follow

1. **Isolation**: Each module should be independent
   - Weather features should not directly import from each other
   - Use explicit public APIs for module communication

2. **Explicit Dependencies**: Import only from lower layers
   - `app` → `features` → `entities` → `shared`
   - Never import from the same or higher layers

3. **Public API**: Each module exposes a clear public interface
   - Create `index.ts` files as public API entry points
   - Keep internal implementation details private

### Refactoring Guidelines

When refactoring the current monolithic `index.ts`:

1. **Extract to `shared/`**:
   - NWS API client functions
   - Common types and interfaces
   - Error handling utilities

2. **Create `entities/`**:
   - Weather alert models
   - Forecast data structures
   - Domain validation logic

3. **Build `features/`**:
   - `features/get-alerts/` - Alert fetching logic
   - `features/get-forecast/` - Forecast retrieval logic
   - Each feature should have its own schema validation

4. **Keep in `app/`**:
   - MCP server initialization
   - Tool registration
   - Top-level error handling

## Testing Approach

No test framework is currently configured. When implementing tests:
- Test each FSD layer independently
- Mock dependencies between layers
- Focus on public API testing