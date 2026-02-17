import "dotenv/config";
import cors from "cors";
import express from "express";
import session from "express-session";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import passport from "./config/passport.js";

const app = express();
const httpServer = createServer(app);

// Trust proxy (important for production behind Render / Railway / Replit)
app.set("trust proxy", 1);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
(async () => {
  try {
    // Register all routes
    await registerRoutes(httpServer, app);

    const port = process.env.PORT || 5000;

    httpServer.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔒 Secure cookies: ${process.env.NODE_ENV === "production"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});