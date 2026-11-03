require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./app/config/db");
const routes = require("./app/routes/api");
const { notFound, errorHandler } = require("./app/middleware/errorHandler");

["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "ADMIN_SECRET_KEY"].forEach((key) => {
  if (!process.env[key]) {
    console.log(`Missing environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: false, message: "Too many requests, please try again later" },
}));

app.get("/", (req, res) => res.json({ status: true, message: "Food ordering API is running" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
