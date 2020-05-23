import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application, Middleware } from "https://deno.land/x/oak/mod.ts";

import db from "./db/database.ts";
import router from "./routes.ts";

const app = new Application();

const errorHandler: Middleware = async ({ response }, next) => {
  try {
    await next();
  } catch (err) {
    response.status = 500;
    response.body = { msg: err.message };
  }
};

const notFound: Middleware = ({ response }) => {
  response.body = "Not found";
};

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

  next();
};

await db.connect();

app.use(errorHandler);
app.use(authMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(notFound);

const port = parseInt(config().APP_PORT || "9000");
const server = app.listen({ port });
console.log(`Webserver started on port ${port}`);

await server;
