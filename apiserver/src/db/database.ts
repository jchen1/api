import { config } from "../deps.ts";
import { Pool, PoolClient } from "../deps.ts";

import { AggregatedEvent, DBEvent, Event } from "../types.ts";

class Database {
  pool: Pool;
  _client: PoolClient | undefined;

  constructor() {
    const user = config().DB_USER || "postgres";
    const database = config().DB_DB || "api";
    const hostname = config().DB_HOST || "127.0.0.1";
    const port = parseInt(config().DB_PORT || "5432");
    const password = config().DB_PASSWORD;
    this.pool = new Pool(
      {
        user,
        database,
        hostname,
        port,
        password,
      },
      50,
    );
    
    this.pool.connect().then(result => {
      this._client = result;
    });
  }
  
  async connect(): Promise<void> {
    if (this._client === undefined) {
      this._client = await this.pool.connect();
    }
  }
  
  get client(): PoolClient {
    if (this._client === undefined) {
      throw new Error('client not initialized');
    }
    return this._client;
  }
}

export function fromDB(e: DBEvent): AggregatedEvent {
  return {
    event: e.event,
    source: { major: e.source_major, minor: e.source_minor },
    count: Number(e.count || 0),
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

export default new Database();
