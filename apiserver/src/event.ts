import db from "./db/database.ts";
import wss from "./websocket.ts";
import { EventSource, EventType } from "./types.ts";

export async function sendEvent(
  event: string,
  source: EventSource,
  type: EventType,
  data: any,
  time = new Date()
) {
  const dataField = `data_${type}`;

  await db.query(
    `INSERT INTO events (ts, event, source_major, source_minor, type, ${dataField}) VALUES ($1, $2, $3, $4, $5, $6)`,
    // support unix timestamps & js timestamps
    time,
    event,
    source.major,
    source.minor,
    type,
    data
  );

  return await wss.sendEvent(event, source, type, data, time);
}
