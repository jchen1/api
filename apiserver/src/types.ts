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
