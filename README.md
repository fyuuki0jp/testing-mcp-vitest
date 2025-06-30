# Test Code Generator MCP Server

An MCP server that generates Vitest test code based on boundary value analysis and equivalence partitioning from JSON specifications.

## Features

- **Boundary Value Analysis**: Automatically generates boundary values and their adjacent values for continuous ranges
- **Multiple Range Support**: Handles discontinuous valid ranges (e.g., 0-10, 20-30, 40-50)
- **Equivalence Partitioning**: Includes all valid and invalid values from categorical data
- **Pairwise Testing**: Generates efficient test combinations using pairwise method
- **Vitest Format**: Generates clean test code using `test.each` pattern
- **Specification Guide**: Provides prompts to help create JSON specifications
- **Language-Optimized**: All processing and output in English for optimal LLM performance

## Quick Start

### Using npx (No installation required)

```bash
# Run directly with npx
npx testing-mcp-vitest

# Configure Claude Desktop as shown below
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## Installation

### Using npx (Recommended)

```bash
npx testing-mcp-vitest
```

### Local Installation

```bash
# Clone repository
git clone <repository-url>
cd test-code-generator-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Usage

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "test-generator": {
      "command": "npx",
      "args": ["testing-mcp-vitest"]
    }
  }
}
```

Config file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Available Tools

#### 1. generate-test-code
Generates test code from JSON specification.

#### 2. Prompts
- `create-test-spec`: Explains how to create test specifications
- `boundary-value-example`: Provides boundary value analysis examples
- `equivalence-class-example`: Provides equivalence partitioning examples

### Specification Format

Basic structure with single range:

```json
{
  "type": "model",
  "name": "UserRegistration",
  "columns": [
    {
      "name": "age",
      "type": "number",
      "valueType": "continues",
      "values": {
        "min": 18,
        "max": 120
      }
    },
    {
      "name": "userType",
      "type": "string",
      "valueType": "category",
      "values": {
        "valid": ["admin", "user", "guest"],
        "invalid": ["superuser", "root", ""]
      }
    }
  ]
}
```

Multiple ranges example:

```json
{
  "name": "workHours",
  "type": "number",
  "valueType": "continues",
  "values": {
    "ranges": [
      { "min": 9, "max": 12 },   // Morning shift
      { "min": 14, "max": 18 }   // Afternoon shift
    ]
  }
}
```

### Generated Test Code Example

```typescript
import { describe, test, expect } from 'vitest';

describe('Tests for UserRegistration', () => {
  // Valid cases
  test.each([
    { inputs: { age: 18, userType: "admin" }, description: 'Combination 1: Valid case' },
    { inputs: { age: 69, userType: "user" }, description: 'Combination 2: Valid case' },
    { inputs: { age: 120, userType: "guest" }, description: 'Combination 3: Valid case' },
    // ... more test cases
  ])('Valid case: $description', ({ inputs }) => {
    // TODO: Import the function or model to test
    // import { UserRegistration } from './path/to/UserRegistration';

    // TODO: Execute the test subject
    // const result = UserRegistration(inputs);

    // TODO: Check expected values
    // expect(result).toBeDefined();
    // expect(result.error).toBeUndefined();
  });

  // Invalid cases
  test.each([
    { inputs: { age: 17, userType: "admin" }, description: 'Combination 4: Invalid case' },
    { inputs: { age: 121, userType: "user" }, description: 'Combination 5: Invalid case' },
    { inputs: { age: 50, userType: "superuser" }, description: 'Combination 6: Invalid case' },
    { inputs: { age: 50, userType: "root" }, description: 'Combination 7: Invalid case' },
    { inputs: { age: 50, userType: "" }, description: 'Combination 8: Invalid case' },
    // ... more test cases
  ])('Invalid case: $description', ({ inputs }) => {
    // TODO: Import the function or model to test
    // import { UserRegistration } from './path/to/UserRegistration';

    // TODO: Verify that an error occurs
    // expect(() => UserRegistration(inputs)).toThrow();
    // or
    // const result = UserRegistration(inputs);
    // expect(result.error).toBeDefined();
  });
});
```

## Key Features

### Full Coverage
- All valid and invalid equivalence class values are included in test cases
- Boundary values include: min-1, min, min+1, middle, max-1, max, max+1
- For multiple ranges, includes gap values between ranges

### Efficient Combinations
- 3 or fewer parameters: generates all combinations
- 4 or more parameters: uses pairwise method for efficiency

### Multiple Range Support
Useful for:
- Working hours (9-12, 14-18)
- Valid scores (0-40 passing, 60-100 honors)
- Temperature ranges (different valid ranges for different conditions)
- Time slots (morning, afternoon, evening sessions)

## Examples

See the `examples/` directory for more specification examples:
- `user-registration.json` - Basic model validation
- `calculate-discount.json` - Business logic with multiple parameters
- `multi-range-validation.json` - Complex scheduling with multiple ranges
- `japanese-postal-code.json` - Regional validation patterns

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Production mode
npm start

# Debug mode
DEBUG=1 npm start
```

## Publishing to npm

```bash
# Build and publish
npm publish
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](./LICENSE) for details

## Support

- GitHub Issues: [Report bugs or request features](<repository-url>/issues)
- Discussions: [Ask questions or share ideas](<repository-url>/discussions)
