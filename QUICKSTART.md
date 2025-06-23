# Quick Start Guide

## Using with npx (No installation required)

### 1. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "test-generator": {
      "command": "npx",
      "args": ["@test-generator/mcp-vitest"]
    }
  }
}
```

Location of config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### 2. Restart Claude Desktop

### 3. Use the tools

#### Generate test code:
1. Ask Claude: "Generate test code for my UserRegistration model"
2. Provide your JSON specification when prompted

#### Learn specification format:
- Ask: "How do I create a test specification?"
- Ask: "Show me boundary value examples"
- Ask: "Show me equivalence class examples"

## Example Specification

```json
{
  "type": "model",
  "name": "UserAge",
  "columns": [
    {
      "name": "age",
      "type": "number",
      "valueType": "continues",
      "values": {
        "min": 18,
        "max": 65
      }
    }
  ]
}
```

This will generate tests for:
- Invalid: 17 (below minimum)
- Valid: 18, 19, 41, 64, 65
- Invalid: 66 (above maximum)

## Multiple Ranges Example

```json
{
  "name": "workingHours",
  "type": "number",
  "valueType": "continues",
  "values": {
    "ranges": [
      { "min": 9, "max": 12 },
      { "min": 14, "max": 18 }
    ]
  }
}
```

This handles discontinuous valid ranges (morning and afternoon shifts).