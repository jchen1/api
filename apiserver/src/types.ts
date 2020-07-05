export type EventSource = {
  major: string;
  minor: string;
};

export enum EventType {
  Int = "int",
  BigInt = "bigint",
  Real = "real",
  Text = "text",
  Json = "json",
}

export type Event = {
  event: string;
  source: EventSource;
  type: EventType;
  data: any;
  time: Date;
};

export type AggregatedEvent = Event & {
  count: number;
};

export type DBEvent = {
  event: string;
  source_major: string;
  source_minor: string;
  type: EventType;
  ts: Date;
  count?: number;
  data_int?: number;
  data_bigint?: number;
  data_real?: number;
  data_text?: string;
  data_json?: any;
};

export interface ICronHandler {
  schedule: string;
  handler: () => void | Promise<void>;
  init: () => void | Promise<void>;
}

export enum QueryPeriodType {
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Month = "month",
  Year = "year",
}

export type EventsQueryOpts = {
  limit?: number;
  period?: QueryPeriodType;
  include?: string[];
};
