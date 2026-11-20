const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const discoverRoutes = require("./routes/discoverRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin(origin, callback) {
      const localDev = !origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (localDev || origin === clientUrl) {
        callback(null, true);
        return;
      }
      callback(new Error("This browser origin is not allowed."));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.text({ type: ["text/plain", "text/*"] }));

app.get("/", (req, res) => {
  const acceptsHtml = (req.headers.accept || "").includes("text/html");
  if (!acceptsHtml) {
    return res.status(200).json({
      success: true,
      message: "LocalConnect API is running.",
      data: { site: clientUrl },
    });
  }

  return res.status(200).type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>LocalConnect API</title>
</head>
gi
<body style="font-family: system-ui, sans-serif; padding: 2rem; line-height: 1.5;">
  <h1>LocalConnect API is running.</h1>
  <p>This address is the API. The website is separate.</p>
  <p><a href="${clientUrl}">Open the website</a></p>
</body>
</html>`);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LocalConnect API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api", discoverRoutes);
app.use("/api", requestRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
