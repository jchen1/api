import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Middleware, Router } from "https://deno.land/x/oak@v5.2.0/mod.ts";

export const authMiddleware: Middleware = ({ request, response }, next) => {
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
