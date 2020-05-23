import { config } from "https://deno.land/x/dotenv/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";

class Database {
  client: Client;

  constructor() {
    const user = config().DB_USER || "postgres";
    const database = config().DB_DB || "api";
    const hostname = config().DB_HOST || "127.0.0.1";
    const port = parseInt(config().DB_PORT || "5432");
    const password = config().DB_PASSWORD;
    this.client = new Client({
      user,
      database,
      hostname,
      port,
      password,
    });
  }
}

export default new Database().client;
