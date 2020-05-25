import { Cron } from "https://deno.land/x/cron/cron.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import awair from "./providers/awair.ts";
import whoop from "./providers/whoop.ts";

type Handler = {
  schedule: string;
  handler: () => void | Promise<void>;
  init: () => void | Promise<void>;
};

const jobs: Record<string, Handler> = {
  whoop: {
    // todo: fork cron to support */5 syntax
    schedule: "* * * * *",
    handler: async () => {
      await whoop.ingest();
    },
    init: async () => {
      await whoop.init();
    },
  },
  awair: {
    schedule: "0 * * * *",
    handler: async () => await awair.ingest(),
    init: async () => await awair.init(),
  },
};

const cron = new Cron();

for (const name in jobs) {
  const { schedule, handler } = jobs[name];
  cron.add(schedule, async () => {
    const start = new Date();
    log.info(`${start.toString()}: Starting job ${name}`);
    try {
      await handler();
      const end = new Date();
      log.info(
        `${end}: Finished job ${name} in ${end.getTime() - start.getTime()}ms`
      );
    } catch (err) {
      log.error(`${new Date().toString()}: Job ${name} failed!\n${err.stack}`);
    }
  });
}

async function init() {
  for (const name in jobs) {
    const { init } = jobs[name];
    await init();
  }
}

export async function start() {
  await init();
  cron.start();
}

export default { start };
