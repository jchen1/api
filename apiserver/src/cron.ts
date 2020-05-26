import * as log from "https://deno.land/std/log/mod.ts";

import awair from "./providers/awair.ts";
import whoop from "./providers/whoop.ts";

import { ICronHandler } from "./types.ts";

// forked from https://deno.land/x/cron/cron.ts
// -------------------------------- BEGIN FORK --------------------------------

export class Cron {
  cronJobs: { schedule: string; fn: void }[];
  constructor() {
    this.cronJobs = [];
  }
  add = (schedule: string, fn: any): void => {
    this.cronJobs.push({
      schedule: schedule,
      fn: fn,
    });
  };

  matches = (cronPart: string, currPart: string): boolean => {
    const currNum = parseInt(currPart);
    if (cronPart === "*") return true;
    if (cronPart === currPart) return true;

    const stepMatch = cronPart.match(/\*\/(\d+)/);
    if (stepMatch !== null) {
      const step = parseInt(stepMatch[1]);
      return currNum % step === 0;
    }

    // todo range of values, step values

    return false;
  };

  validate = (schedule: string): boolean => {
    const now = new Date();
    const minutes = String(now.getMinutes());
    const hours = String(now.getHours());
    const dayOfMonth = String(now.getDate());
    const month = String(now.getMonth() + 1);
    const dayOfWeek = String(now.getDay());

    const crontab = schedule.split(" ");
    const currTime = [minutes, hours, dayOfMonth, month, dayOfWeek];

    return currTime.every((currPart, idx) =>
      this.matches(crontab[idx], currPart)
    );
  };

  filterJobs = () => {
    let result = [];
    for (let i = 0; i < this.cronJobs.length; i++) {
      if (this.validate(this.cronJobs[i].schedule)) {
        result.push(this.cronJobs[i].fn);
      }
    }
    return result;
  };

  async start() {
    const jobs: any[] = this.filterJobs();
    setTimeout(() => {
      this.start();
    }, (61 - new Date().getSeconds()) * 1000);
    for (let i = 0; i < jobs.length; i++) {
      await jobs[i]();
    }
  }
}

// -------------------------------- END FORK --------------------------------

const cron = new Cron();

const jobs: Record<string, ICronHandler> = {
  whoop,
  awair,
};

for (const name in jobs) {
  const worker = jobs[name];
  // const { schedule, handler } = ;
  cron.add(worker.schedule, async () => {
    const start = new Date();
    log.info(`${start.toString()}: Starting job ${name}`);
    try {
      await worker.handler();
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
    await jobs[name].init();
  }
}

export async function start() {
  await init();
  cron.start();
}

export default { start };
