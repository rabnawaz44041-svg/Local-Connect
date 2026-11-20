require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to backend/.env");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to backend/.env");
  process.exit(1);
}

const app = require("./app");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`LocalConnect API running on http://localhost:${port}`);
});
