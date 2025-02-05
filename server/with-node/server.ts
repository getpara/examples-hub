import express, { Request, Response, NextFunction } from "express";
import { configDotenv } from "dotenv";
import routes from "./routes.js";

// Load environment variables from .env file into process.env
configDotenv();

// Create an Express application instance.
const app = express();

// Determine the port from environment variables, or default to 3000.
// Developers can customize this in the .env file.
const port: number = parseInt(process.env.PORT || "3000", 10);

// Use JSON middleware so the server can parse JSON request bodies.
app.use(express.json());

// Register all routes for the application.
// The `routes` module organizes and mounts all example endpoints.
app.use(routes);

/**
 * 404 Not Found Handler
 * Use this handler when no route matches the incoming request.
 * Return a 404 to inform the developer that the requested endpoint does not exist.
 */
app.use((_req: Request, res: Response): void => {
  res.status(404).send("Not found");
});

/**
 * General Error Handler
 * Catch any errors thrown in route handlers or middleware, and return a 500 status.
 * Log the error message to assist in debugging.
 * In production, consider more sophisticated error handling, logging, and user-friendly responses.
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("Internal server error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start the server and listen for incoming requests on the specified port.
// Once started, log the URL for quick access.
app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
