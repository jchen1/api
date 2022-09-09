import { oakCors } from "./deps.ts";
import { Router } from "./deps.ts";

import { getEvents, postEvents } from "./api.ts";
import { authMiddleware } from "./middlewares.ts";

const router = new Router();

router
  .options("/", oakCors())
  .options("/events", oakCors())
  .get("/events", getEvents)
  .get("/", async ({ response }) => {
    response.status = 301;
    response.headers.set("Location", "https://jeffchen.dev/metrics");
  })
  .get("/healthcheck", ({ response }) => {
    response.status = 200;
    response.body = "ok";
  })
  .post("/", authMiddleware, postEvents);

export default router;
