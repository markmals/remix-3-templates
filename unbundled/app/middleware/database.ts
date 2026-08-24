import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import { DatabaseSync } from "node:sqlite";
import { Database } from "remix/data-table";
import { createSqliteDatabase } from "remix/data-table/sqlite";
import { type Middleware } from "remix/router";

const { DATABASE_URL } = parseEnv(Env);

export function loadDatabase(): Middleware<{
    key: typeof Database;
    value: Database;
    property: "db";
}> {
    let sqlite = new DatabaseSync(DATABASE_URL);
    let db = createSqliteDatabase(sqlite);

    return (context, next) => {
        context.set(Database, db, { property: "db" });
        return next();
    };
}
