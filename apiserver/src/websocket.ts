import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import {
  WebSocket,
  WebSocketServer,
} from "https://deno.land/x/websocket/mod.ts";
import { EventSource, EventType } from "./types.ts";

// todo somehow get SSL enabled...
class WSSServer {
  wss: WebSocketServer;
  connections: Record<number, WebSocket>;

  constructor() {
    const port = parseInt(config().APP_PORT || "9000");
    const wsPort = parseInt(config().WSS_PORT) || port + 1;

    this.wss = new WebSocketServer(wsPort);
    this.connections = [];

    this.wss.on("connection", (ws: WebSocket) => {
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
    });

    log.info(`Started wss server on port ${port}`);
  }

  async sendEvent(
    event: string,
    source: EventSource,
    type: EventType,
    data: any,
    time: Date
  ) {
    const message = {
      event,
      source,
      type,
      data,
      time,
    };
    const promises = Object.values(this.connections).map(ws =>
      ws.send(JSON.stringify(message))
    );
    await Promise.all(promises);
  }
}

export default new WSSServer();
