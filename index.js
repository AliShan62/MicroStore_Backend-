const app = require("./app");
const connectDatabase = require("./db/Database");
const serverless = require("serverless-http");

require("dotenv").config({ path: "backend/config/.env" });

// Connect to DB
connectDatabase();

// Export for Vercel (no app.listen here!)
module.exports.handler = serverless(app);
