import * as log from "https://deno.land/std/log/mod.ts";

import awair from "./providers/awair.ts";
import whoop from "./providers/whoop.ts";

import { ICronHandler } from "./types.ts";

// forked from https://deno.land/x/cron/cron.ts
// -------------------------------- BEGIN FORK --------------------------------

type CronJob = {
  schedule: string;
  fn: () => any;
};

const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const cronParts: Record<string, (date: Date) => number> = {
  minute: date => date.getMinutes(),
  hour: date => date.getHours(),
  dayOfMonth: date => date.getDate(),
  month: date => date.getMonth() + 1,
  dayOfWeek: date => date.getDay(),
};

function cronPartMatches(now: Date, cronPart: string, part: string) {
  const currPart = cronParts[part](now);
  // A list is a set of numbers (or ranges) separated by commas.
  const opts = cronPart.split(",").map(p => p.trim());

  return opts.some(part => {
    // A field may contain an asterisk, which always stands for "first-last".
    if (cronPart === "*") return true;
    // exact match
    if (cronPart === String(currPart)) return true;
    // Names can also be used for the 'month' and 'day of week' fields.
    // Use the first three letters of the particular day or month
    // (case does not matter)
    if (part === "month" && cronPart.toLowerCase() === months[currPart + 1])
      return true;
    if (part === "dayOfWeek" && cronPart.toLowerCase() === days[currPart])
      return true;

    const rangeMatch = part.match(/(\d+)-(\d+)/);
    const stepMatch = cronPart.match(/[\d-*]+\/(\d+)/);

    let rangeMatches = true;
    let stepMatches = true;

    let rangeStart: number | undefined;
    let rangeEnd: number | undefined;

    if (rangeMatch !== null) {
      rangeStart = parseInt(rangeMatch[1]);
      rangeEnd = parseInt(rangeMatch[2]);
      rangeMatches = rangeStart <= currPart && currPart <= rangeEnd;
    }

    // Step values can be used in conjunction with ranges.
    // Following a range with "/<number>" specifies skips of the
    // number's value through the range.
    if (stepMatch !== null) {
      const step = parseInt(stepMatch[1]);
      return (currPart - (rangeStart || 0)) % step === 0;
    }

    return rangeMatches && stepMatches;
  });
}

function timeForCron(now: Date, schedule: string) {
  const crontab = schedule.split(" ");

  const matches = Object.keys(cronParts).reduce((acc, k, idx) => {
    acc[k] = cronPartMatches(now, crontab[idx], k);
    return acc;
  }, {} as Record<string, boolean>);

  // Note: The day of a command's execution can be specified in the following
  // two fields --- 'day of month', and 'day of week'.
  // If both fields are restricted (i.e., do not contain the "*" character),
  // the command will be run when either field matches the current time.
  return (
    matches.minute &&
    matches.hour &&
    matches.month &&
    (matches.dayOfMonth || matches.dayOfWeek)
  );
}

export class Cron {
  jobs: CronJob[];

  constructor() {
    this.jobs = [];
  }

  add = (schedule: string, fn: () => any) => {
    if (
      !schedule.match(/((?:[\d*-/]+|[A-Za-z]{3}) ){4}(?:[\d*-/]+|[A-Za-z]{3})/)
    ) {
      throw new Error(`invalid crontab: ${schedule}!`);
    }
    this.jobs.push({ schedule, fn });
  };

  async start() {
    const now = new Date();
    setTimeout(() => this.start(), (61 - now.getSeconds()) * 1000);

    return Promise.allSettled(
      this.jobs
        .filter(({ schedule }) => timeForCron(now, schedule))
        .map(job => job.fn())
    );
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
