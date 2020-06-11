import { config } from "https://deno.land/x/dotenv/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

import db from "../db/database.ts";
import { sendEvents } from "../event.ts";
import { ICronHandler, EventType, Event } from "../types.ts";

type LeagueData = {
  league: number;
  tier: number;
  version: number;
  data_time: number;
  season_id: number;
  race0: number;
  best_race: boolean;
  mmr: number;
  points: number;
  wins: number;
  losses: number;
  world_rank: number;
  world_count: number;
  region_rank: number;
  region_count: number;
  league_rank: number;
  league_count: number;
  ladder_rank: number;
  ladder_count: number;
  id: number;
};

const races = ["Zerg", "Protoss", "Terran"];
const leagues = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Grandmaster",
];

function getLeague(data: LeagueData) {
  return `${leagues[data.league]} ${data.tier + 1}`;
}

async function getTeamData(team: string) {
  const res = await fetch(`https://www.rankedftw.com/team/${team}/rankings/`);
  if (res.status !== 200) {
    throw new Error(`getTeamData returned ${res.status}: ${res.body}`);
  }
  const body: LeagueData[] = await res.json();
  return body.map((data) => {
    const league = getLeague(data);
    const time = new Date(1000 * data.data_time);
    const race = races[data.race0];

    const parsedData = { ...data, league, time, race };

    delete parsedData.tier;
    delete parsedData.race0;
    delete parsedData.id;
    delete parsedData.version;

    return parsedData;
  });
}

class RankedFTW implements ICronHandler {
  team?: string;
  schedule = "0 * * * *";

  constructor() {
    this.team = config().RANKEDFTW_TEAM_ID;
    if (!this.team) {
      log.warning("rankedftw: no team specified; ignoring");
    }
  }

  async init() {}

  async handler() {
    if (!this.team) {
      return;
    }

    const data = await getTeamData(this.team);
    const events = data.map((data) => {
      const { time, ...eventData } = data;
      const event: Event = {
        event: "sc2_ranking",
        source: { major: "rankedftw", minor: `${this.team}` },
        type: EventType.Json,
        data: eventData,
        time,
      };

      return event;
    });

    await sendEvents(events);

    log.info(`rankedftw: ingested ${events.length} events`);
  }
}

export default new RankedFTW();
