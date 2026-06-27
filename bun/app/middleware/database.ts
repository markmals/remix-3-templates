import { Env } from "#/data/schemas.ts";
import { parseEnv } from "#/utils/parse-env.ts";
import { DatabaseSync } from "node:sqlite";
import { createDatabase, Database } from "remix/data-table";
import { createSqliteDatabaseAdapter } from "remix/data-table/sqlite";
import { type Middleware } from "remix/router";

const { DATABASE_URL } = parseEnv(Env);

export function loadDatabase(): Middleware<{
    key: typeof Database;
    value: Database;
    property: "db";
}> {
    let sqlite = new DatabaseSync(DATABASE_URL);
    let adapter = createSqliteDatabaseAdapter(sqlite);
    let db = createDatabase(adapter);

    return (context, next) => {
        context.set(Database, db, { property: "db" });
        return next();
    };
}
