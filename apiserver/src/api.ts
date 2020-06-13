import { Middleware, helpers } from "https://deno.land/x/oak@v5.2.0/mod.ts";

import { historicalEvents, sendEvent } from "./event.ts";
import { EventsQueryOpts, EventType, QueryPeriodType } from "./types.ts";

export const getEvents: Middleware = async (context) => {
  const { response } = context;
  const params = helpers.getQuery(context);

  const start = new Date(
    parseInt(params.start) || Date.now() - 1000 * 60 * 60 * 24,
  );
  const end = new Date(parseInt(params.end) || Date.now());
  const period = (params.period || QueryPeriodType.Minute) as QueryPeriodType;
  if (!Object.values(QueryPeriodType).includes(period)) {
    response.status = 400;
    response.body = "bad period";
    return;
  }

  const include = (params.include || "").split(",");

  const opts: EventsQueryOpts = {
    limit: Math.max(parseInt(params.limit), 20000),
    period,
    include,
  };

  const events = await historicalEvents(start, end, opts);

  response.status = 200;
  response.body = events;
};

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
        body.value.ts > 9999999999 ? body.value.ts : body.value.ts * 1000,
      )
      : new Date(),
  );

  response.status = 200;
  response.body = "ok";
};
