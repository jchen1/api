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
  response.status = 404;
  response.body = "Not found";
};

const logger: Middleware = async ({ request, response }, next) => {
  await next();
  console.log(
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
console.log(`Webserver started on port ${port}`);

await server;
