import * as log from "./deps.ts";

import db, { fromDB } from "./db/database.ts";
import wss from "./websocket.ts";
import { Event, EventSource, EventsQueryOpts, EventType } from "./types.ts";

export async function sendEvents(events: Event[]) {
  if (events.length === 0) {
    return;
  }

  const typedEvents = events.map((event) => {
    const data = event.data;

    return {
      ...event,
      data_json: event.type === EventType.Json ? data : null,
      data_int: event.type === EventType.Int ? data : null,
      data_bigint: event.type === EventType.BigInt ? data : null,
      data_real: event.type === EventType.Real ? data : null,
      data_text: event.type === EventType.Text ? data : null,
    };
  });

  const query =
    `INSERT INTO events (ts, event, source_major, source_minor, type, data_int, data_bigint, data_real, data_text, data_json) VALUES` +
    typedEvents
      .map((_, idx) => {
        const start = 1 + idx * 10;
        return (
          "(" + [...Array(10).keys()].map((n) => `$${start + n}`).join(",") +
          ")"
        );
      })
      .join(",") +
    " ON CONFLICT DO NOTHING;";

  const promise = db.client.queryArray({
    text: query,
    args: typedEvents.flatMap((e) => [
      e.time,
      e.event,
      e.source.major,
      e.source.minor,
      e.type,
      e.data_int,
      e.data_bigint,
      e.data_real,
      e.data_text,
      e.data_json,
    ]),
  });

  // this could fail and that's ok!
  wss.sendEvents(events).then((results) => {
    if (results.length > 0) {
      log.info(
        `sent ${events.length} events to ${results.length} active websocket connections: ${
          results.filter((r) => r.status === "fulfilled").length
        } succeeded, ${
          results.filter((r) => r.status === "rejected").length
        } failed`,
      );
    }
  });

  return promise;
}

export async function sendEvent(
  event: string,
  source: EventSource,
  type: EventType,
  data: any,
  time = new Date(),
) {
  return await sendEvents([
    {
      event,
      source,
      type,
      data,
      time,
    },
  ]);
}

// when this function was created there were 4772 events in the last 12 hours, 9473 in 24
export async function historicalEvents(
  start: Date,
  end = new Date(),
  opts: EventsQueryOpts = {},
) {
  const limit = opts.limit || 20000;
  const period = opts.period || "minute";
  const include = (opts.include || []).filter((s) => s !== "");

  const includeQuery = include.length > 0
    ? `WHERE event IN (${include.map((i) => `'${i}'`).join(", ")})`
    : "";

  const query = `
WITH
  events_with_period AS
    (SELECT 
      DATE_TRUNC('${period}', ts) as period, 
      *
    FROM events
    ${includeQuery}),
  events_by_period AS
    (SELECT
      period,
      event,
      source_major,
      source_minor,
      type,
      COUNT(*) OVER w AS count,
      CAST(AVG(data_int) OVER w AS INT) AS data_int,
      CAST(AVG(data_bigint) OVER w AS BIGINT) AS data_bigint,
      AVG(data_real) OVER w AS data_real,
      FIRST_VALUE(data_text) OVER w AS data_text,
      FIRST_VALUE(data_json) OVER w AS data_json
    FROM events_with_period
    WHERE period >= $1 AND period <= $2
    WINDOW w AS (PARTITION BY event, period))
SELECT
  period AS ts,
  event,
  MIN(source_major) AS source_major,
  MIN(source_minor) AS source_minor,
  CAST(MIN(type) AS TEXT) as type,
  MIN(count) AS count,
  MIN(data_int) AS data_int,
  MIN(data_bigint) AS data_bigint,
  MIN(data_real) AS data_real,
  FIRST(data_text) AS data_text,
  FIRST(data_json) AS data_json
FROM events_by_period
GROUP BY event, period
ORDER BY period ASC
LIMIT $3;`;

  const { rows } = await db.client.queryArray<
    [
      Date,
      string,
      string,
      string,
      EventType,
      bigint,
      number,
      bigint,
      number,
      string,
      any,
    ]
  >(
    query,
    [start, end, limit],
  );

  return rows
    .map(
      ([
        ts,
        event,
        source_major,
        source_minor,
        type,
        count,
        data_int,
        data_bigint,
        data_real,
        data_text,
        data_json,
      ]) => ({
        ts,
        event,
        source_major,
        source_minor,
        type,
        count,
        data_int,
        data_bigint,
        data_real,
        data_text,
        data_json,
      }),
    )
    .map(fromDB);
}

const filters = {
  events: ["visited_url", "switched_tab"],
  sources: ["chrome-extension", "hammerspoon"],
};

export function maskEvents(events: Event[]) {
  return events.map((event) => ({
    ...event,
    data: filters.events.includes(event.event) ||
        filters.sources.includes(event.source.major)
      ? "hidden"
      : event.data,
  }));
}
