import { config } from "../deps.ts";
import * as log from "../deps.ts";

import db from "../db/database.ts";
import { sendEvents } from "../event.ts";
import { Event, EventType, ICronHandler } from "../types.ts";

type Token = {
  access_token: string;
  expires_in: number;
  expires_at: Date;
};

async function getToken(clientId: string, clientSecret: string) {
  return fetch("https://accounts-api.airthings.com/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: ["read:device:current_values"],
    }),
  })
    .then((res) => res.json())
    .then(({ access_token, expires_in }) => {
      return {
        access_token,
        expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000),
      };
    });
}

const baseUrl = "https://ext-api.airthings.com/v1";

async function api(token: Token, url: string) {
  return fetch(`${baseUrl}${url}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  }).then((res) => res.json());
}

async function getDeviceIds(token: Token): Promise<string[]> {
  const result = await api(token, "/devices");
  return result.devices.map((device: any) => device.id);
}

async function getCurrentData(
  token: Token,
  deviceId: string,
): Promise<Event[]> {
  const { data } = await api(token, `/devices/${deviceId}/latest-samples`);
  const now = new Date(data.time * 1000);
  const source = { major: "airthings", minor: deviceId };

  return [{
    event: "co2",
    source,
    type: EventType.Real,
    data: data.co2,
    time: now,
  }, {
    // match existing awair event
    event: "humid",
    source,
    type: EventType.Real,
    data: data.humidity,
    time: now,
  }, {
    event: "temp",
    source,
    type: EventType.Real,
    data: (1.8 * data.temp) + 32, // received in celsius
    time: now,
  }, {
    event: "voc",
    source,
    type: EventType.Real,
    data: data.voc,
    time: now,
  }, {
    event: "radon",
    source,
    type: EventType.Real,
    data: data.radonShortTermAvg,
    time: now,
  }, {
    event: "pressure",
    source,
    type: EventType.Real,
    data: data.pressure,
    time: now,
  }, {
    event: "pm2.5",
    source,
    type: EventType.Real,
    data: data.pm25,
    time: now,
  }];
}

class Airthings implements ICronHandler {
  clientId?: string;
  clientSecret?: string;

  deviceIds?: string[];
  token?: Token;

  schedule = "*/5 * * * *";

  constructor() {
    this.clientId = config().AIRTHINGS_CLIENT_ID;
    this.clientSecret = config().AIRTHINGS_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      log.warning("airthings: client id or secret not specified; ignoring");
    }
  }

  async updateToken() {
    if (this.clientId && this.clientSecret) {
      this.token = await getToken(this.clientId, this.clientSecret);
    }
  }

  async init() {
    await this.updateToken();

    if (!this.token) {
      return;
    }
    this.deviceIds = await getDeviceIds(this.token);
  }

  async handler() {
    if (!this.token || !this.deviceIds) {
      return;
    }
    const now = new Date();
    if (now.getTime() - this.token.expires_at.getTime() < 60 * 1000) {
      await this.updateToken();
    }

    for (const d of this.deviceIds) {
      const events = await getCurrentData(this.token, d);
      await sendEvents(events);

      log.info(`airthings: ingested ${events.length} events`);
    }
  }
}

export default new Airthings();
