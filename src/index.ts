#!/usr/bin/env node

import { startServer } from "./server";

// Start the server
startServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});