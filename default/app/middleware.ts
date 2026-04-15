import { NodeSqliteDatabaseAdapter } from "#/data/node-sqlite-data-table.ts";
import { DatabaseSync } from "node:sqlite";
import { Database } from "remix/data-table";
import { type Middleware } from "remix/fetch-router";

import { Env } from "./data/schemas.ts";
import { parseEnv } from "./utils/parse-env.ts";

const { DATABASE_URL } = parseEnv(Env);

export function database(): Middleware {
    let sqlite = new DatabaseSync(DATABASE_URL);
    let adapter = new NodeSqliteDatabaseAdapter(sqlite);
    let db = new Database(adapter);

    return (ctx, next) => {
        ctx.set(Database, db);
        return next();
    };
}
