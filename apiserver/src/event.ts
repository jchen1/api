import db from "./db/database.ts";

type EventSource = {
  major: string;
  minor: string;
};

export enum EventType {
  Int = "int",
  BigInt = "bigint",
  Real = "real",
  Text = "text",
  Json = "json",
}

export async function sendEvent(
  event: string,
  source: EventSource,
  type: EventType,
  data: any,
  time = new Date()
) {
  const dataField = `data_${type}`;

  return await db.query(
    `INSERT INTO events (ts, event, source_major, source_minor, type, ${dataField}) VALUES ($1, $2, $3, $4, $5, $6)`,
    // support unix timestamps & js timestamps
    time,
    event,
    source.major,
    source.minor,
    type,
    data
  );
}
