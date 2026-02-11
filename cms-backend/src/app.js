const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("./middlewares/rateLimiter");
const morgan = require("morgan");

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.use("/api", rateLimiter);

app.get("/", (req, res) => {
  res.send("Welcome to the CMS Backend API");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/artifacts", require("./routes/artifact.routes"));

module.exports = app;
