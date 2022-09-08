import { config } from "../deps.ts";
import * as log from "../deps.ts";

import db from "../db/database.ts";
import { sendEvents } from "../event.ts";
import { ICronHandler, EventType, Event } from "../types.ts";

type Device = {
  type: string;
  id: number;
};

const baseUrl = "https://developer-apis.awair.is/v1/users/self/devices";

async function api(token: string, url: string) {
  return fetch(`${baseUrl}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

async function getDevices(token: string): Promise<Device[]> {
  return await api(token, "").then((res) =>
    res.devices.map(
      ({ deviceId, deviceType }: { deviceId: number; deviceType: string }) => ({
        id: deviceId,
        type: deviceType,
      }),
    )
  );
}

async function getRawData(
  token: string,
  device: Device,
  start: Date,
  end = new Date(),
  desc = false,
  fahrenheit = true,
): Promise<any> {
  const result = await api(
    token,
    `/${device.type}/${device.id}/air-data/raw?from=${start.toISOString()}&to=${end.toISOString()}&limit=360&desc=${desc}&fahrenheit=${fahrenheit}`,
  );

  if (
    result.data && result.data.length === 0 &&
    end.getTime() - start.getTime() > 1000 * 60 * 60
  ) {
    return getRawData(
      token,
      device,
      new Date(start.getTime() + 1000 * 60 * 60),
      end,
      desc,
      fahrenheit,
    );
  }

  if (!result.data) {
    throw new Error(`awair bad response: ${JSON.stringify(result, null, 2)}`);
  }

  return result;
}

function deviceId(d: Device) {
  return `${d.type}_${d.id}`;
}

class Awair implements ICronHandler {
  token?: string;
  devices: Device[];

  schedule = "*/5 * * * *";

  constructor() {
    this.token = config().AWAIR_API_TOKEN;
    this.devices = [];

    if (!this.token) {
      log.warning("awair: no token specified; ignoring");
    }
  }

  async init() {
    if (!this.token) {
      return;
    }
    this.devices = await getDevices(this.token);
  }

  async handler() {
    if (!this.token) {
      return;
    }

    if (this.devices.length === 0) {
      log.warning("awair: no devices");
    }

    const { rows } = await db.client.queryArray<[string, Date]>(
      `SELECT source_minor, MAX(ts) FROM events WHERE source_major=$1 AND source_minor = ANY($2::text[]) GROUP BY source_minor;`,
      ["awair", this.devices.map(deviceId)],
    );

    const deviceToLastIngest = rows.reduce((acc: Record<string, Date>, row) => {
      acc[row[0]] = row[1];
      return acc;
    }, {});

    for (const d of this.devices) {
      const ts = deviceToLastIngest[deviceId(d)];
      if (!ts) {
        log.warning(
          `awair: no start time for ${deviceId(d)}, defaulting to 24 hours ago`,
        );
      }
      const start = new Date(
        ts ? ts.getTime() + 1000 : Date.now() - 1000 * 60 * 60 * 24,
      );
      const { data } = await getRawData(this.token, d, start);

      const events = data.flatMap((data: any) => {
        const { timestamp, score, sensors } = data;

        const scoreEvent: Event = {
          event: "awair_score",
          source: { major: "awair", minor: deviceId(d) },
          type: EventType.Int,
          data: score,
          time: new Date(timestamp),
        };

        const sensorEvents: Event[] = sensors.map(({ comp, value }: any) => ({
          event: comp,
          source: { major: "awair", minor: deviceId(d) },
          type: Number.isInteger(value) ? EventType.Int : EventType.Real,
          data: value,
          time: new Date(timestamp),
        }));

        return sensorEvents.concat([scoreEvent]);
      });

      await sendEvents(events);

      log.info(
        `awair: ingested ${events.length} events starting from ${start}`,
      );
    }
  }
}

export default new Awair();
