const app = require("./app");
const connectDatabase = require("./db/Database");

require("dotenv").config({ path: "backend/config/.env" });

// Connect to Database
connectDatabase();

// Start the server traditionally (with app.listen)
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
