import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";

import db, { fromDB } from "./db/database.ts";
import { sendEvent } from "./event.ts";
import { Event, EventType } from "./types.ts";

const filters = {
  events: ["visited_url", "switched_tab"],
  sources: ["chrome-extension"],
};

// todo somehow get SSL enabled...
// todo gzip
class WSSServer {
  wss: WebSocketServer;
  connections: Record<string, WebSocket>;

  constructor() {
    const port = parseInt(config().APP_PORT || "9000");
    const wsPort = parseInt(config().WSS_PORT) || port + 1;

    this.wss = new WebSocketServer(wsPort);
    this.connections = {};

    this.wss.on("connection", async (ws: WebSocket) => {
      const now = String(Date.now());
      this.connections[now] = ws;
      log.info(
        `new wss connection: ${Object.keys(this.connections).length} active`
      );

      ws.on("close", () => {
        delete this.connections[now];
        log.info(
          `wss connection dropped: ${
            Object.keys(this.connections).length
          } active`
        );
      });

      ws.on("message", async (msg: string) => {
        const parsed = JSON.parse(msg);
        if (parsed.type === "connect") {
          const { rows } = await db.query(
            `WITH 
              events_with_minute AS 
                (SELECT DATE_TRUNC('minute', ts) as minute, * from events), 
              events_by_minute AS 
                (SELECT 
                  minute, 
                  event,
                  source_major,
                  source_minor, 
                  type, 
                  CAST(AVG(data_int) OVER w AS INT) AS data_int, 
                  CAST(AVG(data_bigint)  OVER w AS BIGINT) AS data_bigint, 
                  AVG(data_real) OVER w AS data_real, 
                  FIRST_VALUE(data_text) OVER w AS data_text, 
                  FIRST_VALUE(data_json) OVER w AS data_json 
                FROM events_with_minute WINDOW w AS (PARTITION BY event, minute)) 
            SELECT 
              minute AS ts,
              event,
              MIN(source_major) AS source_major, 
              MIN(source_minor) AS source_minor, 
              CAST(MIN(type) AS TEXT) as type, 
              MIN(data_int) AS data_int, 
              MIN(data_bigint) AS data_bigint, 
              MIN(data_real) AS data_real, 
              FIRST(data_text) AS data_text, 
              FIRST(data_json) AS data_json 
            FROM events_by_minute WHERE minute > now() - INTERVAL '12 hour'
            GROUP BY event, minute 
            ORDER BY minute DESC;`
          );
          const events = rows
            .map(
              ([
                ts,
                event,
                source_major,
                source_minor,
                type,
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
                data_int,
                data_bigint,
                data_real,
                data_text,
                data_json,
              })
            )
            .map(fromDB)
            .reverse();

          return this.sendEvents(events);
        } else if (parsed.type === "reconnect") {
          // meh
        } else if (parsed.type === "message") {
          sendEvent(
            "user_msg",
            { major: "wss", minor: now },
            EventType.Text,
            parsed.message
          );
        }
      });
    });

    log.info(`Started wss server on port ${wsPort}`);
  }

  async sendEvents(events: Event[]) {
    const message = {
      events: events.map(event => ({
        ...event,
        data:
          filters.events.includes(event.event) ||
          filters.sources.includes(event.source.major)
            ? "hidden"
            : event.data,
      })),
    };

    const json = JSON.stringify(message);

    return Promise.allSettled(
      Object.values(this.connections).map(ws => ws.send(json))
    );
  }
}

export default new WSSServer();
