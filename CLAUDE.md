# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**testing-mcp-vitest** is an MCP (Model Context Protocol) server that generates Vitest test code using systematic testing methodologies. It integrates with Claude Desktop to help developers create comprehensive test suites.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (runs TypeScript directly with tsx)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run the built application
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Debug mode
DEBUG=1 npm start

# Publish to npm (builds automatically)
npm publish
```

## Architecture

### Core Structure
- **`src/index.ts`** - Main entry point (minimal)
- **`src/server.ts`** - MCP server setup and configuration
- **`src/types.ts`** - TypeScript interfaces and type definitions
- **`src/schemas.ts`** - Zod validation schemas
- **`src/generators/`** - Test generation modules (boundary values, equivalence classes, pairwise, Vitest code)
- **`src/utils/`** - Utility functions (validation, cartesian product)
- **`src/handlers/`** - MCP request handlers (tools, prompts)
- **`tests/`** - Comprehensive test suite with 51 tests and good coverage
- **ES Modules** - Project uses `"type": "module"` configuration
- **TypeScript** - Strict mode enabled, targets ES2022, bundler module resolution

### Key Technologies
- **@modelcontextprotocol/sdk** - MCP integration for Claude Desktop
- **zod** - Runtime validation for JSON specifications
- **Vitest** - Both target framework (generates test code) and testing framework for this project
- **TypeScript** - Strict typing with bundler module resolution (no .js extensions needed in imports)

### Test Generation Methods
1. **Boundary Value Analysis** - Generates min-1, min, min+1, middle, max-1, max, max+1
2. **Equivalence Partitioning** - Includes all valid/invalid categorical values
3. **Pairwise Testing** - Efficient combinations for 4+ parameters
4. **Multiple Range Support** - Handles discontinuous valid ranges

### MCP Tools Exposed
- `generate-test-code` - Main tool that accepts JSON specifications
- Prompts: `create-test-spec`, `boundary-value-example`, `equivalence-class-example`

## Testing Approach

This project both **generates** test code and has its own comprehensive test suite:

### Running Tests
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Test Structure
- **Unit Tests**: All core modules are thoroughly tested (51 tests total)
- **Coverage**: Good coverage across generators, utils, and core functionality
- **Test Files**: Located in `tests/` directory, mirroring `src/` structure

### When modifying test generation logic:
1. Run the test suite: `npm test`
2. Build the project: `npm run build`
3. Verify generated output manually with sample specifications
4. Ensure all tests pass and coverage remains good

## NPM Package

Published as `testing-mcp-vitest` on npm registry. The package:
- Includes CLI executable via bin field
- Can be run directly with `npx testing-mcp-vitest`
- Requires Node.js >=16.0.0

## Important Notes

- The server processes all input/output in English for optimal LLM performance
- Generated tests use `test.each` pattern for efficient test organization
- Multiple ranges in specifications are useful for scheduling, score bands, or time slots
- The postbuild script ensures proper executable permissions on Unix systems