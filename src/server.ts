import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerToolHandlers } from "./handlers/tools";
import { registerPromptHandlers } from "./handlers/prompts";

export function createServer() {
  const server = new Server(
    {
      name: "test-code-generator",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  // Register handlers
  registerToolHandlers(server);
  registerPromptHandlers(server);

  return server;
}

export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Silent start for cleaner npx experience
  if (process.env.DEBUG) {
    console.error("Test Code Generator MCP Server is running");
  }
}