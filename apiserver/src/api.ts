import { Middleware, Router } from "https://deno.land/x/oak/mod.ts";

import { EventType, sendEvent } from "./event.ts";

export const postEvent: Middleware = async ({ request, response }) => {
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

  const { source, event, type, data } = body.value;
  if (!source) {
    response.status = 400;
    response.body = "missing data";
    return;
  }

  const { major, minor } = source;

  if (!major || !minor || !type || !data || !event) {
    response.status = 400;
    response.body = "missing data";
    return;
  }

  if (!Object.values(EventType).includes(type)) {
    response.status = 400;
    response.body = "bad type";
    return;
  }

  await sendEvent(
    event,
    { major, minor },
    type,
    data,
    // support unix timestamps & js timestamps
    body.value.ts
      ? new Date(
          body.value.ts > 9999999999 ? body.value.ts : body.value.ts * 1000
        )
      : new Date()
  );

  response.status = 200;
  response.body = "ok";
  return;
};
