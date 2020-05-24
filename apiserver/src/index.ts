import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Application, Middleware } from "https://deno.land/x/oak/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import cron from "./cron.ts";
import db from "./db/database.ts";
import router from "./routes.ts";

const app = new Application();

const errorHandler: Middleware = async ({ response }, next) => {
  try {
    await next();
  } catch (err) {
    log.error(err);
    response.status = 500;
    response.body = { msg: err.message };
  }
};

const notFound: Middleware = ({ response }) => {
  response.status = 404;
  response.body = "Not found";
};

const logger: Middleware = async ({ request, response }, next) => {
  await next();
  log.info(
    `${new Date().toString()}: ${request.method} ${request.url} - ${
      response.status
    }`
  );
};

await db.connect();

app.use(errorHandler);
app.use(logger);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(notFound);

const port = parseInt(config().APP_PORT || "9000");
const httpsOptions = config().ENABLE_HTTPS
  ? {
      secure: true,
      certFile: config().HTTPS_CERT_FILE,
      keyFile: config().HTTPS_KEY_FILE,
    }
  : {};
const server = app.listen({ port, ...httpsOptions });
log.info(`Webserver started on port ${port}`);

cron.start();
log.info("Cron workers started");

await server;
