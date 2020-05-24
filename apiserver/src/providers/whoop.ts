import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import db from "../db/database.ts";

type Token = {
  user_id: number;
  access_token: string;
  expires_in: number;
  expires_at: Date;
};

async function getToken(username: string, password: string) {
  return fetch("https://api-7.whoop.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "password",
      issueRefresh: false,
      username,
      password,
    }),
  })
    .then(res => res.json())
    .then(({ user, access_token, expires_in }) => {
      return {
        user_id: user.id,
        access_token,
        expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000),
      };
    });
}

async function getCycles(token: Token, start: Date, end = new Date()) {
  return fetch(
    `https://api-7.whoop.com/users/${
      token.user_id
    }/cycles?start=${start.toISOString()}&end=${end.toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  ).then(res => res.json());
}

async function getHR(token: Token, start: Date, end = new Date(), step = 60) {
  return fetch(
    `https://api-7.whoop.com/users/${
      token.user_id
    }/metrics/heart_rate?start=${start.toISOString()}&end=${end.toISOString()}&order=t&step=${step}`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  ).then(res => res.json());
}

class Whoop {
  username?: string;
  password?: string;

  token?: Token;

  constructor() {
    this.username = config().WHOOP_USERNAME;
    this.password = config().WHOOP_PASSWORD;

    if (!this.username || !this.password) {
      log.warning("whoop: username or password not specified; ignoring");
    }
  }

  async updateToken() {
    if (this.username && this.password) {
      this.token = await getToken(this.username, this.password);
    }
  }

  async init() {
    await this.updateToken();
  }

  async ingest() {
    if (!this.token) {
      return;
    }
    const now = Date.now();
    if (now - this.token.expires_at.valueOf() < 60 * 1000) {
      await this.updateToken();
    }

    const { rows } = await db.query(
      `SELECT ts FROM events WHERE event=$1 AND source_major=$2 ORDER BY ts DESC LIMIT 1;`,
      "hr",
      "whoop"
    );

    const start =
      rows.length > 0
        ? new Date(rows[0][0].getTime() + 1000)
        : new Date(now - 1000 * 60 * 60 * 24);

    const { values } = await getHR(this.token, start);
    for (const metric of values) {
      const event = {
        ts: new Date(metric.time),
        event: "hr",
        source_major: "whoop",
        source_minor: "api",
        type: "int",
        data_int: metric.data,
      };

      await db.query(
        `INSERT INTO events (ts, event, source_major, source_minor, type, data_int) VALUES ($1, $2, $3, $4, $5, $6)`,
        event.ts,
        event.event,
        event.source_major,
        event.source_minor,
        event.type,
        event.data_int
      );
    }

    log.info(`Ingested ${values.length} events.`);
  }
}

export default new Whoop();
