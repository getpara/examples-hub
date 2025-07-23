import { routes } from "./routes/index.ts";

function defaultHandler(_req: Request): Response {
  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    for (const route of routes) {
      const match = route.pattern.exec(url);
      if (match && req.method === route.method) {
        return await route.handler(req);
      }
    }

    return defaultHandler(req);
  },
};

console.log(`Server code loaded and ready to process requests on port 8000`);
