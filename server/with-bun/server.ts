import { routes } from "./routes";

/**
 * Handles requests that don't match any defined routes.
 *
 * @param {Request} _req - The incoming request object.
 * @returns {Response} - A 404 Not Found response.
 */
function defaultHandler(_req: Request): Response {
  return new Response("Not found", { status: 404 });
}

/**
 * Starts the Bun server and handles routing for incoming requests.
 */
Bun.serve({
  async fetch(req: Request): Promise<Response> {
    const path = new URL(req.url).pathname;

    for (const route of routes) {
      if (route.path === path && req.method === route.method) {
        return await route.handler(req);
      }
    }

    return defaultHandler(req);
  },
  port: 8000,
});
