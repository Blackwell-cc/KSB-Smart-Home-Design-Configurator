import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 43_123;
const publicPreview = Object.freeze({
  slug: "public-example-7f3k",
  public_payload: Object.freeze({
    conceptAssetId: "contemporary-warm-luxury",
    styleLabel: "Contemporary Warm Luxury",
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    usableAreaM2: 164,
  }),
});

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");

  if (url.pathname === "/health") {
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/rest/v1/public_previews") {
    response.setHeader("content-range", "0-0/1");
    response.end(JSON.stringify(publicPreview));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ code: "E2E_FIXTURE_NOT_FOUND" }));
});

server.listen(port, host);

const close = () => server.close(() => process.exit(0));
process.on("SIGINT", close);
process.on("SIGTERM", close);
