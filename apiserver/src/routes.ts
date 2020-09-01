import { oakCors } from "./deps.ts";
import { Router } from "./deps.ts";

import { postEvents, getEvents } from "./api.ts";
import { authMiddleware } from "./middlewares.ts";

const router = new Router();

router
  .options("/", oakCors())
  .options("/events", oakCors())
  .get("/events", oakCors(), getEvents)
  .get("/", oakCors(), async ({ response }) => {
    response.status = 301;
    response.headers.set("Location", "https://jeffchen.dev/metrics");
  })
  .get("/healthcheck", oakCors(), ({ response }) => {
    response.status = 200;
    response.body = "ok";
  })
  .post("/", oakCors(), authMiddleware, postEvents);

export default router;
