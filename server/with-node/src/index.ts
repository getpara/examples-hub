import express, { Request, Response, NextFunction } from "express";
import { configDotenv } from "dotenv";
import { router } from "./routes";

configDotenv({ path: [".env", "../../.env"] });

const app = express();

const port: number = parseInt(process.env.PORT || "8080", 10);

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

app.use(express.json());

// Log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(router);

app.use((_req: Request, res: Response): void => {
  if (!res.headersSent) {
    res.status(404).json({ error: "Not Found" });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const server = app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on("error", (error: Error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

// Handle process termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle nodemon restarts
process.once("SIGUSR2", () => {
  gracefulShutdown("SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});
