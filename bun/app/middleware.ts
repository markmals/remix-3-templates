import { Database as Sqlite } from "bun:sqlite";
import { Database } from "remix/data-table";
import { SqliteDatabaseAdapter } from "remix/data-table/sqlite";
import { type Middleware } from "remix/router";

import { Env } from "./data/schemas";
import { parseEnv } from "./utils/parse-env";

const { DATABASE_URL } = parseEnv(Env);

export function database(): Middleware {
    let sqlite = new Sqlite(DATABASE_URL);
    let adapter = new SqliteDatabaseAdapter(sqlite);
    let db = new Database(adapter);

    return (ctx, next) => {
        ctx.set(Database, db);
        return next();
    };
}
