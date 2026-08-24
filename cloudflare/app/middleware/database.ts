import { createD1Database } from "@pitlane/data-table-d1";
import { env } from "cloudflare:workers";
import { Database } from "remix/data-table";
import { type Middleware } from "remix/router";

export function loadDatabase(): Middleware<{
    key: typeof Database;
    value: Database;
    property: "db";
}> {
    // Built once per isolate: the binding is stable, so there is nothing to
    // rebuild per request.
    let db = createD1Database(env.DB);

    return (context, next) => {
        context.set(Database, db, { property: "db" });
        return next();
    };
}
