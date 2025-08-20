const express = require("express");
const cookieParser = require("cookie-parser");
const { corsMiddleware } = require("./middleware/cors");
const { requestLogger } = require("./utils/logger");

// Routers
const followRoutes = require("./routes/follow");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");

const app = express();

// Core middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestLogger);

// Order matters where paths may overlap
app.use(followRoutes); // /follow..., /followers...
app.use(usersRoutes); // /users/search BEFORE /users/:username (defined in file)
app.use(postsRoutes); // /posts..., /addpost, /addcomment, /me/posts
app.use(searchRoutes); // /search
app.use(authRoutes); // /signup, /signin, /logout, /me

// 404
app.use((req, res) => {
  console.warn("No route matched:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not found" });
});

// Central error handler (optional but nice to have)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.stack || err);
  res.status(500).json({ error: "server error" });
});

module.exports = app;
