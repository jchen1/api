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
  connections: Record<number, WebSocket>;

  constructor() {
    const port = parseInt(config().APP_PORT || "9000");
    const wsPort = parseInt(config().WSS_PORT) || port + 1;

    this.wss = new WebSocketServer(wsPort);
    this.connections = [];

    this.wss.on("connection", async (ws: WebSocket) => {
      const now = Date.now();
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

      ws.on("message", (msg: string) => {
        const { message } = JSON.parse(msg);
        sendEvent(
          "user_msg",
          { major: "wss", minor: now.toString() },
          EventType.Text,
          message
        );
      });

      // oh my god
      const { rows } = await db.query(
        "select event, array_to_string((array_agg(to_json(e) #>> '{}' order by e.ts desc))[1:100], ',') from events e group by event;"
      );
      const events = rows
        .flatMap(r => r[1])
        .flatMap(a => JSON.parse(`[${a}]`))
        .map(fromDB)
        .sort((a, b) => a.time.getTime() - b.time.getTime());
      this.sendEvents(events);
      // ws.send(JSON.stringify({ events }));
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

    const promises = Object.values(this.connections).map(ws =>
      ws.send(JSON.stringify(message))
    );
    return Promise.allSettled(promises);
  }
}

export default new WSSServer();
