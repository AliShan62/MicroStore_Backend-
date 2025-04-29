const app = require("./app");
const connectDatabase = require("./db/Database");
const serverless = require("serverless-http");
require("dotenv").config({ path: "./config/.env" }); // Adjust the path if needed

// Connect to the database
connectDatabase();

// Export the app handler for serverless deployment (no app.listen() here)
module.exports.handler = serverless(app);

// Handling uncaught exceptions (for local or testing environments)
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections (for local or testing environments)
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
