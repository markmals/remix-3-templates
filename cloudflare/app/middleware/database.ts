import { createD1DatabaseAdapter } from "#/data/d1-data-table.ts";
import { env } from "cloudflare:workers";
import { createDatabase, Database } from "remix/data-table";
import { type Middleware } from "remix/router";

export function loadDatabase(): Middleware<{
    key: typeof Database;
    value: Database;
    property: "db";
}> {
    let adapter = createD1DatabaseAdapter(env.DB);
    let db = createDatabase(adapter);

    return (context, next) => {
        context.set(Database, db, { property: "db" });
        return next();
    };
}
