import { routes } from "./routes";

function defaultHandler(_req: Request): Response {
  return new Response("Not found", { status: 404 });
}

Bun.serve({
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Check API routes
    for (const route of routes) {
      if (route.path === path && req.method === route.method) {
        return await route.handler(req);
      }
    }

    return defaultHandler(req);
  },
  port: 8000,
});

console.log(`Server is running on http://localhost:8000`);
