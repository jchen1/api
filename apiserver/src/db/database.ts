import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.4.1/mod.ts";
import { DBEvent, Event } from "../types.ts";

class Database {
  client: Pool;

  constructor() {
    const user = config().DB_USER || "postgres";
    const database = config().DB_DB || "api";
    const hostname = config().DB_HOST || "127.0.0.1";
    const port = parseInt(config().DB_PORT || "5432");
    const password = config().DB_PASSWORD;
    this.client = new Pool(
      {
        user,
        database,
        hostname,
        port,
        password,
      },
      50
    );
  }
}

export function fromDB(e: DBEvent): Event {
  return {
    event: e.event,
    source: { major: e.source_major, minor: e.source_minor },
    type: e.type,
    time: new Date(e.ts),
    data: (e as any)[`data_${e.type}`],
  };
}

export function toDB(e: Event): DBEvent {
  const dbe = {
    event: e.event,
    source_major: e.source.major,
    source_minor: e.source.minor,
    type: e.type,
    ts: e.time,
  };
  (dbe as any)[`data_${e.type}`] = e.data;

  return dbe;
}

export default new Database().client;
