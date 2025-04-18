import { routes } from "./routes";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, statSync } from "fs";
import { readFile } from "fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "public");

async function serveStaticFile(path: string): Promise<Response | null> {
  const filePath = join(publicDir, path);

  try {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const file = await readFile(filePath);

      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const contentTypeMap: Record<string, string> = {
        html: "text/html",
        js: "text/javascript",
        css: "text/css",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        ico: "image/x-icon",
      };

      const contentType = contentTypeMap[ext] || "application/octet-stream";

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
        },
      });
    }
    return null;
  } catch (error) {
    console.error(`Error serving static file ${filePath}:`, error);
    return null;
  }
}

async function serveIndexHtml(): Promise<Response> {
  try {
    const indexPath = join(publicDir, "index.html");
    const content = await readFile(indexPath);
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error serving index.html:", error);
    return new Response("Server Error", { status: 500 });
  }
}

function defaultHandler(_req: Request): Response {
  return new Response("Not found", { status: 404 });
}

Bun.serve({
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Check API routes first
    for (const route of routes) {
      if (route.path === path && req.method === route.method) {
        return await route.handler(req);
      }
    }

    if (path !== "/") {
      const staticResponse = await serveStaticFile(path === "/" ? "index.html" : path.slice(1));
      if (staticResponse) {
        return staticResponse;
      }
    }

    if (path === "/" || !path.includes(".")) {
      return await serveIndexHtml();
    }

    return defaultHandler(req);
  },
  port: 8000,
});

console.log(`Server is running on http://localhost:8000`);
