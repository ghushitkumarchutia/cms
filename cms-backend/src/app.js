const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimiter = require("./middlewares/rateLimiter");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", rateLimiter);

app.get("/", (req, res) => {
  res.send("Welcome to the CMS Backend API - Production Grade");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/artifacts", require("./routes/artifact.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/audit-logs", require("./routes/auditLog.routes"));

app.use(errorHandler);

module.exports = app;
