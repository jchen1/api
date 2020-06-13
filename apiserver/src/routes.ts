import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Middleware, Router } from "https://deno.land/x/oak@v5.2.0/mod.ts";

import { postEvent, getEvents } from "./api.ts";
import { authMiddleware } from "./middlewares.ts";

const router = new Router();

router
  .options("/", oakCors())
  .get("/events", oakCors(), authMiddleware, getEvents)
  .post("/", oakCors(), authMiddleware, postEvent);

export default router;
