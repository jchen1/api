import { config } from "../deps.ts";
import * as log from "../deps.ts";

import db from "../db/database.ts";
import { sendEvents } from "../event.ts";
import { ICronHandler, EventType, Event } from "../types.ts";
import { get } from "../util.ts";

type Token = {
  user_id: number;
  access_token: string;
  expires_in: number;
  expires_at: Date;
};

const sportIdToName: Record<string, string> = {
  "-1": "Other",
  "35": "Track",
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
    .then((res) => res.json())
    .then(({ user, access_token, expires_in }) => {
      return {
        user_id: user.id,
        access_token,
        expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000),
      };
    });
}

async function api(token: Token, url: string) {
  return fetch(`https://api-7.whoop.com/users/${token.user_id}/${url}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  }).then((res) => res.json());
}

async function getCycles(token: Token, start: Date, end = new Date()) {
  return api(
    token,
    `cycles?start=${start.toISOString()}&end=${end.toISOString()}`,
  );
}

async function getHR(token: Token, start: Date, end = new Date(), step = 6) {
  return api(
    token,
    `metrics/heart_rate?start=${start.toISOString()}&end=${end.toISOString()}&order=t&step=${step}`,
  );
}

async function getHREvents(token: Token, now: Date): Promise<Event[]> {
  const { rows } = await db.client.queryArray(
    `SELECT ts FROM events WHERE event=$1 AND source_major=$2 ORDER BY ts DESC LIMIT 1;`,
    ["hr", "whoop"]
  );

  const start = rows.length > 0
    ? new Date(rows[0][0].getTime() + 1000)
    : new Date(now.getTime() - 1000 * 60 * 60 * 24);

  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);

  const { values } = await getHR(token, start, end.getTime() < now.getTime() ? end : now);
  const events = values.map((metric: any) => ({
    event: "hr",
    source: { major: "whoop", minor: "api" },
    type: EventType.Int,
    data: metric.data,
    time: new Date(metric.time),
  }));

  return events.slice(0, 5000);
}

async function getCycleEvents(token: Token, now: Date): Promise<Event[]> {
  const { rows } = await db.client.queryArray(
    `SELECT ts FROM EVENTS WHERE event=$1 AND source_major=$2 ORDER BY ts DESC LIMIT 1;`,
    // doesn't really matter: we only import when all states are `complete`
    ["strain", "whoop"]
  );

  const start = rows.length > 0
    ? new Date(rows[0][0].getTime() + 1000)
    : new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14);

  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 7);
  const cycles = await getCycles(token, start, end.getTime() < now.getTime() ? end : now);

  const events = cycles.flatMap((cycle: any) => {
    const { days, during, recovery, sleep, strain } = cycle;
    if (days.length !== 1) {
      log.warning(
        `whoop: cycle with more than one day, ignoring...\n${
          JSON.stringify(
            cycle,
            null,
            2,
          )
        }`,
      );
      return [];
    }

    // hack: if no workout was recorded, strain status is `null`
    if (strain.workouts.length === 0) {
      strain.state = "complete";
    }

    const eventDay = new Date(
      new Date(days[0]).getTime() + new Date().getTimezoneOffset() * 60 * 1000,
    );
    const states = [recovery, strain, sleep].map((x) => get(x, "state"));
    if (
      !states.every((s) => s === "complete") ||
      eventDay.toDateString() === new Date().toDateString()
    ) {
      log.info(`whoop: ignoring incomplete cycle for date ${eventDay}`);
      return [];
    }

    const recoveryEvents = [
      {
        event: "hrv",
        type: EventType.Real,
        data: recovery.heartRateVariabilityRmssd,
      },
      {
        event: "resting_heart_rate",
        type: EventType.Int,
        data: recovery.restingHeartRate,
      },
      {
        event: "recovery",
        type: EventType.Int,
        data: recovery.score,
      },
    ].map((e) => ({ time: new Date(recovery.timestamp), ...e }));

    // potential todo: individual sleeps (sleep.sleeps)
    const sleepEvents = [
      {
        event: "sleep",
        type: EventType.Json,
        data: {
          duration: sleep.qualityDuration,
          score: sleep.score,
          needs: sleep.needBreakdown,
        },
      },
    ];

    const strainEvents = [
      {
        event: "strain",
        type: EventType.Real,
        data: strain.score,
      },
    ].concat(
      strain.workouts.flatMap((workout: any) => ({
        event: "workout",
        type: EventType.Json,
        data: {
          strain: workout.score,
          duration: new Date(workout.during.upper).getTime() -
            new Date(workout.during.lower).getTime(),
          averageHeartRate: workout.averageHeartRate,
          sportId: workout.sportId,
          sport: get(sportIdToName, `${workout.sportId}`, "Other"),
        },
        time: new Date(workout.during.lower),
      })),
    );

    const events = (recoveryEvents as any).concat(sleepEvents, strainEvents);

    return events.map((e: any) => ({
      time: eventDay,
      source: { major: "whoop", minor: "api" },
      ...e,
    }));
  });

  return events;
}

class Whoop implements ICronHandler {
  username?: string;
  password?: string;

  token?: Token;

  schedule = "* * * * *";

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

  async handler() {
    if (!this.token) {
      return;
    }
    const now = new Date();
    if (now.getTime() - this.token.expires_at.getTime() < 60 * 1000) {
      await this.updateToken();
    }

    const hrEvents = await getHREvents(this.token, now);
    const cycleEvents = await getCycleEvents(this.token, now);

    const events = hrEvents.concat(cycleEvents);

    await sendEvents(events);

    if (events.length > 0) {
      log.info(
        `whoop: ingested ${events.length} events starting from ${
          events.sort((a, b) => a.time.getTime() - b.time.getTime())[0].time
        }`,
      );
    } else {
      log.info(`whoop: ingested 0 events`);
    }
  }
}

export default new Whoop();
