import express, { Request, Response, NextFunction } from "express";
import { configDotenv } from "dotenv";
import routes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

configDotenv();

const app = express();

const port: number = parseInt(process.env.PORT || "3000", 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const staticPath = path.resolve(__dirname, "public");
app.use(express.static(staticPath));

app.use(routes);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(staticPath, "index.html"));
});

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

app.listen(port, (): void => {
  console.log(`Server is running on http://localhost:${port}`);
});
