import { DatabaseSync } from "node:sqlite";
import { Database } from "remix/data-table";
import { SqliteDatabaseAdapter } from "remix/data-table-sqlite";
import { type Middleware } from "remix/fetch-router";

import { Env } from "./data/schemas.ts";
import { parseEnv } from "./utils/parse-env.ts";

const { DATABASE_URL } = parseEnv(Env);

export function database(): Middleware {
    let sqlite = new DatabaseSync(DATABASE_URL);
    let adapter = new SqliteDatabaseAdapter(sqlite);
    let db = new Database(adapter);

    return (ctx, next) => {
        ctx.set(Database, db);
        return next();
    };
}
