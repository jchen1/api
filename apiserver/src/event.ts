import db from "./db/database.ts";
import wss from "./websocket.ts";
import { Event, EventSource, EventType } from "./types.ts";

export async function sendEvents(events: Event[]) {
  if (events.length === 0) {
    return;
  }

  const typedEvents = events.map(event => {
    const data = event.data;
    delete event.data;

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
          "(" + [...Array(10).keys()].map(n => `$${start + n}`).join(",") + ")"
        );
      })
      .join(",") +
    " ON CONFLICT DO NOTHING";

  // this could fail and that's ok!
  // wss.sendEvents(events);

  return await db.query({
    text: query,
    args: typedEvents.flatMap(e => [
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
}

export async function sendEvent(
  event: string,
  source: EventSource,
  type: EventType,
  data: any,
  time = new Date()
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
