import { Event, EventType, ICronHandler } from "../types.ts";
import { config } from "../deps.ts";
import * as log from "../deps.ts";
import { sendEvents } from "../event.ts";
import { toFahrenheit } from "../util.ts";

const locations: Record<string, [number, number]> = {
  "Livingston": [45.6614, -110.5600],
  "Dublin": [37.7159, -121.9101],
  "Estill Springs": [35.2706, -86.1280],
};

type WeatherKitResponse = {
  currentWeather: {
    asOf: string;
    cloudCover?: number; // 0-1
    conditionCode: string;
    daylight?: boolean;
    humidity: number; // 0-1
    precipitationIntensity: number; // mm/h
    pressure: number; // mbar
    pressureTrend: "rising" | "falling" | "steady";
    temperature: number; // celsius
    temperatureApparent: number; // celsius
    temperatureDewPoint: number; // celsius
    uvIndex: number;
    visibility: number; // meters
    windDirection?: number; // degrees
    windGust?: number; // km/h
    windSpeed: number; // km/h
  };
};

type PartialEvent = Pick<Event, "event" | "type" | "data">;

class WeatherKit implements ICronHandler {
  token?: string;

  schedule = "* * * * *";

  constructor() {
    this.token = config().WEATHERKIT_API_TOKEN;

    if (!this.token) {
      log.warning("weatherkit: token not specified; ignoring");
    }
  }

  init() {}

  async handler() {
    if (!this.token) {
      return;
    }

    const events = await this.getEvents();
    await sendEvents(events);

    log.info(`weatherkit: ingested ${events.length} events`);
  }

  private async getEvents(): Promise<Event[]> {
    const events: Event[] = [];
    for (const location of Object.keys(locations)) {
      const [lat, long] = locations[location];
      const data: WeatherKitResponse = await (await fetch(
        `https://weatherkit.apple.com/api/v1/weather/US/${lat}/${long}?dataSets=currentWeather`,
        {
          headers: {
            "Authorization": `Bearer ${this.token}`,
          },
        },
      )).json();

      const time = new Date(data.currentWeather.asOf);
      const source = { major: "weatherkit", minor: location };

      const locationEvents: Event[] = [
        {
          event: "temp",
          type: EventType.Real,
          data: toFahrenheit(data.currentWeather.temperature),
        },
        {
          event: "humid",
          type: EventType.Real,
          data: data.currentWeather.humidity * 100,
        },
        data.currentWeather.cloudCover !== undefined && {
          event: "cloud_cover",
          type: EventType.Real,
          data: data.currentWeather.cloudCover * 100,
        },
        {
          event: "precipitation_intensity",
          type: EventType.Real,
          data: data.currentWeather.precipitationIntensity,
        },
        {
          event: "pressure",
          type: EventType.Real,
          data: data.currentWeather.pressure,
        },
        {
          event: "uv_index",
          type: EventType.Int,
          data: data.currentWeather.uvIndex,
        },
        {
          event: "wind",
          type: EventType.Json,
          data: {
            windDirection: data.currentWeather.windDirection,
            windGust: data.currentWeather.windGust,
            windSpeed: data.currentWeather.windSpeed,
          },
        },
      ].filter<PartialEvent>((e): e is PartialEvent => typeof e === "object")
        .map<Event>((
          e,
        ) => ({
          ...e,
          time,
          source,
        }));

      events.push(...locationEvents);
    }
    return events;
  }
}

export default new WeatherKit();
