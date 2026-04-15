import { BunSqlDatabaseAdapter } from "#/data/bun-sql-data-table.ts";
import { SQL } from "bun";
import { Database } from "remix/data-table";
import { type Middleware } from "remix/fetch-router";

import { Env } from "./data/schemas";
import { parseEnv } from "./utils/parse-env";

const { DATABASE_URL } = parseEnv(Env);

export function database(): Middleware {
    let sql = new SQL(DATABASE_URL);
    let adapter = new BunSqlDatabaseAdapter(sql, { dialect: "sqlite" });
    let db = new Database(adapter);

    return (ctx, next) => {
        ctx.set(Database, db);
        return next();
    };
}
