import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";

import { historicalEvents, sendEvent, maskEvents } from "./event.ts";
import { Event, EventType } from "./types.ts";

type WSConnection = {
  ws: WebSocket;
  eventFilter: string[] | "all";
};

// todo somehow get SSL enabled...
// todo gzip
class WSSServer {
  wss: WebSocketServer;
  connections: Record<string, WSConnection>;

  constructor() {
    const port = parseInt(config().APP_PORT || "9000");
    const wsPort = parseInt(config().WSS_PORT) || port + 1;

    this.wss = new WebSocketServer(wsPort);
    this.connections = {};

    this.wss.on("connection", async (ws: WebSocket) => {
      const now = String(Date.now());
      this.connections[now] = { ws, eventFilter: "all" };
      log.info(
        `new wss connection: ${Object.keys(this.connections).length} active`,
      );

      ws.on("close", () => {
        delete this.connections[now];
        log.info(
          `wss connection dropped: ${
            Object.keys(this.connections).length
          } active`,
        );
      });

      ws.on("message", async (msg: string) => {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.type === "connect" || parsed.type === "historical") {
            if (
              parsed.eventFilter === "all" ||
              Array.isArray(parsed.eventFilter)
            ) {
              this.connections[now].eventFilter = parsed.eventFilter;
            }
            const hours = Math.min(48, parsed.hours || 12);
            const startTime = new Date(Date.now() - 1000 * 60 * 60 * hours);
            // 12 hours
            const events = await historicalEvents(startTime);
            return this.sendEvents(events);
          } else if (parsed.type === "reconnect") {
            // meh
          } else if (parsed.type === "message") {
            sendEvent(
              "user_msg",
              { major: "wss", minor: now },
              EventType.Text,
              parsed.message,
            );
          }
        } catch (err) {
          log.error(err);
        }
      });
    });

    log.info(`Started wss server on port ${wsPort}`);
  }

  async sendEvents(events: Event[]) {
    return Promise.allSettled(
      Object.values(this.connections).map(({ ws, eventFilter }) => {
        const eventsToSend = maskEvents(events).filter(({ event }) =>
          eventFilter === "all" || eventFilter.includes(event)
        );
        ws.send(JSON.stringify({ events: eventsToSend }));
      }),
    );
  }
}

export default new WSSServer();
