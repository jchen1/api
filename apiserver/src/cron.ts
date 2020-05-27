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

  matches = (cronPart: string, currPart: number): boolean => {
    const opts = cronPart.split(",").map(p => p.trim());

    return opts.some(part => {
      if (cronPart === "*") return true;
      if (cronPart === String(currPart)) return true;

      const rangeMatch = part.match(/(\d+)-(\d+)/);
      if (rangeMatch !== null) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        return start <= currPart && currPart <= end;
      }

      const stepMatch = cronPart.match(/\*\/(\d+)/);
      if (stepMatch !== null) {
        const step = parseInt(stepMatch[1]);
        return currPart % step === 0;
      }

      return false;
    });
  };

  validate = (schedule: string): boolean => {
    const now = new Date();
    const minutes = now.getMinutes();
    const hours = now.getHours();
    const dayOfMonth = now.getDate();
    const month = now.getMonth() + 1;
    const dayOfWeek = now.getDay();

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
