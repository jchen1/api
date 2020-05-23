import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Middleware, Router } from "https://deno.land/x/oak/mod.ts";

import db from "./db/database.ts";

const authMiddleware: Middleware = ({ request, response }, next) => {
  if (!config().AUTH_TOKEN) {
    return next();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    response.status = 401;
    response.body = "authentication required";
    return;
  }

  if (config().AUTH_TOKEN !== authHeader.substr("Bearer".length).trim()) {
    response.status = 403;
    response.body = "bad token";
    return;
  }

  return next();
};

const router = new Router();

router
  .get("/", ({ response }) => {
    response.body = "hello world!";
  })
  .options("/", oakCors())
  .post("/", oakCors(), authMiddleware, async ({ request, response }) => {
    if (!request.hasBody) {
      response.status = 400;
      response.body = "missing body";
      return;
    }

    const body = await request.body();
    if (body.type !== "json") {
      response.status = 400;
      response.body = "requires json";
      return;
    }

    const { source, event, type, data } = body.value;
    if (!source) {
      response.status = 400;
      response.body = "missing data";
      return;
    }

    const { major, minor } = source;

    if (!major || !minor || !type || !data || !event) {
      response.status = 400;
      response.body = "missing data";
      return;
    }

    if (!["int", "bigint", "real", "text", "json"].includes(type)) {
      response.status = 400;
      response.body = "bad type";
      return;
    }

    const dataField = `data_${type}`;
    await db.query(
      `INSERT INTO events (ts, event, source_major, source_minor, type, ${dataField}) VALUES ($1, $2, $3, $4, $5, $6)`,
      // support unix timestamps & js timestamps
      body.value.ts
        ? new Date(
            body.value.ts > 9999999999 ? body.value.ts : body.value.ts * 1000
          )
        : new Date(),
      event,
      major,
      minor,
      type,
      data
    );

    response.status = 200;
    response.body = "ok";
    return;
  });

export default router;
