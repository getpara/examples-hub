import { extname, join } from "https://deno.land/std@0.214.0/path/mod.ts";
import { routes } from "./routes.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const publicDir = join(__dirname, "public");

// Map file extensions to content types
const contentTypeMap: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function serveStaticFile(path: string): Promise<Response | null> {
  const filePath = join(publicDir, path);

  try {
    const fileInfo = await Deno.stat(filePath);

    if (fileInfo.isFile) {
      const fileContent = await Deno.readFile(filePath);
      const ext = extname(filePath);
      const contentType = contentTypeMap[ext] || "application/octet-stream";

      return new Response(fileContent, {
        headers: {
          "Content-Type": contentType,
        },
      });
    }
    return null;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.error(`Error serving static file ${filePath}:`, error);
    }
    return null;
  }
}

async function serveIndexHtml(): Promise<Response> {
  try {
    const indexPath = join(publicDir, "index.html");
    const content = await Deno.readFile(indexPath);

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

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    for (const route of routes) {
      const match = route.pattern.exec(url);
      if (match && req.method === route.method) {
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
};

console.log(`Server code loaded and ready to process requests on port 8000`);
