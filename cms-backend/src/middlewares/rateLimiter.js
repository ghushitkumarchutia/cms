//Rate limiting means restricting how many requests a user can send in a fixed time

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
