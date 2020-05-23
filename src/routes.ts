import { Router } from "https://deno.land/x/oak/mod.ts";

import db from "./db/database.ts";

const router = new Router();

router
  .get("/", ({ response }) => {
    response.body = "hello world!";
  })
  .post("/", async ({ request, response }) => {
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

    const { source, type, data } = body.value;
    if (!source) {
      response.status = 400;
      response.body = "missing data";
      return;
    }

    const { major, minor } = source;

    if (!major || !minor || !type || !data) {
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
      `INSERT INTO events (ts, source_major, source_minor, type, ${dataField}) VALUES ($1, $2, $3, $4, $5)`,
      // support unix timestamps & js timestamps
      body.value.ts
        ? new Date(
            body.value.ts > 9999999999 ? body.value.ts : body.value.ts * 1000
          )
        : new Date(),
      major,
      minor,
      type,
      data
    );

    response.body = "ok";
  });

export default router;
