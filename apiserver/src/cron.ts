import * as log from "https://deno.land/std/log/mod.ts";
import { Cron } from "https://deno.land/x/crontab/cron.ts";

import awair from "./providers/awair.ts";
import github from "./providers/github.ts";
import rankedftw from "./providers/rankedftw.ts";
import whoop from "./providers/whoop.ts";

import { ICronHandler } from "./types.ts";

const cron = new Cron();

const jobs: Record<string, ICronHandler> = {
  awair,
  github,
  rankedftw,
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
  cron.start();
}

export default { start };
