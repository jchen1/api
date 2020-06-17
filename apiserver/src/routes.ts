import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Router } from "https://deno.land/x/oak@v5.2.0/mod.ts";

import { postEvents, getEvents } from "./api.ts";
import { authMiddleware } from "./middlewares.ts";

const router = new Router();

router
  .options("/", oakCors())
  .options("/events", oakCors())
  .get("/events", oakCors(), getEvents)
  .post("/", oakCors(), authMiddleware, postEvents);

export default router;
