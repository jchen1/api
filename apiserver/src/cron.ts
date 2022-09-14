import * as log from "./deps.ts";
import { Cron } from "./deps.ts";

import airthings from "./providers/airthings.ts";
import awair from "./providers/awair.ts";
import github from "./providers/github.ts";
import rankedftw from "./providers/rankedftw.ts";
import weatherkit from "./providers/weatherkit.ts";
import whoop from "./providers/whoop.ts";

import { ICronHandler } from "./types.ts";

const cron = new Cron();

const jobs: Record<string, ICronHandler> = {
  airthings,
  awair,
  github,
  rankedftw,
  weatherkit,
  whoop,
};

async function run(name: string) {
  const worker = jobs[name];
  const start = new Date();
  log.info(`${start.toString()}: Starting job ${name}`);
  try {
    await worker.handler();
    const end = new Date();
    log.info(
      `${end}: Finished job ${name} in ${end.getTime() - start.getTime()}ms`,
    );
  } catch (err) {
    log.error(`${new Date().toString()}: Job ${name} failed!\n${err.stack}`);
  }
}

for (const name in jobs) {
  const worker = jobs[name];
  cron.add(worker.schedule, async () => {
    await run(name);
  });
}

async function init() {
  for (const name in jobs) {
    await jobs[name].init();
  }
}

export async function start() {
  await init();
  for (const name in jobs) {
    await run(name);
  }
  return cron.start();
}

export default { start };
