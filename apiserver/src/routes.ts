import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Middleware, Router } from "https://deno.land/x/oak/mod.ts";

import { postEvent } from "./api.ts";
import { authMiddleware } from "./middlewares.ts";

const router = new Router();

router
  .get("/", ({ response }) => {
    response.body = "hello world!";
  })
  .options("/", oakCors())
  .post("/", oakCors(), authMiddleware, postEvent);

export default router;
