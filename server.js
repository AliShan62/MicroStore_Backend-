const app = require("./app");
const connectDatabase = require("./db/Database");

// Load environment variables
require("dotenv").config({ path: "backend/config/.env" });

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Connect to database
connectDatabase();

// Start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
