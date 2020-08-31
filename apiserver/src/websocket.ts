import { config } from "./deps.ts";
import * as log from "./deps.ts";

import {
  WebSocket,
  WebSocketServer,
} from "./deps.ts";

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
          if (parsed.type === "connect") {
            if (
              parsed.eventFilter === "all" ||
              Array.isArray(parsed.eventFilter)
            ) {
              this.connections[now].eventFilter = parsed.eventFilter;
            }
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

      ws.on("error", (err: Error) => {
        log.error(`wss error: ${err.message}`);
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
