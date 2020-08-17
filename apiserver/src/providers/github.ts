import { config } from "../deps.ts";
import * as log from "../deps.ts";

import { sendEvents } from "../event.ts";
import { ICronHandler, EventType, Event } from "../types.ts";

// https://gist.github.com/niallo/3109252#gistcomment-2883309
function parseLinkHeader(header: string | null) {
  if (!header || header.length === 0) {
    throw new Error("input must not be of zero length");
  }

  // Split parts by comma and parse each part into a named link
  return header.split(/(?!\B"[^"]*),(?![^"]*"\B)/).reduce(
    (links: Record<string, string>, part) => {
      const section = part.split(/(?!\B"[^"]*);(?![^"]*"\B)/);
      if (section.length < 2) {
        throw new Error("section could not be split on ';'");
      }
      const url = section[0].replace(/<(.*)>/, "$1").trim();
      const name = section[1].replace(/rel="(.*)"/, "$1").trim();

      links[name] = url;

      return links;
    },
    {},
  );
}

function parsePayload(type: string, payload: any) {
  switch (type) {
    // case "CommitCommentEvent":
    case "CreateEvent":
      return payload;
    case "DeleteEvent":
      return payload;
    case "ForkEvent":
      return {
        full_name: payload.full_name,
        private: payload.private,
        description: payload.description,
      };
    // case "GollumEvent":
    case "IssueCommentEvent":
      return {
        action: payload.action,
        issue: {
          url: payload.issue.url,
          number: payload.issue.number,
          title: payload.issue.title,
        },
        comment: {
          url: payload.comment.url,
          body: payload.comment.body,
        },
      };
    case "IssuesEvent":
      return {
        action: payload.action,
        issue: {
          url: payload.issue.url,
          number: payload.issue.number,
          title: payload.issue.title,
        },
        label: payload.label,
      };
    // case "MemberEvent":
    // case "PublicEvent":
    case "PullRequestEvent":
      return {
        action: payload.action,
        number: payload.number,
        url: payload.pull_request.url,
        title: payload.pull_request.title,
      };
    case "PullRequestReviewCommentEvent":
      return {
        action: payload.action,
        comment: {
          url: payload.comment.url,
          body: payload.comment.body,
        },
        number: payload.pull_request.number,
        url: payload.pull_request.url,
        title: payload.pull_request.title,
      };
    case "PushEvent":
      return {
        ref: payload.ref,
        head: payload.head,
        before: payload.before,
        size: payload.distinct_size,
      };
    // case "ReleaseEvent"
    // case "SponsorshipEvent"
    case "WatchEvent":
      return payload;
    default:
      return null;
  }
}

async function getEvents(
  username: string,
  token: string,
  url?: string,
  paginate = true,
): Promise<Event[]> {
  const fetchUrl = url || `https://api.github.com/users/${username}/events`;
  const result = await fetch(fetchUrl, {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${token}`)}`,
    },
  });

  if (result.status >= 400) {
    throw new Error(
      `github: failed to fetch ${result.status} ${result.text()}`,
    );
  }

  const links = parseLinkHeader(result.headers.get("Link"));
  const body = await result.json();
  const events: Event[] = body.map((event: any) => ({
    // all github events are postfixed with "Event"
    event: `github_${event.type.slice(0, event.type.length - 5).toLowerCase()}`,
    source: { major: "github", minor: event.repo.name },
    time: new Date(event.created_at),
    type: EventType.Json,
    data: parsePayload(event.type, event.payload),
  })).filter((e: Event) => e.data !== null);

  if (links.next) {
    events.push(...(await getEvents(username, token, links.next, paginate)));
  }

  return events;
}

class Github implements ICronHandler {
  username?: string;
  token?: string;

  schedule = "*/5 * * * *";

  constructor() {
    this.username = config().GITHUB_USERNAME;
    this.token = config().GITHUB_ACCESS_TOKEN;

    if (!this.username || !this.token) {
      log.warning("github: username or token not specified; ignoring");
    }
  }

  async init() {}

  async handler() {
    if (!this.username || !this.token) {
      return;
    }

    const events = await getEvents(this.username, this.token);

    await sendEvents(events);

    if (events.length > 0) {
      log.info(
        `github: ingested ${events.length} events starting from ${
          events.sort((a, b) => a.time.getTime() - b.time.getTime())[0].time
        }`,
      );
    } else {
      log.info(`github: ingested 0 events`);
    }
  }
}

export default new Github();
